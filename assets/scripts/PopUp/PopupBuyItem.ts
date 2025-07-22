import { _decorator, Button, Label, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupBuyItem')
export class PopupBuyItem extends BasePopup {
    @property({ type: Label }) priceBuyQuantity: Label = null;
    @property({ type: Button }) buttonLeft: Button = null
    @property({ type: RichText }) contentButtonLeft: RichText = null
    @property({ type: Button }) buttonRight: Button = null
    @property({ type: RichText }) contentButtonRight: RichText = null

    public init(param?: PopupBuyItemParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.priceBuyQuantity.string = param.selectedItemPrice;

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
                param.onActionButtonRight?.();
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
}

export interface PopupBuyItemParam {
    selectedItemPrice: string;
    textButtonLeft: string;
    textButtonRight: string;
    onActionButtonLeft?: () => void;
    onActionButtonRight?: () => void;
    onActionClose?: () => void;
}

