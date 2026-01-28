import { _decorator, Prefab, ScrollView, Node, instantiate, Button } from 'cc';
import { WebRequestManager } from '../../../network/WebRequestManager';
import { BaseTabController } from '../../../ui/BaseTabController';
import { Constants } from '../../../utilities/Constants';
import { Food, FragmentExchangeResponseDTO, InventoryDTO, InventoryType, Item, ItemType, RecipeDTO } from '../../../Model/Item';
import { BaseInventoryManager } from './BaseInventoryManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { InventoryUIITem } from './InventoryUIItem';
import { PopupManager } from '../../../PopUp/PopupManager';
import { UserManager } from '../../../core/UserManager';
import { Vec3 } from 'cc';
import { ResourceManager } from '../../../core/ResourceManager';
import { PopupCombieFragment, PopupCombieFragmentParam } from '../../../PopUp/PopupCombieFragment';
import ConvetData from '../../../core/ConvertData';
import { LoadingManager } from '../../../PopUp/LoadingManager';
import { PopupExchangeFragment } from '../../../PopUp/PopupExchangeFragment';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends BaseInventoryManager {
    @property({ type: BaseTabController }) baseTab: BaseTabController = null!;
    @property({ type: Node }) noItemContainer: Node = null;
    @property(ScrollView) itemScrollView: ScrollView = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: Node }) goBg: Node = null;
    @property({ type: Node }) goListItem: Node = null;
    @property({ type: Node }) goListOtherItem: Node = null;
    private defaultTab: ItemType = ItemType.HAIR;
    private cachedInventory: Record<string, InventoryDTO[]> = {};
    @property({ type: Button }) assembleButton: Button = null;
    @property({ type: Button }) exchangeButton: Button = null;
    private recipeCache: RecipeDTO[] = [];

    public init(param?: any): void {
        super.init();
        this.getTabType();
        this.goBg.active = false;
        this.isItemGenerated = false;
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
        this.onTabChange(this.defaultTab);
        this.assembleButton.addAsyncListener(async () => {
            this.assembleButton.interactable = false;
            try {
                LoadingManager.getInstance().openLoading();
                await this.handleAssemblePet("Voltstrider");
            } finally {
                this.assembleButton.interactable = true;
                LoadingManager.getInstance().closeLoading();
            }
        });
        this.exchangeButton.addAsyncListener(async () => {
            this.exchangeButton.interactable = false;
            try {
                LoadingManager.getInstance().openLoading();
                await this.handleExchangeFragment("Voltstrider");
            } finally {
                this.exchangeButton.interactable = true;
                LoadingManager.getInstance().closeLoading();
            }
        });

    }

    private getValidRecipeBySpecies(species: string): RecipeDTO | null {
        const recipe = this.recipeCache.find(
            r => r.pet?.species?.toString() === species
        );
        if (!recipe) {
            Constants.showConfirm("Không tìm thấy công thức ghép");
            return null;
        }

        return recipe;
    }

    private hasEnoughIngredients(recipe: RecipeDTO): boolean {
        return recipe.ingredients.every(
            i => i.current_quantity >= i.required_quantity
        );
    }

    private isValidExchange(fragmentDTO: FragmentExchangeResponseDTO | null): boolean {
        if (!fragmentDTO) return false;
        const removedCount = fragmentDTO.removed?.length ?? 0;
        return removedCount > 0 && fragmentDTO.reward != null;
    }

    private async handleAssemblePet(species: string) {
        this.recipeCache = await WebRequestManager.instance.getAllRecipeByTypeAsync(ItemType.PET);
        const recipe = this.getValidRecipeBySpecies(species);
        if (!recipe) return;
        if (!this.hasEnoughIngredients(recipe)) {
            Constants.showConfirm("Không đủ mảnh để thực hiện");
            return null;
        }
        const petDTO = await WebRequestManager.instance.postCombieFragmentAsync(recipe.id);
        if (petDTO) {
            await this.refreshInventoryTab(ItemType.PETFRAGMENT);
            await PopupManager.getInstance().openPopup('PopupCombieFragment', PopupCombieFragment, { pet: petDTO, recipe });
        }
    }

    private async handleExchangeFragment(species: string) {
        this.recipeCache = await WebRequestManager.instance.getAllRecipeByTypeAsync(ItemType.PET);
        const recipe = this.getValidRecipeBySpecies(species);
        if (!recipe) return;
        const fragmentDTO = await WebRequestManager.instance.postChangeFragmentAsync(recipe.id);
        if (!this.isValidExchange(fragmentDTO)) {
            Constants.showConfirm("Cần ít nhất 3 mảnh để đổi lấy mảnh mới. Mảnh còn lại cuối cùng không được tính vào lượt đổi.");
            return;
        }

        if (fragmentDTO) {
            await this.refreshInventoryTab(ItemType.PETFRAGMENT);
            await PopupManager.getInstance().openPopup('PopupExchangeFragment', PopupExchangeFragment, { removed: fragmentDTO.removed, reward: fragmentDTO.reward });
        }
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
        this.assembleButton.node.active = false;
        this.exchangeButton.node.active = false;
        this.actionButton.node.active = true;

        switch (tabName) {
            case ItemType.PET_CARD:
                this.applyOtherItemTab(tabName, inventoryList, () =>
                    this.spawnCardItems(inventoryList)
                );
                break;

            case ItemType.PETFRAGMENT:
                this.assembleButton.node.active = true;
                this.exchangeButton.node.active = true;
                this.actionButton.node.active = false;
                this.applyOtherItemTab(tabName, inventoryList, () =>
                    this.spawnPetFragment(inventoryList)
                );
                break;

            case ItemType.PET_FOOD:
                this.applyOtherItemTab(tabName, inventoryList, () =>
                    this.spawnFoodItems(inventoryList)
                );
                break;

            default:
                this.applyClothesTab(tabName, inventoryList);
                break;
        }
    }

    private async applyOtherItemTab( itemType: ItemType, list: InventoryDTO[], spawnFn: () => Promise<void>) {
        const isEmpty = this.isEmptyInventory(itemType, list);
        this.noItemContainer.active = isEmpty;
        if( itemType === ItemType.PETFRAGMENT){
                this.assembleButton.interactable = !isEmpty;
                this.exchangeButton.interactable = !isEmpty;
        }
        this.setUIState(itemType);
        await spawnFn();
    }

    private async applyClothesTab(tabName: string, inventoryList: InventoryDTO[]) {
        this.currentTabName = tabName;

        const defaultForTab = this.setClothesItemsDefault()
            .filter(item => item.item?.type?.toLowerCase() === tabName.toLowerCase());

        const combinedList = defaultForTab.length > 0
            ? [...defaultForTab, ...inventoryList]
            : inventoryList;

        this.noItemContainer.active = this.isEmptyInventory(null, combinedList);
        this.setUIState();
        await this.spawnClothesItems(combinedList);
    }

    protected async spawnClothesItems(items: any[]) {
        for (const item of items) {
            let skinLocalData = this.getLocalData(item);
            if (!skinLocalData)
                continue;
            item.item.mappingLocalData ??= skinLocalData;

            if (!item.item.name || item.item.name.trim() === "") {
                item.item.name = skinLocalData.name;
            }
            let itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.itemContainer);

            await this.registUIItemData(itemNode, item,
                (uiItem, data) => {
                    this.onUIItemClick(uiItem, data as Item);
                });
        }
    }

    protected async spawnPetFragment(items: any[]) {
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

    private async fetchAndCacheInventory(tabName: string): Promise<InventoryDTO[]> {
        const list = await WebRequestManager.instance.getItemTypeAsync(tabName);
        this.cachedInventory[tabName] = list;
        return list;
    }

    private isEmptyInventory(itemType: ItemType | null, list: InventoryDTO[]): boolean {
        if (!list || list.length === 0) {
            return true;
        }
       
        if (itemType === ItemType.PET_FOOD ||
            itemType === ItemType.PET_CARD ||
            itemType === ItemType.PETFRAGMENT) {
            return !list.some(i => Number(i.quantity) > 0);
        }
        return false;
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
        }
        else if (item.item.type === ItemType.PETFRAGMENT) {
            this.setupPetFragment(uiItem, item.item);
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
        this.descriptionText.string = `${itemData.name}`;
    }

    private setupPetFragment(uiItem: InventoryUIITem, itemData: Item) {
        uiItem.init(itemData);
        uiItem.setIconByItem(itemData);
        uiItem.setScaleByItemType(itemData.type);
        this.setUIState(ItemType.PET_CARD);
        uiItem.toggleActive(false);
        this.descriptionText.string = `${itemData.name}`;
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
        const isOtherItem = itemType === ItemType.PET_FOOD || itemType === ItemType.PET_CARD || itemType === ItemType.PETFRAGMENT;
        this.goBg.active = isOtherItem;
        this.goListItem.active = !isOtherItem;
        this.goListOtherItem.active = isOtherItem;
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

        if ((data as Item).type === ItemType.PET_CARD || (data as Item).type === ItemType.PETFRAGMENT) {
            this.actionButton.interactable = false;
            return;
        }
        if (this.equipingUIItem) {
            this.actionButton.interactable = this.selectingUIItem.data.id != this.equipingUIItem.data.id;
        } else {
            this.actionButton.interactable = true;
        }
    }

    private async refreshInventoryTab(tabName: string) {
        await WebRequestManager.instance.getUserProfileAsync();
        delete this.cachedInventory[tabName];
        const inventoryList = await this.fetchAndCacheInventory(tabName);
        this.reset();
        switch (tabName) {
            case ItemType.PETFRAGMENT:
                this.applyOtherItemTab(tabName, inventoryList, () =>
                    this.spawnPetFragment(inventoryList)
                );
                break;
            default:
                break;
        }
    }

}
