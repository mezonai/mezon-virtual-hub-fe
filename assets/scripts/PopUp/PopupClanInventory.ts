import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Sprite } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { UserMeManager } from '../core/UserMeManager';
import { ClanWarehouseSlotDTO, HarvestCountDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { PopupClanShop } from './PopupClanShop';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { Constants } from '../utilities/Constants';
import { StatsConfigDTO } from '../Model/Item';
import { LoadingManager } from './LoadingManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanInventory')
export class PopupClanInventory extends BasePopup {
    @property(Button) closeButton: Button = null;

    @property(Node) detailMain: Node = null;
    @property(Node) infoPlant: Node = null;
    @property(RichText) plantNamert: RichText = null;
    @property(Label) descriptionrt: Label = null;
    @property(RichText) growTimert: RichText = null;
    @property(RichText) harvestScorert: RichText = null;
    @property(RichText) priceBuyrt: RichText = null;

    @property(Node) infoTool: Node = null;
    @property(RichText) toolNamert: RichText = null;
    @property(RichText) useTime: RichText = null;
    @property(RichText) toolpriceBuyrt: RichText = null;

    @property(Node) noItemPanel: Node = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svInvenoryClan: ScrollView = null!;

    @property(RichText) harvertCountrt: RichText = null;
    @property(RichText) harvertInterrupCountrt: RichText = null;
    @property(Sprite) seedBags: Sprite = null;
    @property({type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property(Sprite) iconSeed: Sprite = null;
    @property(Node) limitHarvestNode: Node = null;

    private clanDetail: ClansData;
    private clanWarehouseSlot: ClanWarehouseSlotDTO[];
    private _clanWarehouseSlot: InventoryClanUIItem[];
    private timeoutLoadSlot: number = 50;
    getConfigRate: StatsConfigDTO;
    private harvestCountDTO: HarvestCountDTO;

    public async init(param?: PopupClanInventoryParam) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.detailMain.active = false;
        if (!param) return;
        this.clanDetail = param.clanDetail;
        await this.LoadInventoryUI();
    }

    private async LoadInventoryUI() {
        try {
            LoadingManager.getInstance().openLoading();
            this.GetHarvestCounts();
            this.GetClanWareHouse();
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    setCountLabel = (label, used, max) => {
        const isMaxed = used >= max;
        const color = isMaxed ? '#ff4d4d' : '#ffffff';
        const suffix = isMaxed ? ' (Hết lượt)' : '';
        label.string = `<outline color=#222 width=1><color=${color}> ${used}/${max}${suffix} </color></outline>`;
    };

    async GetHarvestCounts(){
        this.getConfigRate = await WebRequestManager.instance.getConfigRateAsync();
        this.harvestCountDTO = await WebRequestManager.instance.getHarvestCountsAsync(this.clanDetail.id);
        this.limitHarvestNode.active = this.getConfigRate.farmLimit.harvest.enabledLimit;
        this.setCountLabel(this.harvertCountrt, this.harvestCountDTO.harvest_count_use, this.getConfigRate.farmLimit.harvest.maxHarvest);
        this.setCountLabel(this.harvertInterrupCountrt, this.harvestCountDTO.harvest_interrupt_count_use, this.getConfigRate.farmLimit.harvest.maxInterrupt);
    }

    public async GetClanWareHouse() {
        this.clanWarehouseSlot = await WebRequestManager.instance.getClanWarehousesAsync(this.clanDetail.id);
        this.noItemPanel.active = !this.clanWarehouseSlot || this.clanWarehouseSlot.length === 0;
        if (!this.clanWarehouseSlot || this.clanWarehouseSlot.length === 0) return;
        this.detailMain.active = true;
        this.InitItemInventory(this.clanWarehouseSlot);
    }

    public InitItemInventory(data: ClanWarehouseSlotDTO[]) {
        this.svInvenoryClan.content.removeAllChildren();
        this._clanWarehouseSlot = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemPrefab);
            const plantItem = slotNode.getComponent(InventoryClanUIItem);

            if (plantItem) {
                if(element.plant){
                    plantItem.initPlant(element, () => {
                        this.showSlotDetail(element);
                    });
                }
                if(element.item){
                    plantItem.initTool(element, () => {
                    this.showSlotDetailFarmTool(element);
                });
                }
                
            }

            slotNode.setParent(this.svInvenoryClan.content);
            this._clanWarehouseSlot.push(plantItem);
        }
        setTimeout(() => {
            this.setDefaultDetailItem();
        }, this.timeoutLoadSlot);
    }

    public setDefaultDetailItem() {
        if (!this._clanWarehouseSlot || this._clanWarehouseSlot.length === 0) return;
        const firstItem = this._clanWarehouseSlot[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    private showSlotDetail(clanWarehouseSlotDTO: ClanWarehouseSlotDTO) {
        const sprite = this.iconItemUIHelper.getPlantIcon(clanWarehouseSlotDTO.plant.name);
        if (sprite){
            this.iconItemUIHelper.icon.spriteFrame = sprite;
            this.iconSeed.spriteFrame = sprite;
        } 
        this.harvestScorert.node.active = true;
        this.infoPlant.active = true;
        this.infoTool.active = false;
        this.seedBags.node.active = !clanWarehouseSlotDTO.is_harvested;
        this.iconItemUIHelper.node.active = clanWarehouseSlotDTO.is_harvested;
        this.descriptionrt.string = `${clanWarehouseSlotDTO.plant.description}`;
        this.plantNamert.string = `<outline color=#222222 width=1> ${Constants.getPlantName(clanWarehouseSlotDTO.plant.name)}</outline>`;
        this.growTimert.string = `<outline color=#222222 width=1> ${clanWarehouseSlotDTO.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222222 width=1> ${clanWarehouseSlotDTO.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222222 width=1> ${clanWarehouseSlotDTO.plant.buy_price}</outline>`;
    }

    private async showSlotDetailFarmTool(clanWarehouseSlotDTO: ClanWarehouseSlotDTO) {
        this.harvestScorert.node.active = false;
        this.iconItemUIHelper.node.active = true;
        this.infoPlant.active = false;
        this.infoTool.active = true;
        this.iconItemUIHelper.setIconByItem(clanWarehouseSlotDTO.item);
        this.descriptionrt.string = `${clanWarehouseSlotDTO.item.name} \n [ ${Math.round(clanWarehouseSlotDTO.item.rate * 100)} ] %`;
        this.toolNamert.string = `<outline color=#222222 width=1> ${clanWarehouseSlotDTO.item.name}</outline>`;
        this.useTime.string = `<outline color=#222222 width=1> ${Math.round(clanWarehouseSlotDTO.item.rate * 100)} %</outline>`;
        this.toolpriceBuyrt.string = `<outline color=#222222 width=1> ${clanWarehouseSlotDTO.item.gold}</outline>`;
    }
}

export interface PopupClanInventoryParam {
    clanDetail: ClansData;
    onUpdateFund?: (newFund: number) => void;
}
