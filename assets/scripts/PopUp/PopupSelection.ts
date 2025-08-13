import { _decorator, Button, Component, Node, Label, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupSelection')
export class PopupSelection extends BasePopup {
    @property({ type: Button }) buttonLeft: Button = null
    @property({ type: RichText }) contentButtonLeft: RichText = null
    @property({ type: Button }) buttonRight: Button = null
    @property({ type: RichText }) contentButtonRight: RichText = null
    @property({ type: Button }) buttonCenter: Button = null
    @property({ type: RichText }) contentButtonCenter: RichText = null
    @property({ type: RichText }) contentPopup: RichText = null


    public async init(param?: SelectionParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.contentPopup.string = param.content;
        if (param.textButtonLeft != "") {
            this.contentButtonLeft.string = param.textButtonLeft;
            this.buttonLeft.addAsyncListener(async () => {
                this.buttonLeft.interactable = true;
                await param.onActionButtonLeft?.();
                this.closePopup();
            })
        }
        else this.buttonLeft.node.active = false;

        if (param.textButtonRight != "") {
            this.contentButtonRight.string = param.textButtonRight;
            this.buttonRight.addAsyncListener(async () => {
                this.buttonRight.interactable = true;
                await param.onActionButtonRight?.();
                this.closePopup();
            })
        } else this.buttonRight.node.active = false;

        if (param.textButtonCenter != "") {
            this.contentButtonCenter.string = param.textButtonCenter;
            this.buttonCenter.addAsyncListener(async () => {
                this.buttonCenter.interactable = true;
                param.onActionButtonCenter?.();
                this.closePopup();
            })
        } else this.buttonCenter.node.active = false;

    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }
}

export interface SelectionParam {
    textButtonLeft: string;
    textButtonRight: string;
    textButtonCenter: string;
    content: string;
    onActionButtonLeft?: () => Promise<void>;
    onActionButtonRight?: () => Promise<void>;
    onActionButtonCenter?: () => Promise<void>;
}


