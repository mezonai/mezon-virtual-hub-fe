import { _decorator, Node, RichText, Sprite } from 'cc';
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
                this.addItemToInventory(result);
                this.resetSelectItem();
            }

        } catch (error) {
            UIManager.Instance.showNoticePopup("Chú ý", error.message);
        }
    }

    private async showPopupAndReset(): Promise<boolean> {
        let result = await new Promise<boolean>((resolve, reject) => {
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
        if (food.purchase_method.toString() === PurchaseMethod.GOLD.toString()) {
            this.checkGoldUser(food.price);
        } else {
            this.checkDiamondUser(food.price);
        }
        try {
            const result = await this.postBuyFoodAsync(this.selectingUIItem.dataFood.id, InventoryType.FOOD);

            return result;
        } catch (error) {
            throw error;
        }
    }

    private postBuyFoodAsync(data: any, type: any): Promise<any> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postBuyFood(data, type, resolve, reject);
        });
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

    public override init() {
        this.initGroupData();
    }

    protected override reset() {
        super.reset();
        this.actionButton.interactable = true;
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
        this.selectingUIItem.reset();
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
        this.catchRateBonusPrice.string = Utilities.convertBigNumberToStr(data.catch_rate_bonus);
        this.itemPrice.string = Utilities.convertBigNumberToStr(data.price);
        this.itemPriceContainer.active = true;
        this.catchRateBonusPriceContainer.active = true;
        this.setupMoneyReward(uiItem, data.purchase_method.toString())
        this.selectingUIItem.toggleActive(true);
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