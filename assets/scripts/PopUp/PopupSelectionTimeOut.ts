import { _decorator, Button, Component, Node, Label, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { AudioType, SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

export enum TargetButton {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
}

@ccclass('PopupSelectionTimeOut')
export class PopupSelectionTimeOut extends BasePopup {
    @property(RichText) titleLabel: RichText = null!;
    @property({ type: Button }) buttonLeft: Button = null
    @property({ type: RichText }) contentButtonLeft: RichText = null
    @property({ type: Button }) buttonRight: Button = null
    @property({ type: RichText }) contentButtonRight: RichText = null
    @property({ type: Button }) buttonCenter: Button = null
    @property({ type: RichText }) contentButtonCenter: RichText = null
    @property({ type: RichText }) contentPopup: RichText = null

    private timeoutIntervalId: number = 0;
    private timeoutCloseId: number = 0;

    public init(param?: SelectionTimeOutParam) {
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

        this.setupCountdownButtonIfNeeded(param);
    }

    private setupCountdownButtonIfNeeded(param: SelectionTimeOutParam) {
        const timeout = param.timeout;
        if (!timeout || timeout.seconds <= 0) return;

        const { targetButton, seconds } = timeout;
        let textTimeOut: RichText | null = null;

        switch (targetButton) {
            case TargetButton.LEFT:
                textTimeOut = this.buttonLeft.node.active ? this.contentButtonLeft : null;
                break;
            case TargetButton.RIGHT:
                textTimeOut = this.buttonRight.node.active ? this.contentButtonRight : null;
                break;
            case TargetButton.CENTER:
                textTimeOut = this.buttonCenter.node.active ? this.contentButtonCenter : null;
                break;
        }

        if (textTimeOut) {
            const prefix = textTimeOut.string + " (";
            const afterfix = "s)";
            this.closeAfterTimeout(prefix, afterfix, textTimeOut, seconds);

            this.timeoutCloseId = setTimeout(() => {
                this.closePopup();
                param.onActionClose?.();
            }, seconds * 1000);
        }
    }


    private closeAfterTimeout(prefix: string, afterfix: string, text: RichText, closeAfter: number) {
        text.string = prefix + closeAfter.toString() + afterfix;
        clearInterval(this.timeoutIntervalId);
        clearTimeout(this.timeoutCloseId);
        this.timeoutIntervalId = setInterval(() => {
            if (!this.node?.isValid || !text?.isValid) return;
            closeAfter--;
            text.string = prefix + closeAfter.toString() + afterfix;
        }, 1000);
        this.timeoutCloseId = setTimeout(() => {
            this.closePopup();
        }, closeAfter * 1000);
    }

    closePopup() {
        clearInterval(this.timeoutIntervalId);
        PopupManager.getInstance().closePopup(this.node?.uuid);
    }

    onButtonClick() {
        this.closePopup();
    }
}

export interface SelectionTimeOutParam {
    title: string;
    textButtonLeft: string;
    textButtonRight: string;
    textButtonCenter: string;
    content: string;
    timeout?: {
        seconds: number;
        targetButton: TargetButton;
    }
    onActionButtonLeft?: () => void;
    onActionButtonRight?: () => void;
    onActionButtonCenter?: () => void;
    onActionClose?: () => void;
}


