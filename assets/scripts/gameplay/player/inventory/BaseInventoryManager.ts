import { _decorator, Button, Component, Node, Prefab, RichText, ScrollView, SpriteFrame, Vec3 } from 'cc';
import { BaseInventoryDTO, Food, InventoryType, Item, ItemType } from '../../../Model/Item';
import { TabController } from '../../../ui/TabController';
import { AnimationEventController } from '../AnimationEventController';
import { InventoryUIITem } from './InventoryUIItem';
import { LoadBundleController } from '../../../bundle/LoadBundleController';
import { UserMeManager } from '../../../core/UserMeManager';
import Utilities from '../../../utilities/Utilities';
import { ObjectPoolManager } from '../../../pooling/ObjectPoolManager';
import { EVENT_NAME } from '../../../network/APIConstant';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
import { BasePopup } from '../../../PopUp/BasePopup';
import { instantiate } from 'cc';
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

    @property({ type: [SpriteFrame] }) iconValue: SpriteFrame[] = []; // 0: normal 1:  rare 2:  super
    @property({ type: [SpriteFrame] }) iconMoney: SpriteFrame[] = []; // 0: Gold 1: Diamond
    @property({ type: [SpriteFrame] }) cardValue: SpriteFrame[] = []; // 0: Gold 1: Diamond
    protected foodIconMap: Record<string, SpriteFrame>;
    protected cardIconMap: Record<string, SpriteFrame>;
    protected moneyIconMap: Record<string, SpriteFrame>;
    protected currentTabName: string = null;

    @property({ type: Button }) closeUIBtn: Button = null;

    public init(param?: any): void {
        this.initFoodMap();
        this.initCardMap();
        this.initMoneyMap();
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

    initFoodMap() {
        if (this.iconValue.length >= 3) {
            this.foodIconMap = {
                normal: this.iconValue[0],
                premium: this.iconValue[1],
                ultrapremium: this.iconValue[2]
            };
        }
    }

    initCardMap() {
        if (this.cardValue.length >= 3) {
            this.cardIconMap = {
                rarity_card_rare: this.cardValue[0],
                rarity_card_epic: this.cardValue[1],
                rarity_card_legendary: this.cardValue[2]
            };
        }
    }

    initMoneyMap(){
        if (this.iconMoney.length >= 2) {
            this.moneyIconMap = {
                gold: this.iconMoney[0],
                diamond: this.iconMoney[1]
            };
        }
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
        if (tabName === InventoryType.FOOD){
            this.currentTabName = tabName;
            await this.spawnFoodItems(this.groupedItems[tabName]);
        }
         if (tabName === ItemType.PET_CARD){
            this.currentTabName = tabName;
            await this.spawnCardItems(this.groupedItems[tabName]);
        }
        else
        {
            this.currentTabName = tabName;
            await this.spawnClothesItems(this.groupedItems[tabName]);  
        }
        this.ResetPositionScrollBar();
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
            await this.registUIItemData(itemNode, item, null,
                (uiItem, dataFood) => {
                    this.onUIItemClick(uiItem, dataFood as Food);
                });
        }
    }

    protected async spawnCardItems(items: any[]) {
        for (const item of items) {
            if (Number(item.quantity) <= 0) continue;
            let itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.itemContainer);
            await this.registUIItemData(itemNode, item, null,
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

            await this.registUIItemData(itemNode, item, skinLocalData,
                (uiItem, data) => {
                    this.onUIItemClick(uiItem, data as Item);
                });
        }
    }

    protected getLocalData(item): LocalItemDataConfig {
        return null;
    }

    protected async registUIItemData(itemNode: Node, item: BaseInventoryDTO, skinLocalData: LocalItemDataConfig, onClick?: (uiItem: InventoryUIITem, data: any) => void) {

    }

    protected SetItemScaleValue(itemType: ItemType, sizeSpecial: number = 0.16, sizeClothes: number = 0.3): Vec3 {
        const isSpecial = itemType === ItemType.HAIR || itemType === ItemType.FACE;
        const value = isSpecial ? sizeSpecial : sizeClothes;
        return new Vec3(value, value, 0);
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

        if ((data as Item).type === ItemType.PET_CARD) {
            this.itemData = data as Item;
            this.descriptionText.string = `${this.itemData.name}`;
            return;
        }

        this.itemData = data as Item;
        this.previewPlayer.changeSkin(this.itemData, false);
        this.updateDescriptionAndActionButton(this.itemData, uiItem);
    }

    protected updateDescriptionAndActionButton(skinData: Item, uiItem: any | null) {
        const description = skinData.mappingLocalData?.description || "";
        const isFaceOrEye = skinData.type === ItemType.EYES || skinData.type === ItemType.FACE;
        this.descriptionText.string = isFaceOrEye ? description : `${skinData.name} : ${description}`;
    }

    protected setupFoodReward(uiItem: any, foodType: any) {
        if (!this.foodIconMap) {
            this.initFoodMap();
        }
    }

    protected setupMoneyReward(uiItem: any, typeMoney: any) {
        if (!this.moneyIconMap) {
            this.initMoneyMap();
        }
        const sprite = this.moneyIconMap[typeMoney.type];
        if (sprite) {
            uiItem.iconFrame.spriteFrame = sprite;
        }
    }

}