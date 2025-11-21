import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { PlantDataDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { ShopClanItem } from '../Clan/ShopClanItem';
import { PopupBuyQuantityItem, PopupBuyQuantityItemParam } from '../PopUp/PopupBuyQuantityItem';
import { Constants } from '../utilities/Constants';
import { BuyItemPayload, InventoryType, PurchaseMethod, RewardType } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { Sprite } from 'cc';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanShop')
export class PopupClanShop extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) buyButton: Button = null;
    @property(RichText) plantNamert: RichText = null;
    @property(Label) descriptionrt: Label = null;
    @property(RichText) growTimert: RichText = null;
    @property(RichText) harvestScorert: RichText = null;
    @property(RichText) priceBuyrt: RichText = null;
    @property(Node) noItemPanel: Node = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svShopClan: ScrollView = null!;
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Sprite }) sprite: IconItemUIHelper = null;

    private clanDetail: ClansData;
    private plantDataDTO: PlantDataDTO[] = [];
    private _plantDataDTO: ShopClanItem[] = [];
    private timeoutLoadSlot: number = 50;
    private selectingUIItem: ShopClanItem = null;
    private quantityBuy: number = 1;
    private isOpenPopUp: boolean = false;
    private param: PopupClanShopParam = null;

    public init(param?: PopupClanShopParam): void {

        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });

        if (param) {
            this.param = param;
            this.clanDetail = param?.clanDetail;
        }

        this.buyButton.addAsyncListener(async () => {
            this.buyButton.interactable = false;
            await this.actionBuy();
            this.buyButton.interactable = true;
        });

        this.initList();
    }

    async initList() {
        this.plantDataDTO = await WebRequestManager.instance.getShopPlantAsync();
        this.loadFromServer(this.plantDataDTO);
    }

    public loadFromServer(data: PlantDataDTO[]) {
        this.svShopClan.content.removeAllChildren();
        this._plantDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemPrefab);
            const plantItem = slotNode.getComponent(ShopClanItem);
            if (plantItem) {
                plantItem.initPlant(element, (slot) => {
                    this.showSlotDetail(slot);
                });
            }
            slotNode.setParent(this.svShopClan.content);
            this._plantDataDTO.push(plantItem);
        }

        setTimeout(() => {
            this.setDefaultDetailItem();
        }, this.timeoutLoadSlot);
    }

    public setDefaultDetailItem() {
        if (!this._plantDataDTO || this._plantDataDTO.length === 0) return;
        const firstItem = this._plantDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    private showSlotDetail(item: ShopClanItem) {
        this.selectingUIItem = item;
        const sprite = this.iconItemUIHelper.getPlantIcon(item.plant.name);
        if (sprite) this.iconItemUIHelper.icon.spriteFrame = sprite;

        this.descriptionrt.string = ` ${item.plant.description}`;
        this.plantNamert.string = `<outline color=#222222 width=1> ${item.plant.name}</outline>`;
        this.growTimert.string = `<outline color=#222222 width=1> ${item.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222222 width=1> ${item.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222222 width=1> ${item.plant.buy_price}</outline>`;
    }

    private showBuyQuantityPopup(): Promise<number> {
        return new Promise((resolve) => {
            if (this.isOpenPopUp || !this.selectingUIItem?.plant?.buy_price) {
                resolve(null);
                return;
            }
            this.isOpenPopUp = true;
            const param: PopupBuyQuantityItemParam = {
                selectedItemPrice: this.selectingUIItem.plant.buy_price,
                spriteMoneyValue: ItemIconManager.getInstance().getIconPurchaseMethod(RewardType.GOLD),
                textButtonLeft: "Thôi",
                textButtonRight: "Mua",
                onActionButtonLeft: () => {
                    resolve(null);
                },
                onActionButtonRight: (quantity: number) => {
                    resolve(quantity);
                },
                onActionClose: () => {
                    this.isOpenPopUp = false;
                }
            };
            PopupManager.getInstance().openAnimPopup( "PopupBuyQuantityItem",PopupBuyQuantityItem,param);
        });
    }

    async actionBuy() {
        try {
            const quantity = await this.showBuyQuantityPopup();
            if (!quantity) {
                return;
            }
            this.quantityBuy = quantity;
            await this.buyItem();
        } catch (error) {
            Constants.showConfirm(error.message, "Chú ý");
        }
    }

    private async buyItem() {
        const plant = this.selectingUIItem?.plant;
        if (!plant) {
            return;
        }
        const value = await WebRequestManager.instance.getClanFundAsync(UserMeManager.Get.clan.id);
        const fund = value?.funds.find(f => f.type === "gold")?.amount ?? 0;
        const totalPrice = plant.buy_price * this.quantityBuy;
        if (fund < totalPrice) {
            Constants.showConfirm("Không đủ vàng trong quỹ văn phòng.");
            return;
        }

        const payload: BuyItemPayload = {
            clanId: this.clanDetail.id,
            itemId: plant.id,
            quantity: this.quantityBuy,
            type: InventoryType.PLANT,
        };
        ServerManager.instance.sendBuyItem(payload);
    }

    public async ReloadAfterBuyItem() {
        this.quantityBuy = 1;
        this.param.onBuySuccess?.();
    }
}

export interface PopupClanShopParam {
    clanDetail: ClansData;
    onBuySuccess?: () => void;
}

