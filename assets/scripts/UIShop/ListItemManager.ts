import { _decorator, Component, Sprite, RichText, Button, Node, Toggle, ToggleContainer, SpriteFrame, resources, ScrollView, instantiate } from "cc";
import { AbstractItemList } from "../utilities/AbstractItemList";
import { ItemTemplate } from "./ItemTemplate";
import { Item } from "../Model/Item";

const { ccclass, property } = _decorator;

@ccclass
export class ListItemManager extends AbstractItemList {
    @property(Sprite)
    private icon: Sprite = null!;

    @property(RichText)
    private itemName: RichText = null!;
    @property(RichText)
    private itemPrice: RichText = null!;
    @property(RichText)
    private playerCoinsText: RichText = null!;
    @property(RichText)
    private notificationText: RichText = null!;

    @property(Button)
    private buyButton: Button = null!;
    @property(Node)
    private info_Item: Node = null!;
    @property(Node)
    private notificationNode: Node = null!;

    private playerCoins = 500;
    private selectedItem: Item | null = null;
    private items: Item[] = [];

    private currentCategory: string = "hair";
    @property(Toggle)
    private tabHair: Toggle = null!;
    @property(Toggle)
    private tabShirt: Toggle = null!;
    @property(Toggle)
    private tabPants: Toggle = null!;
    @property(ToggleContainer)
    private toggleContainer: ToggleContainer = null!;

    onLoad() {
        this.updatePlayerCoinsUI();
        this.fetchItemsFromServer();
        this.info_Item.active = false;
        this.buyButton.node.on('click', this.onBuyClicked, this);

        this.toggleContainer.node.on('toggle', this.onToggleCategory, this);
        this.tabHair.node.on('click', () => this.changeCategory("hair"));
        this.tabShirt.node.on('click', () => this.changeCategory("shirt"));
        this.tabPants.node.on('click', () => this.changeCategory("pants"));
    }

    onToggleCategory(toggle: Toggle) {
        if (toggle.isChecked) {
            if (toggle === this.tabHair) this.changeCategory("hair");
            else if (toggle === this.tabShirt) this.changeCategory("shirt");
            else if (toggle === this.tabPants) this.changeCategory("pants");
        }
    }

    changeCategory(category: string) {
        this.currentCategory = category;
        this.info_Item.active = false;
        this.populateShop();
        this.updateTabUI();
    }

    updateTabUI() {
        this.tabHair.isChecked = this.currentCategory === "hair";
        this.tabShirt.isChecked = this.currentCategory === "shirt";
        this.tabPants.isChecked = this.currentCategory === "pants";
    }

    fetchItemsFromServer() {
        console.log("Fetching items from server...");

        setTimeout(() => {
            this.items = [
                { id: 1, itemName: "1", itemPrice: 100, iconSF: null!, isOwned: false, category: "hair" },
                { id: 2, itemName: "2", itemPrice: 150, iconSF: null!, isOwned: false, category: "shirt" },
                { id: 3, itemName: "3", itemPrice: 200, iconSF: null!, isOwned: false, category: "pants" },
            ];

            this.items.forEach((item) => {
                this.getSpriteFrameFromResources(item.itemName.toLowerCase(), (spriteFrame) => {
                    item.iconSF = spriteFrame;
                    this.populateShop();
                });
            });
            this.populateShop();
        }, 500);
    }

    populateShop() {
        const filteredItems = this.items.filter(item => item.category === this.currentCategory);
        this.loadItems(filteredItems);
    }

    protected setItemInfo(itemNode: Node, data: Item) {
        (itemNode.getComponent(ItemTemplate) as ItemTemplate)!.init(data, this.onClick.bind(this));
    }

    updatePlayerCoinsUI() {
        this.playerCoinsText.string = `Coins: ${this.playerCoins}`;
    }

    onClick(data: Item) {
        this.info_Item.active = true;
        this.selectedItem = data;
        this.icon.spriteFrame = data.iconSF;
        this.itemName.string = 'Name: ' + data.itemName;
        this.itemPrice.string = data.isOwned ? "Owned" : `Price: ${data.itemPrice}`;
    }

    onBuyClicked() {
        if (this.selectedItem) {
            this.onBuyItem(this.selectedItem);
        } else {
            this.onShowNotification("No item selected!");
        }
    }

    onBuyItem(data: Item) {
        if (data.isOwned) {
            this.onShowNotification("You already own this skin!");
            return;
        }

        if (this.playerCoins >= data.itemPrice) {
            this.playerCoins -= data.itemPrice;
            data.isOwned = true;
            this.updatePlayerCoinsUI();
            this.onClick(data);
            this.onShowNotification("Purchase successful!");
        } else {
            this.onShowNotification("Not enough coins!");
        }
    }

    onShowNotification(message: string) {
        this.notificationNode.active = true;
        this.notificationText.string = message;
        this.scheduleOnce(() => {
            this.notificationText.string = "";
            this.notificationNode.active = false;
        }, 2);
    }
}
