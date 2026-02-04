import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Toggle } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ClansData } from '../Interface/DataMapAPI';
import { PlantDataDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { ShopClanItem } from '../Clan/ShopClanItem';
import { PopupBuyQuantityItem, PopupBuyQuantityItemParam } from '../PopUp/PopupBuyQuantityItem';
import { Constants } from '../utilities/Constants';
import { BuyItemPayload, ItemClanType, InventoryType, Item, ItemDTO, ItemType, PurchaseMethod, RewardType, RecipeDTO, IngredientDTO, RecipeType } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { LoadingManager } from './LoadingManager';
import { BaseTabController } from '../ui/BaseTabController';
import { ShopClanTool } from '../Clan/ShopClanTool';
import { Sprite } from 'cc';
import { InventoryClanUIItemMini } from '../Clan/InventoryClanUIItemMini';
const { ccclass, property } = _decorator;

interface BuyContext {
    recipeId?: string;
    plantId?: string;
    price: number;
    ingredientDTO?: IngredientDTO[];
    inventoryType: string;
}

@ccclass('PopupClanShop')
export class PopupClanShop extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) buyPlantButton: Button = null;
    @property(Button) buyToolButton: Button = null;
    @property(Button) buyPetButton: Button = null;

    @property(Node) nodeShopClanPlant: Node = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svShopClan: ScrollView = null!;
    @property(RichText) plantNamert: RichText = null;
    @property(Label) descriptionrt: Label = null;
    @property(RichText) growTimert: RichText = null;
    @property(RichText) harvestScorert: RichText = null;
    @property(RichText) priceBuyrt: RichText = null;

    @property(Prefab) itemRecipePrefab: Prefab = null!;
    @property(Prefab) itemToolExChange: Prefab = null!;

    @property(ScrollView) svShopClanTool: ScrollView = null!;
    @property(Node) nodeShopClanTool: Node = null!;
    @property(RichText) toolNamert: RichText = null;
    @property(Label) toolDescriptionrt: Label = null;
    @property(RichText) useTime: RichText = null;
    @property(RichText) toolpriceBuyrt: RichText = null;
    @property(Node) itemExChange: Node = null!;
    @property(ScrollView) svShopClanToolExChange: ScrollView = null!;

    @property(ScrollView) svShopClanPet: ScrollView = null!;
    @property(Node) nodeShopClanPet: Node = null!;
    @property(RichText) petNamert: RichText = null;
    @property(Label) petDescriptionrt: Label = null;
    @property(RichText) petRateAffect: RichText = null;
    @property(RichText) petPriceBuyrt: RichText = null;
    @property(Node) itemPetExChange: Node = null!;
    @property(ScrollView) svShopClanPetExChange: ScrollView = null!;

    @property(Node) noItemPanel: Node = null;
    @property(Sprite) iconSeed: Sprite = null!;
    @property(Sprite) iconTool: Sprite = null!;
    @property(Sprite) iconPet: Sprite = null!;

    private clanDetailId: string;
    private plantDataDTO: PlantDataDTO[] = [];
    private toolRecipeDTO: RecipeDTO[] = [];
    private petRecipeDTO: RecipeDTO[] = [];

    private _plantsDataDTO: ShopClanItem[] = [];
    private _toolsDataDTO: ShopClanTool[] = [];
    private _petsDataDTO: ShopClanTool[] = [];

    private selectingUIItem: ShopClanItem = null;
    private selectingUITool: ShopClanTool = null;
    private selectingUIPet: ShopClanTool = null;

    private isOpenPopUp: boolean = false;
    private param: PopupClanShopParam = null;
    private currentMode: ItemType = ItemType.FARM_PLANT;

    @property(Toggle) tabPlantTog: Toggle = null!;
    @property(Toggle) tabToolTog: Toggle = null!;
    @property(Toggle) tabPetTog: Toggle = null!;

    public init(param?: PopupClanShopParam): void {
        if (!param){
            this.closePopup();
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.closePopup();
            this.closeButton.interactable = true;
        });
        
        if (param) {
            this.param = param;
            this.clanDetailId = param?.clanDetailId;
        }
        if (param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }

        this.buyPlantButton.addAsyncListener(async () => {
            this.buyPlantButton.interactable = false;
            await this.actionBuy(RecipeType.PLANT);
            this.buyPlantButton.interactable = true;
        });

        this.buyToolButton.addAsyncListener(async () => {
            this.buyToolButton.interactable = false;
            await this.actionBuy(RecipeType.FARM_TOOL);
            this.buyToolButton.interactable = true;
        });

        this.buyPetButton.addAsyncListener(async () => {
            this.buyPetButton.interactable = false;
            await this.actionBuy(RecipeType.PET_CLAN);
            this.buyPetButton.interactable = true;
        });

        this.tabPlantTog.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ItemType.FARM_PLANT);
            },
            this
        );

        this.tabToolTog.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ItemType.FARM_TOOL);
            },
            this
        );

        this.tabPetTog.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ItemType.PET_CLAN);
            },
            this
        );

        this.nodeShopClanPlant.active = true;
        this.nodeShopClanTool.active = false;
        this.nodeShopClanPet.active = false;
        this.currentMode = ItemType.FARM_PLANT;
        this.initListFarmPlants();
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    private async switchMode(mode: ItemType) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        this.updateTabVisibility();
        switch (mode) {
            case ItemType.FARM_PLANT:
                this.initListFarmPlants();
                break;
            case ItemType.FARM_TOOL:
                this.initListFarmTools();
                break;
            case ItemType.PET_CLAN:
                this.initListFarmPet();
                break;
        }
    }

    private updateTabVisibility() {
        this.nodeShopClanPlant.active = this.currentMode === ItemType.FARM_PLANT;
        this.nodeShopClanTool.active = this.currentMode === ItemType.FARM_TOOL;
        this.nodeShopClanPet.active = this.currentMode === ItemType.PET_CLAN;
        this.noItemPanel.active = false;
    }
 
    async initListFarmPlants() {
        try {
            LoadingManager.getInstance().openLoading();
            this.plantDataDTO = await WebRequestManager.instance.getShopPlantAsync();
            this.loadFromServerFarmPlants(this.plantDataDTO);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    public loadFromServerFarmPlants(data: PlantDataDTO[]) {
        this.noItemPanel.active = !data.length;
        this.svShopClan.content.removeAllChildren();
        this._plantsDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemPrefab);
            const plantItem = slotNode.getComponent(ShopClanItem);
            if (plantItem) {
                plantItem.initPlant(element, (slot) => {
                    this.showSlotDetailFarmPlant(slot);
                });
            }
            slotNode.setParent(this.svShopClan.content);
            this._plantsDataDTO.push(plantItem);
        }
        this.setDefaultDetailFarmPlant();
    }

    async initListFarmTools() {
        try {
            LoadingManager.getInstance().openLoading();
            this.toolRecipeDTO = await WebRequestManager.instance.getAllRecipeByTypeAsync(ItemType.FARM_TOOL);
            this.loadFromServerFarmTools(this.toolRecipeDTO);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    public loadFromServerFarmTools(data: RecipeDTO[]) {
        this.noItemPanel.active = !data.length;
        this.svShopClanTool.content.removeAllChildren();
        this._toolsDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemRecipePrefab);
            const toolFarm = slotNode.getComponent(ShopClanTool);
            if (toolFarm) {
                toolFarm.initItemToolFarm(element, (slot) => {
                    this.showSlotDetailFarmTool(slot);
                });
            }
            slotNode.setParent(this.svShopClanTool.content);
            this._toolsDataDTO.push(toolFarm);
        }
       this.setDefaultDetailFarmTool();
    }

    async initListFarmPet() {
        try {
            LoadingManager.getInstance().openLoading();
            this.toolRecipeDTO = await WebRequestManager.instance.getAllRecipeByTypeAsync(ItemType.PET_CLAN);
            this.loadFromServerFarmPet(this.toolRecipeDTO);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

     public loadFromServerFarmPet(data: RecipeDTO[]) {
        this.noItemPanel.active = !data.length;
        this.svShopClanPet.content.removeAllChildren();
        this._petsDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemRecipePrefab);
            const petFarm = slotNode.getComponent(ShopClanTool);
            if (petFarm) {
                petFarm.initItemToolFarm(element, (slot) => {
                    this.showSlotDetailFarmPet(slot);
                });
            }
            slotNode.setParent(this.svShopClanPet.content);
            this._petsDataDTO.push(petFarm);
        }
       this.setDefaultDetailPetFarm();
    }

    setDefaultDetailFarmPlant() {
        if (!this._plantsDataDTO || this._plantsDataDTO.length === 0) return;
        const firstItem = this._plantsDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    setDefaultDetailFarmTool() {
        if (!this._toolsDataDTO || this._toolsDataDTO.length === 0) return;
        const firstItem = this._toolsDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    setDefaultDetailPetFarm() {
        if (!this._petsDataDTO || this._petsDataDTO.length === 0) return;
        const firstItem = this._petsDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    private showSlotDetailFarmPlant(item: ShopClanItem) {
        this.selectingUIItem = item;
        this.iconSeed.spriteFrame = ItemIconManager.getInstance().getIconFarmPlant(item.plant.name);
        this.descriptionrt.string = ` ${item.plant.description}`;
        this.plantNamert.string = `<outline color=#222222 width=1> ${Constants.getPlantName(item.plant.name)}</outline>`;
        this.growTimert.string = `<outline color=#222222 width=1> ${item.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222222 width=1> ${item.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222222 width=1> ${item.plant.buy_price}</outline>`;
    }

    private async showSlotDetailFarmTool(item: ShopClanTool) {
        this.selectingUITool = item;
        this.iconTool.spriteFrame = await ItemIconManager.getInstance().getIconItemDto(item.recipe.item);
        const percent = Math.round(item.recipe.item.rate * 100);
        this.toolDescriptionrt.string = ` Công cụ hỗ trợ giúp bạn sử dụng trong nông trại ${item.recipe.item.name} với tỉ lệ dùng [ ${percent}% ] `;
        this.toolNamert.string = `<outline color=#222222 width=1> ${item.recipe.item.name}</outline>`;
        this.useTime.string = `<outline color=#222222 width=1> ${Math.round(item.recipe.item.rate * 100)} %</outline>`;
        this.toolpriceBuyrt.string = `<outline color=#222222 width=1> ${item.recipe.item.gold}</outline>`;
        this.itemExChange.active = item.recipe.ingredients?.length > 0;
        if (item.recipe.ingredients?.length > 0) {
            this.svShopClanToolExChange.content.removeAllChildren();
            for (const element of item.recipe.ingredients) {
                const itemNode = instantiate(this.itemToolExChange);
                const farmTool = itemNode.getComponent(InventoryClanUIItemMini);
                if (farmTool) {
                    farmTool.setupItem(element);
                }
                itemNode.setParent(this.svShopClanToolExChange.content);
            }
        }
        const canBuy = this.checkEnoughIngredientsForTool(item.recipe.ingredients);
        this.buyToolButton.interactable = canBuy;
    }

    private showSlotDetailFarmPet(pet: ShopClanTool) {
        this.selectingUIPet = pet;
        this.iconPet.spriteFrame = ItemIconManager.getInstance().getIconFarmPet(pet.recipe.pet_clan.type.toString());
        this.descriptionrt.string = ` ${pet.recipe.pet_clan.description}`;
        this.petNamert.string = `<outline color=#222222 width=1> ${Constants.getPlantName(pet.recipe.pet_clan.name)}</outline>`;
        this.petRateAffect.string = `<outline color=#222222 width=1> ${pet.recipe.pet_clan.base_rate_affect} %</outline>`;
        const ingredients = pet.recipe.ingredients;
        let priceGold = 0;
        if (ingredients && ingredients.length > 0) {
            const goldIngredient = ingredients.find(i => i.gold && i.gold > 0);
            if (goldIngredient) {
                priceGold = goldIngredient.gold;
                this.petPriceBuyrt.string = `<outline color=#222222 width=1> ${priceGold}</outline>`;
            } 
            else {
                for (const element of ingredients) {
                    const itemNode = instantiate(this.itemToolExChange);
                    const farmPet = itemNode.getComponent(InventoryClanUIItemMini);
                    if (farmPet) {
                        farmPet.setupItem(element);
                    }
                    itemNode.setParent(this.svShopClanPetExChange.content);
                }
            }
        }
    }

    private checkEnoughIngredientsForTool( ingredients?: IngredientDTO[] | null): boolean {
        if (!ingredients || ingredients.length === 0) return true;

        return ingredients.every(ing => {
            const need = ing.required_quantity;
            const have = ing.current_quantity ?? 0;
            return have >= need;
        });
    }

    private getBuyContext(): BuyContext | null {
        if (this.currentMode === ItemType.FARM_PLANT && this.selectingUIItem) {
            const p = this.selectingUIItem.plant;
            return {
                plantId: p.id,
                price: p.buy_price,
                inventoryType: ItemClanType.PLANT,
            };
        }

        if (this.currentMode === ItemType.FARM_TOOL && this.selectingUITool) {
            const recipe = this.selectingUITool.recipe;
            return {
                recipeId: recipe.id,
                price: recipe.item.gold,
                ingredientDTO: recipe.ingredients,
                inventoryType: ItemClanType.TOOL,
            };
        }
        return null;
    }


    private showBuyQuantityPopup(price: number, ingredientDTO?: IngredientDTO[]): Promise<number> {
        return new Promise(resolve => {
            if (this.isOpenPopUp) return resolve(null);
            this.isOpenPopUp = true;
            const ingredients = ingredientDTO ?? [];
            PopupManager.getInstance().openAnimPopup(
                'PopupBuyQuantityItem',
                PopupBuyQuantityItem,
                <PopupBuyQuantityItemParam>{
                    selectedItemPrice: price,
                    ingredientDTO: ingredients,
                    spriteMoneyValue: ItemIconManager.getInstance().getIconPurchaseMethod(RewardType.GOLD),
                    textButtonLeft: 'Thôi',
                    textButtonRight: 'Mua',
                    onActionButtonLeft: () => resolve(null),
                    onActionButtonRight: q => resolve(q),
                    onActionClose: () => (this.isOpenPopUp = false)
                }
            );
        });
    }

    async actionBuy(type: RecipeType) {
        if(type == RecipeType.PET_CLAN){
            const pet = this.selectingUIPet.recipe.pet_clan;
            if(pet.current_pet_quantity >= pet.max_pet_quantity){
                Constants.showConfirm("Mỗi Nông trại chỉ có tối đa 1 pet cho loại này");
                return;
            }
            const payload: any = {
                clanId: this.clanDetailId, 
                quantity: 1,
                type,
                recipeId: this.selectingUIPet.recipe.id
            };
            ServerManager.instance.sendBuyItem(payload);
            return;
        }

        const context = this.getBuyContext();
        if (!context) return;
        const quantity = await this.showBuyQuantityPopup(context.price, context.ingredientDTO );
        if (!quantity) return;

        if (context.inventoryType === ItemClanType.TOOL && context.ingredientDTO?.length) {
            const isEnough = this.checkEnoughIngredients(
                context.ingredientDTO,
                quantity
            );

            if (!isEnough) {
                Constants.showConfirm('Không đủ vật phẩm để đổi.');
                return;
            }
        }

        const fundRes = await WebRequestManager.instance.getClanFundAsync(
            UserMeManager.Get.clan.id
        );
        const gold = fundRes?.funds.find(f => f.type === 'gold')?.amount ?? 0;

        if (gold < context.price * quantity) {
            Constants.showConfirm('Không đủ vàng trong quỹ văn phòng.');
            return;
        }

        const payload: any = {
            clanId: this.clanDetailId,
            quantity,
            type
        };

        if (context.recipeId) {
            payload.recipeId = context.recipeId;
        }

        if (context.plantId) {
            payload.plantId = context.plantId;
        }

        ServerManager.instance.sendBuyItem(payload);
    }

    private checkEnoughIngredients(ingredients: IngredientDTO[], quantity: number): boolean {
        if (!ingredients || ingredients.length === 0) return true;

        for (const ing of ingredients) {
            const need = ing.required_quantity * quantity;
            const have = ing.current_quantity ?? 0;

            if (have < need) {
                console.warn(
                    `Không đủ vật phẩm: cần ${need}, hiện có ${have}`,
                    ing
                );
                return false;
            }
        }
        return true;
    }

    public async ReloadAfterBuyItem() {
        if (this.currentMode === ItemType.FARM_TOOL && this.selectingUITool) {
            await this.syncCurrentIngredientsForSelectedTool();
            await this.showSlotDetailFarmTool(this.selectingUITool);
        }
        this.param?.onBuySuccess?.();
    }

    private async syncCurrentIngredientsForSelectedTool() {
        if (!this.selectingUITool) return;

        this.toolRecipeDTO =
            await WebRequestManager.instance.getAllRecipeByTypeAsync(
                ItemType.FARM_TOOL
            );

        const ingredientQuantityMap = new Map<string, number>();

        for (const recipe of this.toolRecipeDTO) {
            for (const ing of recipe.ingredients ?? []) {
                if (!ing.item_id && !ing.plant_id) continue;

                const key = ing.item_id
                    ? `item_${ing.item_id}`
                    : `plant_${ing.plant_id}`;

                ingredientQuantityMap.set(key, ing.current_quantity ?? 0);
            }
        }

        for (const ing of this.selectingUITool.recipe.ingredients) {
            if (!ing.item_id && !ing.plant_id) continue;

            const key = ing.item_id
                ? `item_${ing.item_id}`
                : `plant_${ing.plant_id}`;

            ing.current_quantity = ingredientQuantityMap.get(key) ?? 0;
        }
    }
}

export interface PopupClanShopParam {
    clanDetailId: string;
    onBuySuccess?: () => void;
    onActionClose?: () => void;
}

