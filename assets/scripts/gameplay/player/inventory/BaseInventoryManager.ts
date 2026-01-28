import { _decorator, Button, Component, Node, Prefab, RichText, ScrollView, SpriteFrame, Vec3 } from 'cc';
import { BaseInventoryDTO, Food, InventoryType, Item, ItemType } from '../../../Model/Item';
import { TabController } from '../../../ui/TabController';
import { AnimationEventController } from '../AnimationEventController';
import { InventoryUIITem } from './InventoryUIItem';
import { LoadBundleController } from '../../../bundle/LoadBundleController';
import { UserMeManager } from '../../../core/UserMeManager';
import Utilities from '../../../utilities/Utilities';
import { BasePopup } from '../../../PopUp/BasePopup';
import { instantiate } from 'cc';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
import { ShopUIItem } from '../../shop/ShopUIItem';
const { ccclass, property } = _decorator;

@ccclass('BaseInventoryManager')
export class BaseInventoryManager extends BasePopup {
    @property({ type: Node }) itemContainer: Node = null;
    @property({ type: Node }) otherContainer: Node = null;
    @property({ type: Node }) noItemContainer: Node = null;
    @property(ScrollView) itemScrollView: ScrollView = null;
    @property(ScrollView) otherScrollView: ScrollView = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: RichText }) descriptionText: RichText = null;
    @property({ type: RichText }) coinText: RichText = null;
    @property({ type: Button }) actionButton: Button = null;
    @property({ type: AnimationEventController }) previewPlayer: AnimationEventController = null;

    protected itemData: Item = null;
    protected selectingUIItem: InventoryUIITem = null;
    protected equipingUIItem: InventoryUIITem = null;
    protected isItemGenerated: boolean = false;
    protected categories: string[] = [];
    protected groupedItems: Record<string, BaseInventoryDTO[]> = null;
    protected currentTabName: string = null;

    @property({ type: Button }) closeUIBtn: Button = null;

    public init(param?: any): void {
        if (this.categories.length > 0) {
            this.reset();
        }
        this.actionButton.node.on("click", this.actionButtonClick, this);
        this.closeUIBtn.node.on("click", this.closeUIBtnClick, this);
        UserMeManager.PlayerProperty.onChange("gold", (newCoin, oldValue) => {
            this.onCoinChange(newCoin);
        });
        this.onCoinChange(UserMeManager.playerCoin);
    }

    protected onCoinChange(value) {
        if (this.coinText != null)
            this.coinText.string = Utilities.convertBigNumberToStr(value);
    }

    protected groupByCategory(items: BaseInventoryDTO[]): Record<string, BaseInventoryDTO[]> {
        return null;
    }

    protected async onTabChange(tabName) {
        this.isItemGenerated = true;
        this.reset();
        const items = this.groupedItems[tabName] ?? [];
        const isEmpty = !items || items.length === 0;

        if (isEmpty) {
            this.noItemContainer.active = true;
            return;
        }
        this.noItemContainer.active = false;
        if (tabName === InventoryType.FOOD) {
            this.currentTabName = tabName;
            await this.spawnFoodItems(this.groupedItems[tabName]);
        }
        if (tabName === ItemType.PET_CARD) {
            this.currentTabName = tabName;
            await this.spawnCardItems(this.groupedItems[tabName]);
        }
        else {
            this.currentTabName = tabName;
            await this.spawnClothesItems(this.groupedItems[tabName]);
        }
        this.scheduleOnce(() => {
            this.selectDefaultItem();
        }, 0);
        this.ResetPositionScrollBar();
    }

    private selectDefaultItem() {
        const content = this.itemScrollView?.content || this.otherScrollView?.content;
        if (!content || content.children.length === 0) return;

        for (const node of content.children) {
            const uiItem = node.getComponent(ShopUIItem);
            if (!uiItem || !uiItem.data) continue;

            if (uiItem.data.gold > 0) {
                if (this.selectingUIItem && this.selectingUIItem !== uiItem) {
                    this.selectingUIItem.toggleActive(false);
                }
                this.selectingUIItem = uiItem;
                uiItem.toggleActive(true);
                this.onUIItemClick(uiItem, uiItem.data);
                break;
            }
        }
    }

    ResetPositionScrollBar() {
        this.scheduleOnce(() => {
            if (this.itemScrollView) {
                this.itemScrollView.scrollToTop(0)
            }
        }, 0.05);
        this.scheduleOnce(() => {
            if (this.otherScrollView) {
                this.otherScrollView.scrollToTop(0)
            }
        }, 0.05);
    }

    protected async spawnFoodItems(items: any[]) {
        for (const item of items) {
            if (Number(item.quantity) <= 0) continue;
            let itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.otherContainer);
            await this.registUIItemData(itemNode, item,
                (uiItem, dataFood) => {
                    this.onUIItemClick(uiItem, dataFood as Food);
                });
        }
    }

    protected async spawnCardItems(items: any[]) {
        for (const item of items) {
            if (Number(item.quantity) <= 0) continue;
            let itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.otherContainer);
            await this.registUIItemData(itemNode, item,
                (uiItem, data) => {
                    this.onUIItemClick(uiItem, data as Item);
                });
        }
    }

    protected async spawnClothesItems(items: any[]) {
        for (const item of items) {
            let skinLocalData = this.getLocalData(item);
            if (!skinLocalData)
                continue;
            let itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.itemContainer);

            await this.registUIItemData(itemNode, item,
                (uiItem, data) => {
                    this.onUIItemClick(uiItem, data as Item);
                });
        }
    }

    protected getLocalData(item): LocalItemDataConfig {
        return null;
    }

    protected async registUIItemData(itemNode: Node, item: BaseInventoryDTO, onClick?: (uiItem: InventoryUIITem, data: any) => void) {

    }

    protected async actionButtonClick() { }
    protected closeUIBtnClick() { }

    protected resetSelectItem() {
        if (this.selectingUIItem) {
            this.selectingUIItem.toggleActive(true);
        }
        if (this.equipingUIItem) {
            this.equipingUIItem.toggleActive(false);
        }
        this.equipingUIItem = this.selectingUIItem;
        this.actionButton.interactable = false;
        this.selectingUIItem = null;
    }

    protected initGroupData() {

    }

    protected reset() {
        this.itemContainer.removeAllChildren();
        this.otherContainer.removeAllChildren();
        this.actionButton.interactable = false;
        this.descriptionText.string = "";
        if (this.equipingUIItem) {
            this.equipingUIItem.toggleActive(true);
        }
        if (this.selectingUIItem) {
            this.selectingUIItem = null;
        }
        this.previewPlayer.reset();

        if (!this.isItemGenerated) {
            this.onTabChange(this.categories[0]);
        }
    }

    protected async setItemImage(bundleName, bundlePath) {
        let bundleData = {
            bundleName: bundleName,
            bundlePath: bundlePath
        }
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
    }

    protected onUIItemClick(uiItem: any, data: Item | Food) {
        if (!data) return;
        this.selectingUIItem = uiItem;
        this.actionButton.interactable = uiItem != null;

        if (data instanceof Food) {
            return;
        }

        if ((data as Item).type === ItemType.PET_CARD || (data as Item).type === ItemType.PETFRAGMENT) {
            this.itemData = data as Item;
            this.descriptionText.string = `${this.itemData.name}`;
            return;
        }

        this.itemData = data as Item;
        this.previewPlayer.changeSkin(this.itemData, false);
        this.updateDescriptionAndActionButton(this.itemData, uiItem);
    }

    protected updateDescriptionAndActionButton(itemData: Item, uiItem: any | null) {
        const description = itemData.mappingLocalData?.description || itemData.name || "";
        const isFaceOrEye = itemData.type === ItemType.EYES || itemData.type === ItemType.FACE;
        if (isFaceOrEye) { this.descriptionText.string = itemData.mappingLocalData?.description || "";
            return;
        }
        this.descriptionText.string = isFaceOrEye ? description : `${itemData.name}${description ? " : " + description : ""}`;
    }
}