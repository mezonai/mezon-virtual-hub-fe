import { _decorator, Button, Component, Label, Node, RichText } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
const { ccclass, property } = _decorator;

@ccclass('ConfirmPopup')
export class ConfirmPopup extends BasePopup {
    @property(RichText)
    titleLabel: RichText = null!;

    @property(RichText)
    messageLabel: RichText = null!;
    @property(Button)
    closeButton: Button = null;

    public init(param?: { message: string, title?: string;}) {
        if (this.titleLabel && param?.title != null) {
            this.titleLabel.string = param.title;
        }
        if (this.messageLabel && param?.message) {
            this.messageLabel.string = param?.message;
        }
        this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
    }

    async onButtonClick() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }
}


