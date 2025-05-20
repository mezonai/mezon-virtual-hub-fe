import { _decorator, Button, Component, Label, Node, RichText } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
const { ccclass, property } = _decorator;

@ccclass('ConfirmPopup')
export class ConfirmPopup extends BasePopup {
    @property(RichText)
    messageLabel: RichText = null!;
    @property(Button)
    closeButton: Button = null;

    public init(param?: { message: string }) {
        if (this.messageLabel && param?.message) {
            this.messageLabel.string = param?.message;
        }
    }

    protected onLoad(): void {
        this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
    }

    async onButtonClick() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }
}


