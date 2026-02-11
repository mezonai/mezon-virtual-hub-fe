import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Sprite, Toggle } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { ClanWarehouseSlotDTO, HarvestCountDTO } from '../Farm/EnumPlant';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { Constants } from '../utilities/Constants';
import { ClanPetDTO, InventoryClanType, ItemType, PetClanDTO, StatsConfigDTO } from '../Model/Item';
import { LoadingManager } from './LoadingManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { PetActionType } from './PopupOwnedAnimals';
import { ServerManager } from '../core/ServerManager';
import { UserMeManager } from '../core/UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanInventory')
export class PopupClanInventory extends BasePopup {
    @property(Button) closeButton: Button = null!;

    @property(Node) infoPlant: Node = null!;
    @property(Node) infoTool: Node = null!;
    @property(Node) infoPet: Node = null!;

    @property(ScrollView) svInvenoryClanPlant: ScrollView = null!;
    @property(ScrollView) svInvenoryClanTool: ScrollView = null!;
    @property(ScrollView) svInvenoryClanPet: ScrollView = null!;
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

    @property(RichText) petNamert: RichText = null;
    @property(Label) petDescriptionrt: Label = null;
    @property(RichText) petRateAffect: RichText = null;
    @property(RichText) petLevelrt: RichText = null;
    @property(RichText) petExprt: RichText = null;
    @property(Prefab) itemToolExChange: Prefab = null!;
    @property(Node) itemPetExChange: Node = null!;
    @property(ScrollView) svInventoryClanPetExChange: ScrollView = null!;
    @property({ type: Sprite }) progressBarExp: Sprite = null;
    @property({ type: Node }) bringNode: Node = null;
    @property({ type: Button }) summonButton: Button = null;
    @property({ type: Button }) bringButton: Button = null;

    @property(Node) noItemPanel: Node = null!;
    @property(Sprite) seedBags: Sprite = null!;
    @property(Node) limitHarvestNode: Node = null!;
    @property(Sprite) iconSeed: Sprite = null!;
    @property(Sprite) iconPlant: Sprite = null!;
    @property(Sprite) iconTool: Sprite = null!;
    @property(Sprite) iconPet: Sprite = null!;

    @property(RichText) harvertCountrt: RichText = null!;
    @property(RichText) harvertInterrupCountrt: RichText = null!;

    @property(Toggle) tabPlantTog: Toggle = null!;
    @property(Toggle) tabToolTog: Toggle = null!;
    @property(Toggle) tabPetTog: Toggle = null!;

    private clanDetailId!: string;

    private plantSlots: ClanWarehouseSlotDTO[] = [];
    private toolSlots: ClanWarehouseSlotDTO[] = [];
    private petSlots: ClanPetDTO[] = [];

    private plantUIItems: InventoryClanUIItem[] = [];
    private toolUIItems: InventoryClanUIItem[] = [];
    private petUIItems: InventoryClanUIItem[] = [];

    private selectingUIItem: InventoryClanUIItem = null;
    private selectingUITool: InventoryClanUIItem = null;
    private selectingUIPet: InventoryClanUIItem = null;

    private isPlantLoaded = false;
    private isToolLoaded = false;
    private isPetLoaded = false;

    private currentMode: ItemType = null;

    private configRate!: StatsConfigDTO;
    private harvestCountDTO!: HarvestCountDTO;

    public init(param?: PopupClanInventoryParam) {
        if (!param){
            this.closePopup();
            return;
        }
        this.clanDetailId = param.clanDetailId;
        if (param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }

        this.closeButton.addAsyncListener(async () => {
            this.bringButton.interactable = false;
            this.closePopup();
            this.bringButton.interactable = true;
        });

        this.bringButton.addAsyncListener(async () => {
            this.bringButton.interactable = false;
            await this.onBringPet(PetActionType.BRING);
            this.bringButton.interactable = true;
        });

        this.summonButton.addAsyncListener(async () => {
            this.summonButton.interactable = false;
            await this.onBringPet(PetActionType.REMOVE);
            this.summonButton.interactable = true;
        });
        this.tabPlantTog.node.on(
            Toggle.EventType.TOGGLE,
            t => t.isChecked && this.switchMode(ItemType.FARM_PLANT),
            this
        );

        this.tabToolTog.node.on(
            Toggle.EventType.TOGGLE,
            t => t.isChecked && this.switchMode(ItemType.FARM_TOOL),
            this
        );

        this.tabPetTog.node.on(
            Toggle.EventType.TOGGLE,
            t => t.isChecked && this.switchMode(ItemType.PET_CLAN),
            this
        );
        this.svInvenoryClanPlant.node.active = false;
        this.svInvenoryClanTool.node.active = false;
        this.svInvenoryClanPet.node.active = false;
        this.loadHarvestInfo();
        this.switchMode(ItemType.FARM_PLANT);
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    private async switchMode(mode: ItemType) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;

        LoadingManager.getInstance().openLoading();
        switch (mode) {
            case ItemType.FARM_PLANT:
                await this.loadPlantData();
                this.showPlantUI();
                break;
            case ItemType.FARM_TOOL:
                await this.loadToolData();
                this.showToolUI();
                break;
            case ItemType.PET_CLAN:
                await this.loadPetData();
                this.showPetUI();
                break;
        }
    }

