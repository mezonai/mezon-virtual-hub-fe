import { _decorator, Button, EditBox, Label, RichText, Sprite, SpriteFrame } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import Utilities from '../utilities/Utilities';
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
    
    private quantity: number = 1;
    private readonly quantityLimit: number = 1;
    private readonly quantityIncreaseBtn: number = 1;
    private _selectedItemPrice: number;

    public init(param?: PopupBuyQuantityItemParam) {
        if (!param) {
            this.closePopup();
            return;
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
        if(param != null && param.onActionClose != null){
            this._onActionClose = param.onActionClose;
        }
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    private setupQuantityHandlers() {
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
    }
}

export interface PopupBuyQuantityItemParam {
    selectedItemPrice: number;
    spriteMoneyValue : SpriteFrame;
    textButtonLeft: string;
    textButtonRight: string;
    onActionButtonLeft?: () => void;
    onActionButtonRight: (quantity: number) => void;
    onActionClose?: () => void;
}

