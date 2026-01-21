import { _decorator, Node, RichText } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { WebRequestManager } from '../../network/WebRequestManager';
import { BuyItemPayload, Food, InventoryType, Item, PurchaseMethod } from '../../Model/Item';
import { ResourceManager } from '../../core/ResourceManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { ShopUIItem } from './ShopUIItem';
import { BaseInventoryManager } from '../player/inventory/BaseInventoryManager';
import Utilities from '../../utilities/Utilities';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupBuyQuantityItem, PopupBuyQuantityItemParam } from '../../PopUp/PopupBuyQuantityItem';
import { TabController } from '../../ui/TabController';
import { IconItemUIHelper } from '../../Reward/IconItemUIHelper';
import { Constants } from '../../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('ShopPetController')
export class ShopPetController extends BaseInventoryManager {
    @property({ type: TabController }) tabController: TabController = null;
    //@property({ type: UIPopup }) noticePopup: UIPopup = null;
    @property({ type: RichText }) itemPrice: RichText = null;
    @property({ type: RichText }) descriptionFood: RichText = null;
    @property({ type: Node }) itemPriceContainer: Node = null;
    @property({ type: Node }) catchRateBonusPriceContainer: Node = null;
    protected override groupedItems: Record<string, Food[]> = null;
    protected override selectingUIItem: ShopUIItem = null;
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;

    private quantityBuy: number = 1;
    private isOpenPopUp: boolean = false;

    protected override async actionButtonClick() {
        try {
            let confirm = null;
            await this.showPopupAndReset()
                .then((value) => {
                    confirm = value;
                })
                .catch(() => { })
            if (confirm) {
                const result = await this.buyItem();
                await this.getAllFoodAsync();
                this.addItemToInventory(result);
                this.ResetQuantity();
            }

        } catch (error) {
            Constants.showConfirm(error.message, "Chú ý");
        }
    }

