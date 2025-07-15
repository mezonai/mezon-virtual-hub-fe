import { _decorator, Node, RichText } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { WebRequestManager } from '../../network/WebRequestManager';
import { InventoryType, Item } from '../../Model/Item';
import { ResourceManager } from '../../core/ResourceManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { ShopUIItem } from './ShopUIItem';
import { BaseInventoryManager } from '../player/inventory/BaseInventoryManager';
import { LocalItemDataConfig } from '../../Model/LocalItemConfig';
import UIPopup from '../../ui/UI_Popup';
import Utilities from '../../utilities/Utilities';
import { PopupManager } from '../../PopUp/PopupManager';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
const { ccclass, property } = _decorator;

@ccclass('ShopController')
export class ShopController extends BaseInventoryManager {
    @property({ type: UIPopup }) noticePopup: UIPopup = null;
    @property({ type: RichText }) itemPrice: RichText = null;
    @property({ type: Node }) itemPriceContainer: Node = null;
    protected override groupedItems: Record<string, Item[]> = null;
    protected override selectingUIItem: ShopUIItem = null;

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
    }

    private async showPopupAndReset(): Promise<boolean> {
        let result = await new Promise<boolean>((resolve, reject) => {
            this.noticePopup.showYesNoPopup(
                null,
                Utilities.convertBigNumberToStr(this.selectingUIItem.data.gold),
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
        UserMeManager.Get.inventories.push(response.data.inventory_data);
        UserMeManager.playerCoin = response.data.user_gold;
        const param: ConfirmParam = {
            message: "Mua thành công!",
            title: "Thông báo",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    private async buyItem() {
        // Check if user has enough money
        if (UserMeManager.playerCoin < this.selectingUIItem.data.gold) {
            throw new Error("Không đủ tiền để mua");
        }

        try {
            const result = await this.postBuySkinAsync(this.selectingUIItem.data.id);

            return result;
        } catch (error) {
            throw error;
        }
    }

    private postBuySkinAsync(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postBuySkin(data, resolve, reject);
        });
    }

    public init() {
        super.init();
        this.initGroupData();
        this.onTabChange(this.categories[0]);
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
