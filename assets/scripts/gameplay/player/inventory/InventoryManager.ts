import { _decorator, Prefab, ScrollView, Node } from 'cc';
import { WebRequestManager } from '../../../network/WebRequestManager';
import { BaseTabController } from '../../../ui/BaseTabController';
import { Constants } from '../../../utilities/Constants';
import { Food, InventoryDTO, InventoryType, Item, ItemType } from '../../../Model/Item';
import { ObjectPoolManager } from '../../../pooling/ObjectPoolManager';
import { BaseInventoryManager } from './BaseInventoryManager';
import { ResourceManager } from '../../../core/ResourceManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { InventoryUIITem } from './InventoryUIItem';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
import { PopupManager } from '../../../PopUp/PopupManager';
import { UserManager } from '../../../core/UserManager';
import { Vec3 } from 'cc';
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
    private tabTypeInventory: string[] = ["hair", "face", "eyes", "upper", "lower", "pet_food", "pet_card"];
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
            this.tabTypeInventory,
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

        // Lấy dữ liệu từ cache nếu có, nếu không fetch
        const inventoryList: InventoryDTO[] = this.cachedInventory[tabName]
            ?? await this.fetchAndCacheInventory(tabName);
        this.itemContainer.removeAllChildren();
        this.otherContainer.removeAllChildren();
        this.reset();

        // Xử lý spawn theo loại tab
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

                // Thêm default items theo tab
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

    // Hàm fetch và cache giúp code gọn hơn
    private async fetchAndCacheInventory(tabName: string): Promise<InventoryDTO[]> {
        const list = await WebRequestManager.instance.getItemTypeAsync(tabName);
        this.cachedInventory[tabName] = list;
        return list;
    }


    checEmptyItem(inventoryList: InventoryDTO[]){
         if (!inventoryList || inventoryList.length <= 0) {
            this.noItemContainer.active = true;
            return;
        }
    }

    protected override getLocalData(item) {
        if (item.item.gender != "not specified" && item.item.gender != UserMeManager.Get.user.gender) return null;
        return ResourceManager.instance.getLocalSkinById(item.item.id, item.item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: InventoryDTO, skinLocalData: LocalItemDataConfig) {
        const uiItem = itemNode.getComponent(InventoryUIITem);
        uiItem.resetData();
        if (item.food) {
            this.handleFoodItem(uiItem, item.food);
        }else
        {
            if (item.item.type == ItemType.PET_CARD) {
                this.handleCardItem(uiItem, item.item);
                return;
            }

            this.setUIState(false, true, false);
            if (item.item.iconSF.length === 0) {
                await this.loadIcons(item, skinLocalData);
            }
            uiItem.avatar.node.scale = this.SetItemScaleValue(item.item.type);
            uiItem.avatar.spriteFrame = item.item.iconSF[0];
            item.item.mappingLocalData = skinLocalData;
            uiItem.init(item.item);

            const isEquipped = UserMeManager.Get.user.skin_set.includes(item.item.id);
            uiItem.toggleActive(isEquipped);
            if (isEquipped) {
                this.equipingUIItem = uiItem;
                this.updateDescriptionAndActionButton(item.item, this.selectingUIItem);
            }
        }
    }

    private handleFoodItem(uiItem: InventoryUIITem, food: Food) {
        this.setupFoodReward(uiItem, food.type);
        uiItem.initFood(food);
        uiItem.toggleActive(false);
        this.setUIState(true, false, true);
        if (this.descriptionText.string.trim() === "") {
            this.descriptionText.string = `${food.name}: ${food.description || ""}`;
        }
    }

    private handleCardItem(uiItem: InventoryUIITem, item: Item) {
       const sprite = this.cardIconMap[item.item_code];
        if (sprite) {
            uiItem.avatar.spriteFrame = sprite;
            uiItem.avatar.node.scale = new Vec3(0.06, 0.06, 0);
        }
        uiItem.init(item);
        uiItem.updateAmountCardItem(item);
        uiItem.toggleActive(false);
        this.setUIState(true, true, false);
        if (this.descriptionText.string.trim() === "") {
            this.descriptionText.string = `${item.name}`;
        }
    }

    private setUIState(bgActive: boolean, listItemActive: boolean, listFoodActive: boolean) {
        this.goBg.active = bgActive;
        this.goListItem.active = listItemActive;
        this.goListFood.active = listFoodActive;
    }

    private async loadIcons(item: InventoryDTO, skinLocalData: LocalItemDataConfig) {
        const { bundleName, icons } = skinLocalData;
        for (const icon of icons) {
            const spriteFrame = await this.setItemImage(bundleName, icon);
            item.item.iconSF.push(spriteFrame);
        }
    }

    public override setupFoodReward(uiItem: any, foodType: string) {
        super.setupFoodReward(uiItem, foodType);
        uiItem.avatar.spriteFrame = null;
        const normalizedType = foodType.replace(/-/g, "");
        const sprite = this.foodIconMap[normalizedType];
        if (sprite) {
            uiItem.avatar.spriteFrame = sprite;
        }
    }

    protected override onUIItemClick(uiItem: InventoryUIITem, data: Item) {
        super.onUIItemClick(uiItem, data);
        if(data.type == ItemType.PET_CARD){
               this.actionButton.interactable = false;
               return;
        }
        if (this.equipingUIItem) {
            this.actionButton.interactable = this.selectingUIItem.data.id != this.equipingUIItem.data.id;
        }
        else {
            this.actionButton.interactable = true;
        }
    }

    protected override onUIItemClickFood(uiItem: InventoryUIITem, data: Food) {
        super.onUIItemClickFood(uiItem, data);
        this.actionButton.interactable = false;
        this.selectingUIItem.toggleActive(false);
        this.descriptionText.string = `${data.name}: ${data.description}`;
        this.setupMoneyReward(uiItem, data.purchase_method.toString())
    }
}
