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
import { BuyItemPayload, InventoryClanType, InventoryType, Item, ItemDTO, ItemType, PurchaseMethod, RewardType } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { LoadingManager } from './LoadingManager';
import { BaseTabController } from '../ui/BaseTabController';
import { ShopClanTool } from '../Clan/ShopClanTool';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

interface BuyContext {
    id: string;
    price: number;
    inventoryType: string;
}

@ccclass('PopupClanShop')
export class PopupClanShop extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) buyButton: Button = null;
    @property(Button) buyToolButton: Button = null;

    @property(Node) nodeShopClan: Node = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svShopClan: ScrollView = null!;
    @property(RichText) plantNamert: RichText = null;
    @property(Label) descriptionrt: Label = null;
    @property(RichText) growTimert: RichText = null;
    @property(RichText) harvestScorert: RichText = null;
    @property(RichText) priceBuyrt: RichText = null;

    @property(ScrollView) svShopClanTool: ScrollView = null!;
    @property(Prefab) itemToolPrefab: Prefab = null!;
    @property(Node) nodeShopClanTool: Node = null!;
    @property(RichText) toolNamert: RichText = null;
    @property(Label) toolDescriptionrt: Label = null;
    @property(RichText) useTime: RichText = null;
    @property(RichText) toolpriceBuyrt: RichText = null;

    @property(Node) noItemPanel: Node = null;
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property(Sprite) icon: Sprite = null!;

    private clanDetail: ClansData;
    private plantDataDTO: PlantDataDTO[] = [];
    private farmToolsDTO: Item[] = [];
    private _plantDataDTO: ShopClanItem[] = [];
    private _farmToolDataDTO: ShopClanTool[] = [];
    private selectingUIItem: ShopClanItem = null;
    private selectingUITool: ShopClanTool = null;
    private quantityBuy: number = 1;
    private isOpenPopUp: boolean = false;
    private param: PopupClanShopParam = null;
    private currentMode: ItemType = ItemType.FARM_PLANT;
    @property(Toggle) tabPlantButton: Toggle = null!;
    @property(Toggle) tabToolButton: Toggle = null!;
    private isPlantDefaultSet = false;
    private isToolDefaultSet = false;


    public init(param?: PopupClanShopParam): void {

        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });

        if (param) {
            this.param = param;
            this.clanDetail = param?.clanDetail;
        }

        this.buyButton.addAsyncListener(async () => {
            this.buyButton.interactable = false;
            await this.actionBuy();
            this.buyButton.interactable = true;
        });

        this.buyToolButton.addAsyncListener(async () => {
            this.buyToolButton.interactable = false;
            await this.actionBuy();
            this.buyToolButton.interactable = true;
        });

        this.tabPlantButton.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ItemType.FARM_PLANT);
            },
            this
        );

        this.tabToolButton.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ItemType.FARM_TOOL);
            },
            this
        );
        this.nodeShopClan.active = true;
        this.nodeShopClanTool.active = false;
        this.currentMode = ItemType.FARM_PLANT;
        this.initListFarmPlants();
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
        }
    }

    private updateTabVisibility() {
        this.nodeShopClan.active = this.currentMode === ItemType.FARM_PLANT;
        this.nodeShopClanTool.active = this.currentMode === ItemType.FARM_TOOL;
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
        this.svShopClan.content.removeAllChildren();
        this._plantDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemPrefab);
            const plantItem = slotNode.getComponent(ShopClanItem);
            if (plantItem) {
                plantItem.initPlant(element, (slot) => {
                    this.showSlotDetail(slot);
                });
            }
            slotNode.setParent(this.svShopClan.content);
            this._plantDataDTO.push(plantItem);
        }
        this.setDefaultDetailItem();
    }

    async initListFarmTools() {
        try {
            LoadingManager.getInstance().openLoading();
            this.farmToolsDTO = await WebRequestManager.instance.getAllItemFarmToolsFilterAsync({type: ItemType.FARM_TOOL});
            this.loadFromServerFarmTools(this.farmToolsDTO);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    public loadFromServerFarmTools(data: Item[]) {
        this.svShopClanTool.content.removeAllChildren();
        this._farmToolDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemToolPrefab);
            const farmTool = slotNode.getComponent(ShopClanTool);
            if (farmTool) {
                farmTool.initItemFarmTool(element, (slot) => {
                    this.showSlotDetailFarmTool(slot);
                });
            }
            slotNode.setParent(this.svShopClanTool.content);
            this._farmToolDataDTO.push(farmTool);
        }
       this.setDefaultDetailFarmTool();
    }

    setDefaultDetailItem() {
        if (!this._plantDataDTO || this._plantDataDTO.length === 0) return;
        const firstItem = this._plantDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    setDefaultDetailFarmTool() {
        if (!this._farmToolDataDTO || this._farmToolDataDTO.length === 0) return;
        const firstItem = this._farmToolDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    private showSlotDetail(item: ShopClanItem) {
        this.selectingUIItem = item;
        const sprite = this.iconItemUIHelper.getPlantIcon(item.plant.name);
        if (sprite) this.iconItemUIHelper.icon.spriteFrame = sprite;

        this.descriptionrt.string = ` ${item.plant.description}`;
        this.plantNamert.string = `<outline color=#222222 width=1> ${item.plant.name}</outline>`;
        this.growTimert.string = `<outline color=#222222 width=1> ${item.plant.grow_time} s</outline>`;
        this.harvestScorert.string = `<outline color=#222222 width=1> ${item.plant.harvest_point}</outline>`;
        this.priceBuyrt.string = `<outline color=#222222 width=1> ${item.plant.buy_price}</outline>`;
    }

    private async showSlotDetailFarmTool(item: ShopClanTool) {
        this.selectingUITool = item;
        this.icon.spriteFrame = await ItemIconManager.getInstance().getIconItemDto(item.farmTool);
        this.toolDescriptionrt.string = `${item.farmTool.name} \n [ ${Math.round(item.farmTool.rate * 100)} ] %`;
        this.toolNamert.string = `<outline color=#222222 width=1> ${item.farmTool.name}</outline>`;
        this.useTime.string = `<outline color=#222222 width=1> ${Math.round(item.farmTool.rate * 100)} %</outline>`;
        this.toolpriceBuyrt.string = `<outline color=#222222 width=1> ${item.farmTool.gold}</outline>`;
    }

    private getBuyContext(): BuyContext | null {
        if (this.currentMode === ItemType.FARM_PLANT && this.selectingUIItem) {
            const p = this.selectingUIItem.plant;
            return { id: p.id, price: p.buy_price, inventoryType: InventoryClanType.PLANT };
        }

        if (this.currentMode === ItemType.FARM_TOOL && this.selectingUITool) {
            const t = this.selectingUITool.farmTool;
            return { id: t.id, price: t.gold, inventoryType: t.item_code };
        }
        return null;
    }

    private showBuyQuantityPopup(price: number): Promise<number> {
        return new Promise(resolve => {
            if (this.isOpenPopUp) return resolve(null);
            this.isOpenPopUp = true;

            PopupManager.getInstance().openAnimPopup(
                'PopupBuyQuantityItem',
                PopupBuyQuantityItem,
                <PopupBuyQuantityItemParam>{
                    selectedItemPrice: price,
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

    async actionBuy() {
        const context = this.getBuyContext();
        if (!context) return;

        const quantity = await this.showBuyQuantityPopup(context.price);
        if (!quantity) return;

        const fundRes = await WebRequestManager.instance.getClanFundAsync(UserMeManager.Get.clan.id);
        const gold = fundRes?.funds.find(f => f.type === 'gold')?.amount ?? 0;

        if (gold < context.price * quantity) {
            Constants.showConfirm('Không đủ vàng trong quỹ văn phòng.');
            return;
        }

        const payload: BuyItemPayload = {
            clanId: this.clanDetail.id,
            itemId: context.id,
            quantity,
            type: context.inventoryType
        };

        ServerManager.instance.sendBuyItem(payload);
    }

    public async ReloadAfterBuyItem() {
        this.quantityBuy = 1;
        this.param?.onBuySuccess?.();
    }
}

export interface PopupClanShopParam {
    clanDetail: ClansData;
    onBuySuccess?: () => void;
}

