import { _decorator, Prefab, ScrollView, Node } from 'cc';
import { WebRequestManager } from '../../../network/WebRequestManager';
import { BaseTabController } from '../../../ui/BaseTabController';
import { Constants } from '../../../utilities/Constants';
import { Food, InventoryDTO, InventoryType, Item, ItemType } from '../../../Model/Item';
import { BaseInventoryManager } from './BaseInventoryManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { InventoryUIITem } from './InventoryUIItem';
import { PopupManager } from '../../../PopUp/PopupManager';
import { UserManager } from '../../../core/UserManager';
import { Vec3 } from 'cc';
import { ResourceManager } from '../../../core/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends BaseInventoryManager {
    @property({ type: BaseTabController }) baseTab: BaseTabController = null!;
    @property({ type: Node }) noItemContainer: Node = null;
    @property(ScrollView) itemScrollView: ScrollView = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: Node }) goBg: Node = null;
    @property({ type: Node }) goListItem: Node = null;
    @property({ type: Node }) goListFood: Node = null;
    private defaultTab: ItemType = ItemType.HAIR;
    private cachedInventory: Record<string, InventoryDTO[]> = {};

    public init(param?: any): void {
        super.init();
        this.getTabType();
        this.goBg.active = false;
        this.isItemGenerated = false;
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
        this.onTabChange(this.defaultTab);
    }

    protected async actionButtonClick() {
        this.equipSkin();
        this.resetSelectItem();
    }

    protected override closeUIBtnClick() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }

    private equipSkin() {
        UserManager.instance.updatePlayerSkin(this.itemData, true);
    }

    private async getTabType() {
        this.baseTab.initTabs(
            Constants.tabTypeInventory,
            Constants.getTabItemMap(),
            (tabName: string) => this.onTabChange(tabName)
        );
    }

    private setClothesItemsDefault(): InventoryDTO[] {
        const userGender = UserMeManager.Get.user.gender;
        const allDefaults: InventoryDTO[] = [
            // Male
            {
                id: null,
                equipped: false,
                item: {
                    id: "1", name: "Tóc đỏ SonGoKu", gold: 0, iconSF: [], type: ItemType.HAIR, mappingLocalData: null, gender: "male"
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: {
                    id: "3", name: "Áo đỏ rực rỡ", gold: 0, iconSF: [], type: ItemType.UPPER, mappingLocalData: null, gender: "male"
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: {
                    id: "4", name: "Quần đỏ ngắn", gold: 0, iconSF: [], type: ItemType.LOWER, mappingLocalData: null, gender: "male"
                },
                inventory_type: InventoryType.ITEM,
            },

            // Female
            {
                id: null,
                equipped: false,
                item: {
                    id: "8", name: "Tóc hồng Cherry", gold: 0, iconSF: [], type: ItemType.HAIR, mappingLocalData: null, gender: "female"
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: {
                    id: "9", name: "Áo trắng viền đỏ", gold: 0, iconSF: [], type: ItemType.UPPER, mappingLocalData: null, gender: "female"
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: {
                    id: "10", name: "Quần trắng viền đỏ", gold: 0, iconSF: [], type: ItemType.LOWER, mappingLocalData: null, gender: "female"
                },
                inventory_type: InventoryType.ITEM,
            },

            // Unisex
            {
                id: null,
                equipped: false,
                item: {
                    id: "-1", name: "", gold: 0, iconSF: [], type: ItemType.EYES, mappingLocalData: null, gender: "not specified",
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: {
                    id: "0", name: "", gold: 0, iconSF: [], type: ItemType.FACE, mappingLocalData: null, gender: "not specified"
                },
                inventory_type: InventoryType.ITEM,
            }
        ];

        return allDefaults.filter(d =>
            d.item.gender === userGender || d.item.gender === "not specified"
        );
    }

    protected override async onTabChange(tabName: string) {
        this.noItemContainer.active = false;
        this.isItemGenerated = true;
        const inventoryList: InventoryDTO[] = this.cachedInventory[tabName] ?? await this.fetchAndCacheInventory(tabName);
        this.reset();

        switch (tabName) {
            case ItemType.PET_CARD:
                this.checEmptyItem(inventoryList);
                await this.spawnCardItems(inventoryList);
                break;
            case ItemType.PET_FOOD:
                this.checEmptyItem(inventoryList);
                await this.spawnFoodItems(inventoryList);
                break;
            default:
                this.currentTabName = tabName;
                const defaultForTab = this.setClothesItemsDefault()
                    .filter(item => item.item?.type?.toLowerCase() === tabName.toLowerCase());
                const combinedList = defaultForTab.length > 0
                    ? [...defaultForTab, ...inventoryList]
                    : inventoryList;
                this.checEmptyItem(combinedList);
                await this.spawnClothesItems(combinedList);
                break;
        }
    }

    private async fetchAndCacheInventory(tabName: string): Promise<InventoryDTO[]> {
        const list = await WebRequestManager.instance.getItemTypeAsync(tabName);
        this.cachedInventory[tabName] = list;
        return list;
    }

    checEmptyItem(inventoryList: InventoryDTO[]) {
        if (!inventoryList || inventoryList.length <= 0) {
            this.noItemContainer.active = true;
            return;
        }
    }

    protected override getLocalData(item) {
        if (item.item.gender != "not specified" && item.item.gender != UserMeManager.Get.user.gender) return null;
        return ResourceManager.instance.getLocalSkinById(item.item.id, item.item.type);
    }

    protected override async registUIItemData(
        itemNode: Node,
        item: InventoryDTO,
        onClick?: (uiItem: InventoryUIITem, data: any) => void
    ) {
        const uiItem = itemNode.getComponent(InventoryUIITem);
        if (onClick) {
            uiItem.onClick = onClick;
        }
        uiItem.resetData();
        if (item.food) {
            this.setupFoodItem(uiItem, item.food);
        } else if (item.item.type === ItemType.PET_CARD) {
            this.setupPetCardItem(uiItem, item.item);
        } else {
            await this.setupClothesItem(uiItem, item.item);
        }
    }

    private setupFoodItem(uiItem: InventoryUIITem, food: Food) {
        uiItem.initFood(food);
        uiItem.setIconByFood(food);
        uiItem.setScaleByItemType();
        uiItem.toggleActive(false);
        this.setUIState(ItemType.PET_FOOD);
        this.descriptionText.string = `${food.name}: ${food.description || ""}`;
    }

    private setupPetCardItem(uiItem: InventoryUIITem, itemData: Item) {
        uiItem.init(itemData);
        uiItem.setIconByItem(itemData);
        uiItem.setScaleByItemType(itemData.type);
        this.setUIState(ItemType.PET_CARD);
        uiItem.toggleActive(false);
         this.descriptionText.string =  `${itemData.name}`;
    }

    private async setupClothesItem(uiItem: InventoryUIITem, itemData: Item) {
        uiItem.init(itemData);
        this.setUIState();
        uiItem.setIconByItem(itemData);
        uiItem.setScaleByItemType(itemData.type);
        const isEquipped = UserMeManager.Get.user.skin_set.includes(itemData.id);
        uiItem.toggleActive(isEquipped);
        if (isEquipped) {
            this.equipingUIItem = uiItem;
            this.updateDescriptionAndActionButton(itemData, this.selectingUIItem);
        }
    }

    private setUIState(itemType?: ItemType) {
        const isFood = itemType === ItemType.PET_FOOD;
        const isPetCard = itemType === ItemType.PET_CARD;
        const isOther = !isFood && !isPetCard;
        this.goBg.active = isPetCard;
        this.goListItem.active = isPetCard || isOther;
        this.goListFood.active = isFood;
    }

    protected override onUIItemClick(uiItem: InventoryUIITem, data: Item | Food) {
        super.onUIItemClick(uiItem as any, data as any);

        this.selectingUIItem = uiItem;
        if (data instanceof Food) {
            this.actionButton.interactable = false;
            uiItem.toggleActive(false);
            this.descriptionText.string = `${data.name}: ${data.description}`;
            return;
        }

        if ((data as Item).type === ItemType.PET_CARD) {
            this.actionButton.interactable = false;
            return;
        }
        if (this.equipingUIItem) {
            this.actionButton.interactable = this.selectingUIItem.data.id != this.equipingUIItem.data.id;
        } else {
            this.actionButton.interactable = true;
        }
    }
}
