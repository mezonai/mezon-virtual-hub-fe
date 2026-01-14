import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Sprite, Toggle} from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { ClanWarehouseSlotDTO, HarvestCountDTO } from '../Farm/EnumPlant';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { Constants } from '../utilities/Constants';
import { ItemType, StatsConfigDTO } from '../Model/Item';
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
    private warehouseData: ClanWarehouseSlotDTO[] = [];

    private plantUIItems: InventoryClanUIItem[] = [];
    private toolUIItems: InventoryClanUIItem[] = [];

    private hasBuiltUI = false;
    private currentMode: ItemType | null = null;

    private configRate!: StatsConfigDTO;
    private harvestCountDTO!: HarvestCountDTO;

    public init(param?: PopupClanInventoryParam) {
        if (!param) return;
        this.clanDetail = param.clanDetail;

        this.closeButton.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });

        this.tabPlantButton.node.on(
            Toggle.EventType.TOGGLE,
            (t: Toggle) => t.isChecked && this.switchMode(ItemType.FARM_PLANT),
            this
        );

        this.tabToolButton.node.on(
            Toggle.EventType.TOGGLE,
            (t: Toggle) => t.isChecked && this.switchMode(ItemType.FARM_TOOL),
            this
        );
        LoadingManager.getInstance().openLoading();
        this.infoTool.active = false;
        this.infoPlant.active = true;
        this.loadHarvestInfo();
        this.loadWarehouse();
        LoadingManager.getInstance().closeLoading();
    }

    private async loadHarvestInfo() {
        try {
            this.configRate = await WebRequestManager.instance.getConfigRateAsync();
            this.harvestCountDTO = await WebRequestManager.instance.getHarvestCountsAsync(this.clanDetail.id);

            this.limitHarvestNode.active = this.configRate.farmLimit.harvest.enabledLimit;
            this.setCountLabel(
                this.harvertCountrt,
                this.harvestCountDTO.harvest_count_use,
                this.configRate.farmLimit.harvest.maxHarvest
            );
            this.setCountLabel(
                this.harvertInterrupCountrt,
                this.harvestCountDTO.harvest_interrupt_count_use,
                this.configRate.farmLimit.harvest.maxInterrupt
            );
        } catch (e) {
            console.error('loadHarvestInfo error', e);
        }
    }

    private async loadWarehouse() {
        try {
            this.warehouseData = await WebRequestManager.instance.getClanWarehousesAsync(this.clanDetail.id);
            this.noItemPanel.active = !this.warehouseData.length;
            if (!this.warehouseData.length) return;

            if (!this.hasBuiltUI) {
                this.buildInventoryUI(this.warehouseData);
                this.hasBuiltUI = true;
            }

            this.switchMode(ItemType.FARM_PLANT);
        } catch (e) {
            console.error('loadWarehouse error', e);
        }

    }

    private buildInventoryUI(data: ClanWarehouseSlotDTO[]) {
        this.svInvenoryClan.content.removeAllChildren();
        this.svInvenoryClanTool.content.removeAllChildren();
        this.plantUIItems = [];
        this.toolUIItems = [];

        for (const slot of data) {
            const node = instantiate(this.itemPrefab);
            const uiItem = node.getComponent(InventoryClanUIItem);
            if (!uiItem) continue;

            if (slot.plant) {
                uiItem.initPlant(slot, () => this.showPlantDetail(slot));
                this.plantUIItems.push(uiItem);
                node.setParent(this.svInvenoryClan.content);
            }
            else if (slot.item) {
                uiItem.initTool(slot, () => this.showToolDetail(slot));
                this.toolUIItems.push(uiItem);
                node.setParent(this.svInvenoryClanTool.content);
            }
        }
    }

    private switchMode(mode: ItemType) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        this.updateTabVisibility();
    }

    private updateTabVisibility() {
        const isPlant = this.currentMode === ItemType.FARM_PLANT;

        this.infoPlant.active = isPlant;
        this.infoTool.active = !isPlant;

        this.plantUIItems.forEach(i => i.node.active = isPlant);
        this.toolUIItems.forEach(i => i.node.active = !isPlant);

        if (isPlant) this.selectFirstPlant();
        else this.selectFirstTool();
    }

    private selectFirstPlant() {
        if (!this.plantUIItems.length) return;
        const item = this.plantUIItems[0];
        item.toggle.isChecked = true;
        item.onItemClick();
    }

    private selectFirstTool() {
        if (!this.toolUIItems.length) return;
        const item = this.toolUIItems[0];
        item.toggle.isChecked = true;
        item.onItemClick();
    }

    private showPlantDetail(slot: ClanWarehouseSlotDTO) {
        const sprite = ItemIconManager.getInstance().getIconPlantFarm(slot.plant.name);
        if (sprite) {
            this.iconPlant.spriteFrame = sprite;
            this.iconSeed.spriteFrame = sprite;
        }

        this.seedBags.node.active = !slot.is_harvested;
        this.iconPlant.node.active = slot.is_harvested;

        this.descriptionrt.string = `${slot.plant.description}`;
        this.plantNamert.string = `<outline color=#222 width=1> ${Constants.getPlantName(slot.plant.name)}</outline>`;
        this.growTimert.string = `<outline color=#222 width=1> ${slot.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222 width=1> ${slot.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222 width=1> ${slot.plant.buy_price}</outline>`;
    }

    private async showToolDetail(slot: ClanWarehouseSlotDTO) {
        this.iconTool.node.active = true;
        this.iconTool.spriteFrame = await ItemIconManager.getInstance().getIconItemDto(slot.item);

        const percent = Math.round(slot.item.rate * 100);
        this.toolDescriptionrt.string = `${slot.item.name}\n[ ${percent}% ]`;
        this.toolNamert.string = `<outline color=#222 width=1> ${slot.item.name}</outline>`;
        this.useTime.string = `<outline color=#222 width=1> ${percent}%</outline>`;
        this.toolpriceBuyrt.string = `<outline color=#222 width=1> ${slot.item.gold}</outline>`;
    }

    private setCountLabel(label: RichText, used: number, max: number) {
        const isMax = used >= max;
        const color = isMax ? '#ff4d4d' : '#ffffff';
        const suffix = isMax ? ' (Hết lượt)' : '';
        label.string = `<outline color=#222 width=1><color=${color}> ${used}/${max}${suffix} </color></outline>`;
    }
}

export interface PopupClanInventoryParam {
    clanDetail: ClansData;
    onUpdateFund?: (newFund: number) => void;
}