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
const { ccclass, property } = _decorator;

@ccclass('PopupClanInventory')
export class PopupClanInventory extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(RichText) plantNamert: RichText = null;
    @property(Label) descriptionrt: Label = null;
    @property(RichText) growTimert: RichText = null;
    @property(RichText) harvestScorert: RichText = null;
    @property(RichText) priceBuyrt: RichText = null;
    @property(Button) ShopClanButton: Button = null;
    @property(Node) noItemPanel: Node = null;
    @property(Node) detailMain: Node = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svInvenoryClan: ScrollView = null!;

    @property(RichText) harvertCountrt: RichText = null;
    @property(RichText) harvertInterrupCountrt: RichText = null;
    @property(RichText) timeResetHarvest: RichText = null;
    @property(Sprite) seedBags: Sprite = null;
    @property({type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property(Sprite) iconSeed: Sprite = null;

    private clanDetail: ClansData;
    private clanWarehouseSlot: ClanWarehouseSlotDTO[];
    private _clanWarehouseSlot: InventoryClanUIItem[];
    private timeoutLoadSlot: number = 50;
    
    private harvestCountDTO: HarvestCountDTO;

    public init(param?: PopupClanInventoryParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.detailMain.active = false;
        if (!param) return;
        this.clanDetail = param.clanDetail;
        this.ShopClanButton.addAsyncListener(async () => {
            this.ShopClanButton.interactable = false;

            await PopupManager.getInstance().openAnimPopup("UI_ClanShop", PopupClanShop, {
                clanDetail: this.clanDetail,
                onBuySuccess: async () => {
                   this.GetClanWareHouse();
                }
            });

            this.ShopClanButton.interactable = true;
        });
        this.GetHarvestCounts();
        this.CheckShowMemberManager();
        this.GetClanWareHouse();
    }

    setCountLabel = (label, used, max) => {
        const isMaxed = used >= max;
        const color = isMaxed ? '#ff4d4d' : '#ffffff';
        const suffix = isMaxed ? ' (Hết lượt)' : '';
        label.string = `<outline color=#222 width=1><color=${color}> ${used}/${max}${suffix} </color></outline>`;
    };

    async GetHarvestCounts(){
        this.harvestCountDTO = await WebRequestManager.instance.getHarvestCountsAsync(this.clanDetail.id);
        this.setCountLabel(this.harvertCountrt, this.harvestCountDTO.harvest_count_use, this.harvestCountDTO.harvest_count);
        this.setCountLabel(this.harvertInterrupCountrt, this.harvestCountDTO.harvest_interrupt_count_use, this.harvestCountDTO.harvest_interrupt_count);
        this.timeResetHarvest.string = `<outline color=#222222 width=1> Đặt lại số lần thu hoạch đã dùng hàng ngày</outline>`;
    }

    CheckShowMemberManager() {
        const leaderId = this.clanDetail?.leader?.id;
        const viceLeaderId = this.clanDetail?.vice_leader?.id;
        const canManage = UserMeManager.Get.user.id === leaderId || UserMeManager.Get.user.id === viceLeaderId;
        this.ShopClanButton.node.active = !!canManage;
    }

    public async GetClanWareHouse() {
        this.clanWarehouseSlot = await WebRequestManager.instance.getClanWarehousesAsync(UserMeManager.CurrentOffice.idclan);
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
                plantItem.initPlant(element, (item) => {
                    this.showSlotDetail(item);
                });
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

    private showSlotDetail(item: InventoryClanUIItem) {
        const sprite = this.iconItemUIHelper.getPlantIcon(item.clanWarehouseSlotDTO.plant.name);
        if (sprite){
            this.iconItemUIHelper.icon.spriteFrame = sprite;
            this.iconSeed.spriteFrame = sprite;
        } 
        this.seedBags.node.active = !item.clanWarehouseSlotDTO.is_harvested;
        this.iconItemUIHelper.node.active = item.clanWarehouseSlotDTO.is_harvested;
        this.descriptionrt.string = `${item.clanWarehouseSlotDTO.plant.description}`;
        this.plantNamert.string = `<outline color=#222222 width=1> ${Constants.getPlantName(item.clanWarehouseSlotDTO.plant.name)}</outline>`;
        this.growTimert.string = `<outline color=#222222 width=1> ${item.clanWarehouseSlotDTO.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222222 width=1> ${item.clanWarehouseSlotDTO.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222222 width=1> ${item.clanWarehouseSlotDTO.plant.buy_price}</outline>`;
    }
}

export interface PopupClanInventoryParam {
    clanDetail: ClansData;
    onUpdateFund?: (newFund: number) => void;
}
