import { _decorator, Button, EditBox, Label, Node, RichText, Sprite } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { UIManager } from '../../core/UIManager';
import { WebRequestManager } from '../../network/WebRequestManager';
import { Food, InventoryType, Item, PurchaseMethod } from '../../Model/Item';
import { ResourceManager } from '../../core/ResourceManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { ShopUIItem } from './ShopUIItem';
import { BaseInventoryManager } from '../player/inventory/BaseInventoryManager';
import { LocalItemDataConfig } from '../../Model/LocalItemConfig';
import UIPopup from '../../ui/UI_Popup';
import Utilities from '../../utilities/Utilities';
import { GameManager } from '../../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('ShopPetController')
export class ShopPetController extends BaseInventoryManager {
    @property({ type: UIPopup }) noticePopup: UIPopup = null;
    @property({ type: RichText }) itemPrice: RichText = null;
    @property({ type: RichText }) catchRateBonusPrice: RichText = null;
    @property({ type: Node }) itemPriceContainer: Node = null;
    @property({ type: Node }) catchRateBonusPriceContainer: Node = null;
    protected override groupedItems: Record<string, Food[]> = null;
    protected override selectingUIItem: ShopUIItem = null;
    @property({ type: Sprite }) iconFrame: Sprite = null;
    @property({ type: Sprite }) iconMoneyFrame: Sprite = null;


    @property({ type: EditBox }) quantityItemFood: EditBox = null;
    @property({ type: Button }) increaseQuantityBtn: Button = null;
    @property({ type: Button }) decreaseQuantityBtn: Button = null;
    @property({ type: Label }) priceBuyQuantity: Label = null;

    private quantity: number = 1;
    private quantityLimit: number = 1;
    private quantityIncreaseBtn: number = 1;

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
            UIManager.Instance.showNoticePopup("Chú ý", error.message);
        }
    }

    private async showPopupAndReset(): Promise<boolean> {
        let result = await new Promise<boolean>((resolve, reject) => {
            this.ResetQuantity();
            this.noticePopup.showYesNoPopup(
                null,
                Utilities.convertBigNumberToStr(this.selectingUIItem.dataFood.price),
                () => {
                    resolve(true);
                },
                null, null,
                () => {
                    reject(false);
                }
            );
        });

        return result;
    }

    private addItemToInventory(response) {
        UserMeManager.playerCoin = response.data.user_balance.gold;
        UserMeManager.playerDiamond = response.data.user_balance.diamond;
        UIManager.Instance.showNoticePopup("Thông báo", "Mua thành công!");
    }

    private async buyItem() {
        const food = this.selectingUIItem?.dataFood;
        if (!food) return;
        const totalPrice = food.price * this.quantity;
        if (food.purchase_method.toString() === PurchaseMethod.GOLD.toString()) {
            this.checkGoldUser(totalPrice);
        } else {
            this.checkDiamondUser(totalPrice);
        }

        try {
            const result = await this.postBuyFoodAsync(this.selectingUIItem.dataFood.id, this.quantity, InventoryType.FOOD);
            return result;
        } catch (error) {
            throw error;
        }
    }

    private postBuyFoodAsync(data: any, quantity: any, type: any): Promise<any> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postBuyFood(data, quantity, type, resolve, reject);
        });
    }

    private getAllFoodAsync() {
        WebRequestManager.instance.getUserProfile(
            (response) => {
                UserMeManager.Set = response.data;
                GameManager.instance.inventoryController.addFoodToInventory(UserMeManager.GetFoods);
            },
            (error) => this.onApiError(error)
        );
    }

    private onApiError(error) {
        UIManager.Instance.showNoticePopup("Chú ý", error.error_message);
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

    private setupQuantityHandlers() {
        this.increaseQuantityBtn.node.on(Button.EventType.CLICK, this.onIncreaseQuantity, this);
        this.decreaseQuantityBtn.node.on(Button.EventType.CLICK, this.onDecreaseQuantity, this);
        this.quantityItemFood.node.on(EditBox.EventType.TEXT_CHANGED, this.onQuantityChanged, this);
    }

    private onIncreaseQuantity() {
        this.quantity += this.quantityIncreaseBtn;
        this.updateQuantityUI();
    }

    private onDecreaseQuantity() {
        this.quantity = Math.max(this.quantity - this.quantityIncreaseBtn, this.quantityLimit);
        this.updateQuantityUI();
    }

    private onQuantityChanged(editbox: EditBox) {
       const cleanString = editbox.string.replace(/[^0-9]/g, '');
        if (editbox.string !== cleanString) {
            editbox.string = cleanString;
        }

        const value = parseInt(cleanString);
        this.quantity = isNaN(value) || value < this.quantityLimit ? this.quantityLimit : value;

        this.updateQuantityUI();
    }

    private updateQuantityUI() {
        this.quantityItemFood.string = this.quantity.toString();

        if (this.selectingUIItem?.dataFood) {
            const totalPrice = this.selectingUIItem.dataFood.price * this.quantity;
            this.priceBuyQuantity.string = Utilities.convertBigNumberToStr(totalPrice);
        }
        this.decreaseQuantityBtn.interactable = this.quantity > this.quantityLimit;
    }

    public override init() {
        this.initGroupData();
        this.setupQuantityHandlers();
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


    protected override getLocalData(item: Item) {
        if (item.gender != "not specified" && item.gender != UserMeManager.Get.user.gender) return null;
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: Food, skinLocalData: LocalItemDataConfig) {
        let uiItem = itemNode.getComponent(ShopUIItem);
        uiItem.resetData();
        this.setupFoodReward(uiItem, item.type);
        uiItem.initFood(item);
        uiItem.toggleActive(false);
    }

    public override setupFoodReward(uiItem: any, foodType: string) {
        const normalizedType = foodType.replace(/-/g, "");
        const sprite = this.foodIconMap[normalizedType];
        if (sprite) {
            uiItem.avatar.spriteFrame = sprite;
        }
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
        this.quantity = 1;
        this.updateQuantityUI();
    }

    protected onDisable(): void {
        this.resetSelectItem();
    }

    protected override onUIItemClickFood(uiItem: ShopUIItem, data: Food) {
        if (this.selectingUIItem) {
            this.selectingUIItem.toggleActive(false);

            if (this.selectingUIItem == uiItem) {
                this.reset();
                return;
            }
        }

        super.onUIItemClickFood(uiItem, data);

        this.descriptionText.string = data.name;
        this.catchRateBonusPrice.string = Utilities.convertBigNumberToStr(data.catch_rate_bonus) + " %";
        this.itemPrice.string = Utilities.convertBigNumberToStr(data.price);
        this.itemPriceContainer.active = true;
        this.catchRateBonusPriceContainer.active = true;
        const sprite = this.moneyIconMap[data.purchase_method.toString()];
        if (sprite) {
            this.iconFrame.spriteFrame = sprite;
            this.iconMoneyFrame.spriteFrame = sprite;
        }
        this.quantity = 1;
        this.updateQuantityUI();
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