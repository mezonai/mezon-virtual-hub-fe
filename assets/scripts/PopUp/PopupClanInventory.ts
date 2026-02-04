import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Sprite, Toggle} from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { ClanWarehouseSlotDTO, HarvestCountDTO } from '../Farm/EnumPlant';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { Constants } from '../utilities/Constants';
import { InventoryClanType, ItemType, StatsConfigDTO } from '../Model/Item';
import { LoadingManager } from './LoadingManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanInventory')
export class PopupClanInventory extends BasePopup {
    @property(Button) closeButton: Button = null!;

    @property(Node) infoPlant: Node = null!;
    @property(Node) infoTool: Node = null!;

    @property(ScrollView) svInvenoryClan: ScrollView = null!;
    @property(ScrollView) svInvenoryClanTool: ScrollView = null!;
    @property(Prefab) itemPrefab: Prefab = null!;

    @property(RichText) plantNamert: RichText = null!;
    @property(Label) descriptionrt: Label = null!;
    @property(RichText) growTimert: RichText = null!;
    @property(RichText) harvestScorert: RichText = null!;
    @property(RichText) priceBuyrt: RichText = null!;
    
    @property(Label) toolDescriptionrt: Label = null!;
    @property(RichText) toolNamert: RichText = null!;
    @property(RichText) useTime: RichText = null!;
    @property(RichText) toolpriceBuyrt: RichText = null!;

    @property(Node) noItemPanel: Node = null!;
    @property(Sprite) seedBags: Sprite = null!;
    @property(Node) limitHarvestNode: Node = null!;
    @property(Sprite) iconSeed: Sprite = null!;
    @property(Sprite) iconPlant: Sprite = null!;
    @property(Sprite) iconTool: Sprite = null!;

    @property(RichText) harvertCountrt: RichText = null!;
    @property(RichText) harvertInterrupCountrt: RichText = null!;

    @property(Toggle) tabPlantButton: Toggle = null!;
    @property(Toggle) tabToolButton: Toggle = null!;

    private clanDetail!: ClansData;

    private plantSlots: ClanWarehouseSlotDTO[] = [];
    private toolSlots: ClanWarehouseSlotDTO[] = [];

    private plantUIItems: InventoryClanUIItem[] = [];
    private toolUIItems: InventoryClanUIItem[] = [];

    private isPlantLoaded = false;
    private isToolLoaded = false;

    private currentMode: ItemType = null;

    private configRate!: StatsConfigDTO;
    private harvestCountDTO!: HarvestCountDTO;

    public init(param?: PopupClanInventoryParam) {
        if (!param) return;
        this.clanDetail = param.clanDetail;

        this.closeButton.addAsyncListener(() =>
            PopupManager.getInstance().closePopup(this.node.uuid)
        );

        this.tabPlantButton.node.on(
            Toggle.EventType.TOGGLE,
            t => t.isChecked && this.switchMode(ItemType.FARM_PLANT),
            this
        );

        this.tabToolButton.node.on(
            Toggle.EventType.TOGGLE,
            t => t.isChecked && this.switchMode(ItemType.FARM_TOOL),
            this
        );

        this.loadHarvestInfo();
        this.switchMode(ItemType.FARM_PLANT);
    }

    private async switchMode(mode: ItemType) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;

        LoadingManager.getInstance().openLoading();

        if (mode === ItemType.FARM_PLANT) {
            await this.loadPlantData();
            this.showPlantUI();
        } else {
            await this.loadToolData();
            this.showToolUI();
        }

