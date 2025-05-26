import { _decorator, Button, Component, Node, Prefab, RichText, SpriteFrame } from 'cc';
import { BaseInventoryDTO, Food, InventoryType, Item } from '../../../Model/Item';
import { TabController } from '../../../ui/TabController';
import { AnimationEventController } from '../AnimationEventController';
import { InventoryUIITem } from './InventoryUIItem';
import { LoadBundleController } from '../../../bundle/LoadBundleController';
import { UserMeManager } from '../../../core/UserMeManager';
import Utilities from '../../../utilities/Utilities';
import { ObjectPoolManager } from '../../../pooling/ObjectPoolManager';
import { EVENT_NAME } from '../../../network/APIConstant';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
const { ccclass, property } = _decorator;

@ccclass('BaseInventoryManager')
export class BaseInventoryManager extends Component {
    @property({ type: TabController }) tabController: TabController = null;
    @property({ type: Node }) itemContainer: Node = null;
    @property({ type: Node }) foodContainer: Node = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: RichText }) descriptionText: RichText = null;
    @property({ type: RichText }) coinText: RichText = null;
    @property({ type: Button }) actionButton: Button = null;
    @property({ type: AnimationEventController }) previewPlayer: AnimationEventController = null;

    protected skinData: Item = null;
    protected selectingUIItem: InventoryUIITem = null;
    protected equipingUIItem: InventoryUIITem = null;
    protected isItemGenerated: boolean = false;
    protected categories: string[] = [];
    protected groupedItems: Record<string, BaseInventoryDTO[]> = null;

    @property({ type: [SpriteFrame] }) iconValue: SpriteFrame[] = []; // 0: normal 1:  rare 2:  super
    @property({ type: [SpriteFrame] }) iconMoney: SpriteFrame[] = []; // 0: Gold 1: Diamond
    protected foodIconMap: Record<string, SpriteFrame>;
    protected moneyIconMap: Record<string, SpriteFrame>;

    protected onLoad(): void {
        this.foodIconMap = {
            normal: this.iconValue[0],
            premium: this.iconValue[1],
            ultrapremium: this.iconValue[2]
        };
        this.moneyIconMap = {
            gold: this.iconMoney[0],
            diamond: this.iconMoney[1]
        };
    }

    protected onEnable(): void {
        if (this.categories.length > 0) {
            this.reset();
        }
    }

    protected start(): void {
        this.actionButton.node.on("click", this.actionButtonClick, this);
        UserMeManager.PlayerProperty.onChange("gold", (newCoin, oldValue) => {
            this.onCoinChange(newCoin);
        });
        this.onCoinChange(UserMeManager.playerCoin);
    }

    protected onDestroy(): void {
        
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
        ObjectPoolManager.instance.returnArrayToPool(this.itemContainer.children);
        ObjectPoolManager.instance.returnArrayToPool(this.foodContainer.children);
        this.reset();
        const isTabFood = (tabName === InventoryType.FOOD);
        if (isTabFood)
            await this.spawnFoodItems(this.groupedItems[tabName]);
        else
            await this.spawnClothesItems(this.groupedItems[tabName]);
    }

    private async spawnFoodItems(items: any[]) {
        for (const item of items) {
            let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
            itemNode.off(EVENT_NAME.ON_ITEM_CLICK);
            itemNode.off(EVENT_NAME.ON_FOOD_CLICK);
            itemNode.setParent(this.foodContainer);
            await this.registUIItemData(itemNode, item, null);
            this.registItemFoodClickEvent(itemNode);
        }
    }

    private async spawnClothesItems(items: any[]) {
        for (const item of items) {
            let skinLocalData = this.getLocalData(item);
            if (!skinLocalData)
                continue;
            let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
            itemNode.off(EVENT_NAME.ON_ITEM_CLICK);
            itemNode.off(EVENT_NAME.ON_FOOD_CLICK);
            itemNode.setParent(this.itemContainer);

            await this.registUIItemData(itemNode, item, skinLocalData);
            this.registItemClickEvent(itemNode);
        }
    }

    protected getLocalData(item): LocalItemDataConfig {
        return null;
    }

    protected async registUIItemData(itemNode: Node, item: BaseInventoryDTO, skinLocalData: LocalItemDataConfig) {
        
    }

    protected registItemClickEvent(itemNode: Node) {
        itemNode.on(EVENT_NAME.ON_ITEM_CLICK, (uiItem, data) => {
            this.onUIItemClick(uiItem, data);
        })
    }

    protected registItemFoodClickEvent(itemNode: Node) {
        itemNode.on(EVENT_NAME.ON_FOOD_CLICK, (uiItem, dataFood) => {
            this.onUIItemClickFood(uiItem, dataFood);
        })
    }

    protected async actionButtonClick() { }

    protected resetSelectItem() {
        if (this.selectingUIItem) {
            this.selectingUIItem.toggleActive(true);
        }
        if (this.equipingUIItem) {
            this.equipingUIItem.toggleActive(false);
        }
        this.equipingUIItem = this.selectingUIItem;
        this.actionButton.interactable = false;
    }

    public init() {

    }

    protected initGroupData() {

    }

    protected reset() {
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

    protected onUIItemClick(uiItem: InventoryUIITem, data: Item) {
        this.selectingUIItem = uiItem;
        this.skinData = data;
        this.previewPlayer.changeSkin(this.skinData, false);
        this.descriptionText.string = this.skinData.mappingLocalData.description || "";
        this.actionButton.interactable = this.selectingUIItem != null;
    }

    protected onUIItemClickFood(uiItem: InventoryUIITem, dataFood: Food) {
        if (!dataFood) return;
        this.selectingUIItem = uiItem;
        this.actionButton.interactable = this.selectingUIItem != null;
    }

    protected setupFoodReward(uiItem: any, foodType: any) {

    }

    protected setupMoneyReward(uiItem: any, typeMoney: any) {
        const sprite = this.moneyIconMap[typeMoney.type];
        if (sprite) {
            uiItem.iconFrame.spriteFrame = sprite;
        }
    }

}