    protected override closeUIBtnClick() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }

    private async showPopupAndReset(): Promise<boolean> {
        let result = await new Promise<boolean>((resolve, reject) => {
            this.ResetQuantity();
            if (this.isOpenPopUp || !this.selectingUIItem?.dataFood?.price || this.selectingUIItem.dataFood.price <= 0) {
                reject(false);
                return;
            }

            this.isOpenPopUp = true;
            const param: PopupBuyQuantityItemParam = {
                selectedItemPrice: this.selectingUIItem.dataFood.price,
                spriteMoneyValue: this.iconItemUIHelper.GetIcon(),
                textButtonLeft: "Thôi",
                textButtonRight: "Mua",
                onActionButtonLeft: () => {
                    reject(false);
                },
                onActionButtonRight: (quantity: number) => {
                    this.quantityBuy = quantity;
                    resolve(true);
                },
                onActionClose: () => {
                    this.isOpenPopUp = false;
                },
            };
            PopupManager.getInstance().openAnimPopup("PopupBuyQuantityItem", PopupBuyQuantityItem, param);
        });

        return result;
    }

    private addItemToInventory(response) {
        UserMeManager.playerCoin = response.data.user_balance.gold;
        UserMeManager.playerDiamond = response.data.user_balance.diamond;
        Constants.showConfirm("Mua thành công!", "Thông báo");
    }

    private async buyItem() {
        const food = this.selectingUIItem?.dataFood;
        if (!food) return;
        const totalPrice = food.price * this.quantityBuy;
        if (food.purchase_method.toString() === PurchaseMethod.GOLD.toString()) {
            this.checkGoldUser(totalPrice);
        } else {
            this.checkDiamondUser(totalPrice);
        }

        try {
            const payload: BuyItemPayload = {
                itemId: this.selectingUIItem.dataFood.id,
                quantity: this.quantityBuy,
                type: InventoryType.FOOD
            };
            const result = await this.postBuyFoodAsync(payload);
            return result;
        } catch (error) {
            throw error;
        }
    }

    private postBuyFoodAsync(payload: BuyItemPayload): Promise<any> {
        return new Promise((resolve, reject) => {

            WebRequestManager.instance.postBuyItem(payload, resolve, reject);
        });
    }

    private getAllFoodAsync() {
        WebRequestManager.instance.getUserProfile(
            (response) => {
                UserMeManager.Set = response.data;
            },
            (error) => this.onApiError(error)
        );
    }

    private onApiError(error) {
        Constants.showConfirm(error.error_message, "Chú ý");
    }

    private checkGoldUser(price: number) {
        if (UserMeManager.playerCoin < price) {
            throw new Error("Không đủ vàng để mua.");
        }
    }

    private checkDiamondUser(price: number) {
        if (UserMeManager.playerDiamond < price) {
            throw new Error("Không đủ kim cương để mua.");
        }
    }

    public init(param: InteractShopPetParam) {
        super.init();
        this.initGroupData();
        this.onTabChange(this.categories[0]);
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
    }

    protected override reset() {
        super.reset();
        this.itemPriceContainer.active = false;
        this.catchRateBonusPriceContainer.active = false;
    }

    protected override initGroupData() {

        this.groupedItems = this.groupByCategory(ResourceManager.instance.FoodData.data);
        this.categories = [];

        for (const category in this.groupedItems) {
            this.categories.push(category);

            this.groupedItems[category].forEach((item, index) => {
                item.iconSF = [];
            });
        }
        this.tabController.initTabData(this.categories);
        this.tabController.node.on(EVENT_NAME.ON_CHANGE_TAB, (tabName) => { this.onTabChange(tabName); });
    }

    protected override async registUIItemData(itemNode: Node, food: Food,
        onClick?: (uiItem: ShopUIItem, data: any) => void) {
        let uiItem = itemNode.getComponent(ShopUIItem);
        if (onClick) {
            uiItem.onClick = onClick;
        }
        uiItem.resetData();
        uiItem.setIconByFood(food);
        uiItem.setScaleByItemType();
        uiItem.initFood(food);
        uiItem.toggleActive(false);
        uiItem.reset();
    }

    protected override async onTabChange(tabName: string) {
        await super.onTabChange(tabName);
        this.scheduleOnce(() => {
            this.showDefaultItemFallback();
        }, 0);
    }

    private showDefaultItemFallback() {
        const content = this.otherScrollView?.content;
        if (!content || content.children.length === 0) return;

        const firstNode = content.children[0];
        const uiItem = firstNode.getComponent(ShopUIItem);
        if (!uiItem) return;

        if (this.selectingUIItem) {
            this.selectingUIItem.toggleActive(false);
        }

        this.selectingUIItem = uiItem;
        uiItem.toggleActive(true);

        this.onUIItemClick(uiItem, uiItem.dataFood);
    }

    protected override resetSelectItem() {
        if (this.selectingUIItem) {
            this.selectingUIItem.reset();
            this.selectingUIItem.toggleActive(false);
            this.selectingUIItem = null;
        }
        this.reset();
        this.actionButton.interactable = false;
    }

    private ResetQuantity() {
        this.quantityBuy = 1;
    }

    protected onDisable(): void {
        this.resetSelectItem();
    }

    protected override onUIItemClick(uiItem: ShopUIItem, data: Food) {
        if (!uiItem || !data) return;

        if (this.selectingUIItem && this.selectingUIItem !== uiItem) {
            this.selectingUIItem.toggleActive(false);
        }
        this.selectingUIItem = uiItem;
        this.actionButton.interactable = uiItem != null;
        this.descriptionText.string = data.name;
        this.descriptionFood.string = data.description;
        this.itemPrice.string = Utilities.convertBigNumberToStr(data.price);
        this.itemPriceContainer.active = true;
        this.catchRateBonusPriceContainer.active = true;
        this.iconItemUIHelper.setIconByPurchaseMethod(data.purchase_method);
        this.quantityBuy = 1;
    }

    protected override groupByCategory(items: Food[]): Record<string, Food[]> {
        const grouped = items.reduce((acc, item) => {
            const key = InventoryType.FOOD;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {} as Record<string, Food[]>);
        return grouped;
    }
}

export interface InteractShopPetParam {
    onActionClose?: () => void;
}