        LoadingManager.getInstance().closeLoading();
    }

    private async loadPlantData() {
        try {
            LoadingManager.getInstance().openLoading();
            if (this.isPlantLoaded) return;

            this.plantSlots = await WebRequestManager.instance.getClanWarehousesAsync(
                this.clanDetail.id,
                { type: InventoryClanType.PLANT }
            );

            this.buildPlantUI();
            this.isPlantLoaded = true;
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private async loadToolData() {
        try {
            LoadingManager.getInstance().openLoading();
            if (this.isToolLoaded) return;

            this.toolSlots = await WebRequestManager.instance.getClanWarehousesAsync(
                this.clanDetail.id,
                { type: InventoryClanType.TOOLS }
            );

            this.buildToolUI();
            this.isToolLoaded = true;
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private buildPlantUI() {
        this.svInvenoryClan.content.removeAllChildren();
        this.plantUIItems = [];
        if (!this.plantSlots.length) return;

        for (const slot of this.plantSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initPlant(slot, () => this.showPlantDetail(slot));
            node.setParent(this.svInvenoryClan.content);
            this.plantUIItems.push(ui);
        }
    }

    private buildToolUI() {
        this.svInvenoryClanTool.content.removeAllChildren();
        this.toolUIItems = [];
        if (!this.toolSlots.length) return;

        for (const slot of this.toolSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initTool(slot, () => this.showToolDetail(slot));
            node.setParent(this.svInvenoryClanTool.content);
            this.toolUIItems.push(ui);
        }
    }

    private showPlantUI() {
        this.infoPlant.active = true;
        this.infoTool.active = false;
        this.svInvenoryClan.node.active = true;
        this.svInvenoryClanTool.node.active = false;
        this.noItemPanel.active = this.plantSlots.length === 0;
        this.selectFirstPlant();
    }

    private showToolUI() {
        this.infoPlant.active = false;
        this.infoTool.active = true;
        this.svInvenoryClan.node.active = false;
        this.svInvenoryClanTool.node.active = true;
        this.noItemPanel.active = this.toolSlots.length === 0;
        this.selectFirstTool();
    }

    private selectFirstPlant() {
        if (!this.plantUIItems.length) return;
        this.plantUIItems[0].toggle.isChecked = true;
        this.showPlantDetail(this.plantSlots[0]);
    }

    private selectFirstTool() {
        if (!this.toolUIItems.length) return;
        this.toolUIItems[0].toggle.isChecked = true;
        this.showToolDetail(this.toolSlots[0]);
    }

    private showPlantDetail(slot: ClanWarehouseSlotDTO) {
        const sprite = ItemIconManager.getInstance().getIconPlantFarm(slot.plant.name);
        if (sprite) {
            this.iconPlant.spriteFrame = sprite;
            this.iconSeed.spriteFrame = sprite;
        }

        this.seedBags.node.active = !slot.is_harvested;
        this.iconPlant.node.active = slot.is_harvested;

        this.descriptionrt.string = ` ${slot.plant.description} `;
        this.plantNamert.string = ` <outline color=#222 width=1> ${Constants.getPlantName(slot.plant.name)} </outline> `;
        this.growTimert.string = ` <outline color=#222 width=1> ${slot.plant.grow_time}s </outline>`;
        this.harvestScorert.string = ` <outline color=#222 width=1> ${slot.plant.harvest_point} </outline> `;
        this.priceBuyrt.string = ` <outline color=#222 width=1> ${slot.plant.buy_price} </outline> `;
    }

    private async showToolDetail(slot: ClanWarehouseSlotDTO) {
        const itemId = slot.item.id;
        const sprite = await ItemIconManager.getInstance().getIconItemDto(slot.item);
        if (this.currentMode !== ItemType.FARM_TOOL) return;
        this.iconTool.spriteFrame = sprite;
        const percent = Math.round(slot.item.rate * 100);
        this.toolDescriptionrt.string = ` Công cụ hỗ trợ giúp bạn sử dụng trong nông trại ${slot.item.name} với tỉ lệ dùng [ ${percent}% ] `;
        this.toolNamert.string = ` <outline color=#222 width=1> ${slot.item.name} </outline> `;
        this.useTime.string = ` <outline color=#222 width=1> ${percent}% </outline>`;
        this.toolpriceBuyrt.string = ` <outline color=#222 width=1> ${slot.item.gold} </outline> `;
    }

    private async loadHarvestInfo() {
        this.configRate = await WebRequestManager.instance.getConfigRateAsync();
        this.harvestCountDTO = await WebRequestManager.instance.getHarvestCountsAsync(this.clanDetail.id);

        this.limitHarvestNode.active = this.configRate.farmLimit.harvest.enabledLimit;
        this.setCountLabel(this.harvertCountrt,
            this.harvestCountDTO.harvest_count_use,
            this.configRate.farmLimit.harvest.maxHarvest
        );
        this.setCountLabel(this.harvertInterrupCountrt,
            this.harvestCountDTO.harvest_interrupt_count_use,
            this.configRate.farmLimit.harvest.maxInterrupt
        );
    }

    private setCountLabel(label: RichText, used: number, max: number) {
        const isMax = used >= max;
        const color = isMax ? '#ff4d4d' : '#ffffff';
        const suffix = isMax ? ' (Hết lượt)' : '';
        label.string = `<outline color=#222 width=1><color=${color}>${used}/${max}${suffix}</color></outline>`;
    }
}

export interface PopupClanInventoryParam {
    clanDetail: ClansData;
    onUpdateFund?: (newFund: number) => void;
}