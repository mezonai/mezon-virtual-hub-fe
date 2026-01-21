import { _decorator, Button, EditBox, Label, RichText, Sprite, SpriteFrame, Node, ScrollView, Prefab, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import Utilities from '../utilities/Utilities';
import { IngredientDTO } from '../Model/Item';
import { InventoryClanUIItemMini } from '../Clan/InventoryClanUIItemMini';
const { ccclass, property } = _decorator;

@ccclass('PopupBuyItem')
export class PopupBuyQuantityItem extends BasePopup {
    @property({ type: Label }) priceBuyQuantity: Label = null;
    @property({ type: Button }) buttonLeft: Button = null
    @property({ type: RichText }) contentButtonLeft: RichText = null
    @property({ type: Button }) buttonRight: Button = null
    @property({ type: RichText }) contentButtonRight: RichText = null
    @property({ type: EditBox }) quantityItemFood: EditBox = null;
    @property({ type: Button }) increaseQuantityBtn: Button = null;
    @property({ type: Button }) decreaseQuantityBtn: Button = null;
    @property({ type: Sprite }) iconMoneyFrame: Sprite = null;
    @property(Node) nodeItemExChange: Node = null!;
    @property(ScrollView) svShopClanToolExChange: ScrollView = null!;
    @property(Prefab) itemToolExChange: Prefab = null!;

    private quantity: number = 1;
    private readonly quantityLimit: number = 1;
    private readonly quantityIncreaseBtn: number = 1;
    private _selectedItemPrice: number;
    private ingredientNodes: InventoryClanUIItemMini[] = [];
    private ingredientData: IngredientDTO[] = [];

    public init(param?: PopupBuyQuantityItemParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        const ingredients = param.ingredientDTO ?? [];
        this.nodeItemExChange.active = ingredients.length > 0;
        if (ingredients.length > 0 && this.nodeItemExChange.active) {
            this.ingredientNodes = [];
            this.ingredientData = ingredients;
            this.svShopClanToolExChange.content.removeAllChildren();
            for (const element of ingredients) {
                const itemNode = instantiate(this.itemToolExChange);
                const farmTool = itemNode.getComponent(InventoryClanUIItemMini);
                if (farmTool) {
                    farmTool.setupItem(element, this.quantity);
                    this.ingredientNodes.push(farmTool);
                }
                itemNode.setParent(this.svShopClanToolExChange.content);
            }
        }

        this._selectedItemPrice = param.selectedItemPrice;
        this.iconMoneyFrame.spriteFrame = param.spriteMoneyValue;
        this.setupQuantityHandlers();

        if (param.textButtonLeft != "") {
            this.contentButtonLeft.string = param.textButtonLeft;
            this.buttonLeft.node.on(Button.EventType.CLICK, () => {
                param.onActionButtonLeft?.();
                this.closePopup();
            }, this);
        }
        else this.buttonLeft.node.active = false;

        if (param.textButtonRight != "") {
            this.contentButtonRight.string = param.textButtonRight;
            this.buttonRight.node.on(Button.EventType.CLICK, () => {
                param.onActionButtonRight?.(this.quantity);
                this.closePopup();
            }, this);
        } else this.buttonRight.node.active = false;
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    private setupQuantityHandlers() {
        this.increaseQuantityBtn.node.off(Button.EventType.CLICK, this.onIncreaseQuantity, this);
        this.decreaseQuantityBtn.node.off(Button.EventType.CLICK, this.onDecreaseQuantity, this);
        this.quantityItemFood.node.off(EditBox.EventType.TEXT_CHANGED, this.onQuantityChanged, this);

        this.increaseQuantityBtn.node.on(Button.EventType.CLICK, this.onIncreaseQuantity, this);
        this.decreaseQuantityBtn.node.on(Button.EventType.CLICK, this.onDecreaseQuantity, this);
        this.quantityItemFood.node.on(EditBox.EventType.TEXT_CHANGED, this.onQuantityChanged, this);

        this.updateQuantityUI();
    }

    private onIncreaseQuantity() {
        this.quantity += this.quantityIncreaseBtn;
        this.updateQuantityUI();
    }

    private onDecreaseQuantity() {
        this.quantity = Math.max(this.quantity - this.quantityIncreaseBtn, this.quantityLimit);
        this.updateQuantityUI();
    }

    private onQuantityChanged(editbox: EditBox) {
        const cleanString = editbox.string.replace(/[^0-9]/g, '');
        if (editbox.string !== cleanString) {
            editbox.string = cleanString;
        }

        const value = parseInt(cleanString);
        this.quantity = isNaN(value) || value < this.quantityLimit ? this.quantityLimit : value;

        this.updateQuantityUI();
    }

    private updateQuantityUI() {
        this.quantityItemFood.string = this.quantity.toString();

        const totalPrice = this._selectedItemPrice * this.quantity;
        this.priceBuyQuantity.string = Utilities.convertBigNumberToStr(totalPrice);

        this.decreaseQuantityBtn.interactable = this.quantity > this.quantityLimit;

        if (this.ingredientNodes.length) {
            for (let i = 0; i < this.ingredientNodes.length; i++) {
                this.ingredientNodes[i].setupItem(
                    this.ingredientData[i],
                    this.quantity
                );
            }
        }

        const canBuy = this.checkEnoughIngredients(this.quantity);
        this.buttonRight.interactable = canBuy;
    }

    private checkEnoughIngredients(quantity: number): boolean {
        if (!this.ingredientData || this.ingredientData.length === 0) return true;

        return this.ingredientData.every(ing => {
            const need = ing.required_quantity * quantity;
            const have = ing.current_quantity ?? 0;
            return have >= need;
        });
    }
}

export interface PopupBuyQuantityItemParam {
    selectedItemPrice: number;
    ingredientDTO?: IngredientDTO[];
    spriteMoneyValue: SpriteFrame;
    textButtonLeft: string;
    textButtonRight: string;
    onActionButtonLeft?: () => void;
    onActionButtonRight: (quantity: number) => void;
    onActionClose?: () => void;
}