    private async loadPlantData() {
        try {
            if (this.isPlantLoaded) return;

            this.plantSlots = await WebRequestManager.instance.getClanWarehousesAsync(
                this.clanDetailId,
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
            if (this.isToolLoaded) return;

            this.toolSlots = await WebRequestManager.instance.getClanWarehousesAsync(
                this.clanDetailId,
                { type: InventoryClanType.TOOLS }
            );

            this.buildToolUI();
            this.isToolLoaded = true;
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private async loadPetData() {
        try {
            if (this.isPetLoaded) return;
            this.petSlots = await WebRequestManager.instance.getClanPetAsync(
                this.clanDetailId
            );

            this.buildPetUI();
            this.isPetLoaded = true;
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private buildPlantUI() {
        this.svInvenoryClanPlant.content.removeAllChildren();
        this.plantUIItems = [];
        if (!this.plantSlots.length) return;

        for (const slot of this.plantSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initPlant(slot, () => this.showPlantDetail(ui));
            node.setParent(this.svInvenoryClanPlant.content);
            this.plantUIItems.push(ui);
        }
    }

    private buildToolUI() {
        this.svInvenoryClanTool.content.removeAllChildren();
        this.toolUIItems = [];
        if (!this.toolSlots.length) return;

        for (const slot of this.toolSlots) {
            if(slot.type === InventoryClanType.PETCLANSLOTCARD.toString()) continue;
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initTool(slot, () => this.showToolDetail(ui));
            node.setParent(this.svInvenoryClanTool.content);
            this.toolUIItems.push(ui);
        }
    }

    private buildPetUI() {
        this.svInvenoryClanPet.content.removeAllChildren();
        this.petUIItems = [];
        if (!this.petSlots.length) return;

        for (const slot of this.petSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initPet(slot, () => this.showPetDetail(ui));
            node.setParent(this.svInvenoryClanPet.content);
            this.petUIItems.push(ui);
        }
    }

    private showPlantUI() {
        this.infoPlant.active = true;
        this.infoTool.active = false;
        this.infoPet.active = false;
        this.svInvenoryClanPlant.node.active = true;
        this.svInvenoryClanTool.node.active = false;
        this.svInvenoryClanPet.node.active = false;
        this.noItemPanel.active = this.plantSlots.length === 0;
        this.selectFirstPlant();
    }

    private showToolUI() {
        this.infoPlant.active = false;
        this.infoTool.active = true;
        this.infoPet.active = false;
        this.svInvenoryClanPlant.node.active = false;
        this.svInvenoryClanTool.node.active = true;
        this.svInvenoryClanPet.node.active = false;
        this.noItemPanel.active = this.toolSlots.length === 0;
        this.selectFirstTool();
    }

    private showPetUI() {
        this.infoPlant.active = false;
        this.infoTool.active = false;
        this.infoPet.active = true;
        this.svInvenoryClanPlant.node.active = false;
        this.svInvenoryClanTool.node.active = false;
        this.svInvenoryClanPet.node.active = true;
        this.noItemPanel.active = this.petSlots.length === 0;
        this.selectFirstpet();
    }

    private selectFirstPlant() {
        if (!this.plantUIItems.length) return;
        this.plantUIItems[0].toggle.isChecked = true;
        this.showPlantDetail(this.plantUIItems[0]);
    }

    private selectFirstTool() {
        if (!this.toolUIItems.length) return;
        this.toolUIItems[0].toggle.isChecked = true;
        this.showToolDetail(this.toolUIItems[0]);
    }

    private selectFirstpet() {
        if (!this.petUIItems.length) return;
        this.petUIItems[0].toggle.isChecked = true;
        this.showPetDetail(this.petUIItems[0]);
    }

    private showPlantDetail(slot: InventoryClanUIItem) {
        this.selectingUIItem = slot;
        const sprite = ItemIconManager.getInstance().getIconFarmPlant(slot.plant.plant.name);
        if (sprite) {
            this.iconPlant.spriteFrame = sprite;
            this.iconSeed.spriteFrame = sprite;
        }

        this.seedBags.node.active = !slot.plant.is_harvested;
        this.iconPlant.node.active = slot.plant.is_harvested;

        this.descriptionrt.string = ` ${slot.plant.plant.description} `;
        this.plantNamert.string = ` <outline color=#222 width=1> ${Constants.getPlantName(slot.plant.plant.name)} </outline> `;
        this.growTimert.string = ` <outline color=#222 width=1> ${slot.plant.plant.grow_time}s </outline>`;
        this.harvestScorert.string = ` <outline color=#222 width=1> ${slot.plant.plant.harvest_point} </outline> `;
        this.priceBuyrt.string = ` <outline color=#222 width=1> ${slot.plant.plant.buy_price} </outline> `;
    }

    private async showToolDetail(slot: InventoryClanUIItem) {
        this.selectingUITool = slot;
        const sprite = await ItemIconManager.getInstance().getIconItemDto(slot.tool.item);
        if (this.currentMode !== ItemType.FARM_TOOL) return;
        this.iconTool.spriteFrame = sprite;
        const percent = Math.round(slot.tool.item.rate * 100);
        this.toolDescriptionrt.string = ` Công cụ hỗ trợ giúp bạn sử dụng trong nông trại ${slot.tool.item.name} với tỉ lệ dùng [ ${percent}% ] `;
        this.toolNamert.string = ` <outline color=#222 width=1> ${slot.tool.item.name} </outline> `;
        this.useTime.string = ` <outline color=#222 width=1> ${percent}% </outline>`;
        this.toolpriceBuyrt.string = ` <outline color=#222 width=1> ${slot.tool.item.gold} </outline> `;
    }

    private async showPetDetail(pet: InventoryClanUIItem) {
        this.selectingUIPet = pet;
        this.iconPet.spriteFrame = ItemIconManager.getInstance().getIconFarmPet(Constants.getPetClanType(pet.pet.pet_clan.pet_clan_code.toString()));
        this.petNamert.string = `<outline color=#222222 width=1> ${Constants.getPlantName(pet.pet.pet_clan.name)}</outline>`;
        this.petDescriptionrt.string = ` ${pet.pet.pet_clan.description}`;
        this.petRateAffect.string = `<outline color=#222222 width=1> ${pet.pet.total_rate_affect} %</outline>`;
        this.petLevelrt.string = `<outline color=#222222 width=1> ${pet.pet.level} </outline>`;
        this.petExprt.string = `<outline color=#222222 width=1> ${pet.pet.exp} / ${pet.pet.required_exp} </outline>`;
        this.progressBarExp.fillRange = Math.min(pet.pet.exp / pet.pet.required_exp, 1);
        this.updatePetActionButtons(pet.pet.id, pet.pet.is_active);
    }

    public updatePetActionButtons(petID: string, isActive: boolean) {

        const petData = this.petSlots.find(p => p.id === petID);
        if (petData) {
            petData.is_active = isActive;
        }

        const currentAnimalSlot = this.petUIItems.find(slot => slot.pet.id === petID);
        if (currentAnimalSlot) {
            currentAnimalSlot.pet.is_active = isActive;
            currentAnimalSlot.setBringPet(isActive);
        }

        this.bringButton.node.active = !isActive;
        this.summonButton.node.active = isActive;
        this.bringNode.active = isActive;
    }

    async onBringPet(petActionType: PetActionType) {
        switch (petActionType) {
            case PetActionType.BRING:
                this.HandleSendPetInFarm();
                break;
            case PetActionType.REMOVE:
                this.HandleSendPetOutFarm();
                break;
        }
    }

    private async HandleSendPetInFarm() {
        ServerManager.instance.sendActivateGuardPet({
            clan_id: UserMeManager.Get.clan.id,
            id: this.selectingUIPet.pet.id,
        });
    }

    private async HandleSendPetOutFarm() {
        ServerManager.instance.sendDeactivateGuardPet({
            clan_id: UserMeManager.Get.clan.id,
            id: this.selectingUIPet.pet.id,
        });
    }

    private async loadHarvestInfo() {
        this.configRate = await WebRequestManager.instance.getConfigRateAsync();
        this.harvestCountDTO = await WebRequestManager.instance.getHarvestCountsAsync(this.clanDetailId);

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
    clanDetailId: string;
    onUpdateFund?: (newFund: number) => void;
    onActionClose?: () => void;
}