import { _decorator, Node, RichText } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { WebRequestManager } from '../../network/WebRequestManager';
import { BuyItemPayload, InventoryType, Item, ItemType } from '../../Model/Item';
import { ResourceManager } from '../../core/ResourceManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { ShopUIItem } from './ShopUIItem';
import { BaseInventoryManager } from '../player/inventory/BaseInventoryManager';
import { LocalItemDataConfig } from '../../Model/LocalItemConfig';
import UIPopup from '../../ui/UI_Popup';
import Utilities from '../../utilities/Utilities';
import { PopupManager } from '../../PopUp/PopupManager';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { PopupBuyItem, PopupBuyItemParam } from '../../PopUp/PopupBuyItem';
import { Vec3 } from 'cc';
import { TabController } from '../../ui/TabController';
const { ccclass, property } = _decorator;

@ccclass('ShopController')
export class ShopController extends BaseInventoryManager {
    @property({ type: TabController }) tabController: TabController = null;
    @property({ type: RichText }) itemPrice: RichText = null;
    @property({ type: Node }) itemPriceContainer: Node = null;
    protected override groupedItems: Record<string, Item[]> = null;
    protected override selectingUIItem: ShopUIItem = null;
    private isOpenPopUp: boolean = false;
    private quantityBuy: number = 1;

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
            const param: ConfirmParam = {
                message: error.message,
                title: "Chú ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
        }
    }

    protected override closeUIBtnClick() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }

    private async showPopupAndReset(): Promise<boolean> {
        let result = await new Promise<boolean>((resolve, reject) => {
             if (this.isOpenPopUp || !this.selectingUIItem?.data?.gold || this.selectingUIItem.data.gold <= 0) 
            {
                reject(false);
                return;
            }
            if (this.isOpenPopUp) return;
            this.isOpenPopUp = true;
            const param: PopupBuyItemParam = {
                selectedItemPrice: Utilities.convertBigNumberToStr(this.selectingUIItem.data.gold),
                textButtonLeft: "Thôi",
                textButtonRight: "Mua",
                onActionButtonLeft: () => {
                    reject(false);
                },
                onActionButtonRight: () => {
                    resolve(true);
                },
                onActionClose: () => {
                    this.isOpenPopUp = false;
                },
            };
            PopupManager.getInstance().openAnimPopup("PopupBuyItem", PopupBuyItem, param);
        });

        return result;
    }

    private addItemToInventory(response) {
        UserMeManager.Get.inventories.push(response.data.inventory_data);
        UserMeManager.playerCoin = response.data.user_gold;
        const param: ConfirmParam = {
            message: "Mua thành công!",
            title: "Thông báo",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
        this.onTabChange(this.currentTabName);
    }

    private async buyItem() {
        // Check if user has enough money
        if (UserMeManager.playerCoin < this.selectingUIItem.data.gold) {
            throw new Error("Không đủ tiền để mua");
        }

        try {
            const payload: BuyItemPayload = {
                itemId: this.selectingUIItem.data.id,
                quantity: this.quantityBuy,
                type: InventoryType.ITEM
            };
            const result = await this.postBuySkinAsync(payload);
            return result;
        } catch (error) {
            throw error;
        }
    }

    private postBuySkinAsync(payload: BuyItemPayload): Promise<any> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postBuyItem(payload, resolve, reject);
        });
    }

    public init(param: InteractShopParam) {
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
    }

    protected override initGroupData() {
        this.groupedItems = this.groupByCategory(ResourceManager.instance.ItemData.data);
        this.categories = [];
        for (const category in this.groupedItems) {
            if (category === InventoryType.FOOD) {
                continue;
            }
            this.categories.push(category);
            this.groupedItems[category].forEach((item, index) => {
                item.iconSF = [];
            });
        }
        this.tabController.initTabData(this.categories);
        this.tabController.node.on(EVENT_NAME.ON_CHANGE_TAB, (tabName) => { this.onTabChange(tabName); });
        // this.previewPlayer.init([]);
    }

    protected override getLocalData(item: Item) {
        if (item.gender != "not specified" && item.gender != UserMeManager.Get.user.gender) return null;
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: Item, skinLocalData: LocalItemDataConfig) {
        let uiItem = itemNode.getComponent(ShopUIItem);
        uiItem.resetData();

        if (item.type == ItemType.PET_CARD) {
            this.handleCardItem(uiItem, item);
            return;
        }
        
        if (item.iconSF.length == 0) {
            for (const icon of skinLocalData.icons) {
                let spriteFrame = await this.setItemImage(skinLocalData.bundleName, icon);
                item.iconSF.push(spriteFrame);
            }
        }
        uiItem.avatar.node.scale = this.SetItemScaleValue(item.type);
        uiItem.avatar.spriteFrame = item.iconSF[0];
        item.mappingLocalData = skinLocalData;
        uiItem.init(item);
        uiItem.toggleActive(false);
        uiItem.reset();
    }

    private handleCardItem(uiItem: ShopUIItem, item: Item) {
        const sprite = this.cardIconMap[item.item_code];
        if (sprite) {
            uiItem.avatar.spriteFrame = sprite;
            uiItem.avatar.node.scale = new Vec3(0.06, 0.06, 0);
        }
        uiItem.init(item);
        uiItem.toggleActive(false);
        if (this.descriptionText.string.trim() === "") {
            this.descriptionText.string = `${item.name}`;
        }
    }

    protected override onUIItemClick(uiItem: ShopUIItem, data: Item) {
        this.selectingUIItem = uiItem;
        super.onUIItemClick(uiItem, data);
        this.itemPrice.string = Utilities.convertBigNumberToStr(data.gold);
        this.itemPriceContainer.active = true;
    }

    protected override groupByCategory(items: Item[]): Record<string, Item[]> {
        return items.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = [];
            }
            acc[item.type].push(item);
            return acc;
        }, {} as Record<string, Item[]>);
    }
}

export interface InteractShopParam {
    onActionClose?: () => void;
}
