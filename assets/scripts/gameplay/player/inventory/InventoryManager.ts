import { _decorator, Node } from 'cc';
import { Food, InventoryDTO, InventoryType, Item, ItemType } from '../../../Model/Item';
import { EVENT_NAME } from '../../../network/APIConstant';
import { UserMeManager } from '../../../core/UserMeManager';
import { ResourceManager } from '../../../core/ResourceManager';
import { UserManager } from '../../../core/UserManager';
import { InventoryUIITem } from './InventoryUIItem';
import { BaseInventoryManager } from './BaseInventoryManager';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
import { PopupManager } from '../../../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends BaseInventoryManager {
    protected override groupedItems: Record<string, InventoryDTO[]> = null;
    @property({ type: Node }) goBg: Node = null;
    @property({ type: Node }) goListItem: Node = null;
    @property({ type: Node }) goListFood: Node = null;

    protected async actionButtonClick() {
        this.equipSkin();
        this.resetSelectItem();
    }

    protected override closeUIBtnClick() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }


    private equipSkin() {
        UserManager.instance.updatePlayerSkin(this.skinData, true);
    }

    public init(param: InventoryParam) {
        super.init();
        this.goBg.active = false;
        this.addLocalData();
        this.initGroupData();
        this.onTabChange(this.categories[0]);
        this.isItemGenerated = false;
        if(param != null && param.onActionClose != null){
            this._onActionClose = param.onActionClose;
        }
    }

    private addLocalData() {
        if (UserMeManager.Get.inited) {
            return;
        }

        UserMeManager.Get.inited = true;
        let maleItems: InventoryDTO[] = [
            {
                id: null,
                equipped: false,
                item: {
                    id: "1", name: "Tóc đỏ SonGoKu", gold: 0, iconSF: null, type: 1, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false
                },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: { id: "3", name: "Áo đỏ rực rỡ", gold: 0, iconSF: null, type: 5, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: { id: "4", name: "Quần đỏ ngắn", gold: 0, iconSF: null, type: 6, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            }
        ];

        let femaleItems: InventoryDTO[] = [
            {
                id: null,
                equipped: false,
                item: { id: "8", name: "Tóc hồng Cherry", gold: 0, iconSF: null, type: 1, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: { id: "9", name: "Áo trắng viền đỏ", gold: 0, iconSF: null, type: 5, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: { id: "10", name: "Quần trắng viền đỏ", gold: 0, iconSF: null, type: 6, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            }
        ];

        let unisexItems: InventoryDTO[] = [
            {
                id: null,
                equipped: false,
                item: { id: "-1", name: "", gold: 0, iconSF: null, type: 4, mappingLocalData: null, gender: "not specified", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            },
            {
                id: null,
                equipped: false,
                item: { id: "0", name: "", gold: 0, iconSF: null, type: 3, mappingLocalData: null, gender: "not specified", is_equippable: true, is_static: false, is_stackable: false },
                inventory_type: InventoryType.ITEM,
            }
        ];
        UserMeManager.Get.inventories.unshift(...unisexItems);
        if (UserMeManager.Get.user.gender == "male") {
            UserMeManager.Get.inventories.unshift(...maleItems);
        }
        else {
            UserMeManager.Get.inventories.unshift(...femaleItems);
        }
    }

    protected override initGroupData() {
        this.groupedItems = this.groupByCategory(UserMeManager.Get.inventories);
        this.categories = [];
        for (const category in this.groupedItems) {
            this.categories.push(category);
            this.groupedItems[category].forEach(item => {
                if (item.item) {
                    item.item.iconSF = [];
                }
            });
        }
        this.tabController.initTabData(this.categories);
        this.tabController.node.on(EVENT_NAME.ON_CHANGE_TAB, (tabName) => {
            this.onTabChange(tabName);
        });
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

    private handleFoodItem(uiItem: InventoryUIITem, food: Food) {
        this.setupFoodReward(uiItem, food.type);
        uiItem.initFood(food);
        uiItem.toggleActive(false);
        this.setUIState(true, false, true);
        if (this.descriptionText.string.trim() === "") {
            this.descriptionText.string = `${food.name}: ${food.description || ""}`;
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

    protected override groupByCategory(items: InventoryDTO[]): Record<string, InventoryDTO[]> {
        const result = items.reduce((acc, item) => {
            if (item.item) {
                const type = item.item.type;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(item);
            }
            else if (item.food) {
                const type = InventoryType.FOOD;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(item);
            }
            return acc;
        }, {} as Record<string, InventoryDTO[]>);

        if (!result[InventoryType.FOOD]) {
            result[InventoryType.FOOD] = [];
        }
        return result;
    }
}

export interface InventoryParam {
    onActionClose?: () => void;
}