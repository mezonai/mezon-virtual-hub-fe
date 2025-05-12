import { _decorator, Node } from 'cc';
import { InventoryDTO, Item } from '../../../Model/Item';
import { EVENT_NAME } from '../../../network/APIConstant';
import { UserMeManager } from '../../../core/UserMeManager';
import { ResourceManager } from '../../../core/ResourceManager';
import { UserManager } from '../../../core/UserManager';
import { InventoryUIITem } from './InventoryUIItem';
import { BaseInventoryManager } from './BaseInventoryManager';
import { LocalItemDataConfig } from '../../../Model/LocalItemConfig';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends BaseInventoryManager {
    protected override groupedItems: Record<string, InventoryDTO[]> = null;

    protected async actionButtonClick() {
        this.equipSkin();
        this.resetSelectItem();
    }

    private equipSkin() {
        UserManager.instance.updatePlayerSkin(this.skinData, true);
    }

    public override init() {
        this.addLocalData();
        this.initGroupData();
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
                    id: "1", name: "", gold: 0, iconSF: null, type: 1, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false
                }
            },
            {
                id: null,
                equipped: false,
                item: { id: "3", name: "", gold: 0, iconSF: null, type: 5, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false },

            },
            {
                id: null,
                equipped: false,
                item: { id: "4", name: "", gold: 0, iconSF: null, type: 6, mappingLocalData: null, gender: "male", is_equippable: true, is_static: false, is_stackable: false },

            }
        ];

        let femaleItems: InventoryDTO[] = [
            {
                id: null,
                equipped: false,
                item: { id: "8", name: "", gold: 0, iconSF: null, type: 1, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },

            },
            {
                id: null,
                equipped: false,
                item: { id: "9", name: "", gold: 0, iconSF: null, type: 5, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },

            },
            {
                id: null,
                equipped: false,
                item: { id: "10", name: "", gold: 0, iconSF: null, type: 6, mappingLocalData: null, gender: "female", is_equippable: true, is_static: false, is_stackable: false },

            }
        ];

        let unisexItems: InventoryDTO[] = [
            {
                id: null,
                equipped: false,
                item: { id: "-1", name: "", gold: 0, iconSF: null, type: 4, mappingLocalData: null, gender: "not specified", is_equippable: true, is_static: false, is_stackable: false },

            },
            {
                id: null,
                equipped: false,
                item: { id: "0", name: "", gold: 0, iconSF: null, type: 3, mappingLocalData: null, gender: "not specified", is_equippable: true, is_static: false, is_stackable: false },
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
                item.item.iconSF = [];
            });
        }
        this.tabController.initTabData(this.categories);
        this.tabController.node.on(EVENT_NAME.ON_CHANGE_TAB, (tabName) => { this.onTabChange(tabName); });
        // this.previewPlayer.init([]);
    }

    public addItemToInventory(item: InventoryDTO) {
        this.isItemGenerated = false;
        item.item.iconSF = [];
        item.item.mappingLocalData = null;
        if (this.groupedItems[item.item.type] == null) {
            this.groupedItems[item.item.type] = [];
            this.categories.push(item.item.type.toString());
        }

        this.groupedItems[item.item.type].push(item);
    }

    protected override getLocalData(item) {
        if (item.item.gender != "not specified" && item.item.gender != UserMeManager.Get.user.gender) return null;
        return ResourceManager.instance.getLocalSkinById(item.item.id, item.item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: InventoryDTO, skinLocalData: LocalItemDataConfig) {
        let uiItem = itemNode.getComponent(InventoryUIITem);
        if (item.item.iconSF.length == 0) {
            for (const icon of skinLocalData.icons) {
                let spriteFrame = await this.setItemImage(skinLocalData.bundleName, icon);
                item.item.iconSF.push(spriteFrame);
            }
        }
        uiItem.avatar.spriteFrame = item.item.iconSF[0];
        item.item.mappingLocalData = skinLocalData;
        uiItem.init(item.item);
        if (UserMeManager.Get.user.skin_set.includes(item.item.id)) {
            uiItem.toggleActive(true);
            this.equipingUIItem = uiItem;
        }
        else {
            uiItem.toggleActive(false);
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

    protected override groupByCategory(items: InventoryDTO[]): Record<string, InventoryDTO[]> {
        return items.reduce((acc, item) => {
            if (!acc[item.item.type]) {
                acc[item.item.type] = [];
            }
            acc[item.item.type].push(item);
            return acc;
        }, {} as Record<string, InventoryDTO[]>);
    }
}


