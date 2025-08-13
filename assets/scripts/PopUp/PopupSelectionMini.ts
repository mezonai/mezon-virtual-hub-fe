import { _decorator, Button, Component, Node, Label, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { AudioType, SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('PopupSelectionMini')
export class PopupSelectionMini extends BasePopup {
    @property(RichText) titleLabel: RichText = null!;
    @property({ type: Button }) buttonLeft: Button = null
    @property({ type: RichText }) contentButtonLeft: RichText = null
    @property({ type: Button }) buttonRight: Button = null
    @property({ type: RichText }) contentButtonRight: RichText = null
    @property({ type: Button }) buttonCenter: Button = null
    @property({ type: RichText }) contentButtonCenter: RichText = null
    @property({ type: RichText }) contentPopup: RichText = null

    public init(param?: SelectionMiniParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        SoundManager.instance.playSound(AudioType.Notice);
        this.contentPopup.string = param.content;
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

        if (param.textButtonCenter != "") {
            this.contentButtonCenter.string = param.textButtonCenter;
            this.buttonCenter.node.on(Button.EventType.CLICK, () => {
                param.onActionButtonCenter?.();
                this.closePopup();
            }, this);
        } else this.buttonCenter.node.active = false;
        if(param != null && param.onActionClose != null){
            this._onActionClose = param.onActionClose;
        }
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }
}

export interface SelectionMiniParam {
    title: string;
    textButtonLeft: string;
    textButtonRight: string;
    textButtonCenter: string;
    content: string;
    onActionButtonLeft?: () => void;
    onActionButtonRight?: () => void;
    onActionButtonCenter?: () => void;
    onActionClose?: () => void;
}


