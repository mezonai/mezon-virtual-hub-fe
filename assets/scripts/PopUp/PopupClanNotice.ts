import { _decorator, Component, Button, EditBox, Label, Color } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('PopupClanNotice')
export class PopupClanNotice extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Button) okButton: Button = null!;
    @property(EditBox) editBox: EditBox = null!;
    @property(Label) counterLabel: Label = null!;

    private sendWallNotice: (message: string) => Promise<void> | void;
    private readonly MAX_LENGTH = 1000;

    public init(param?: PopupClanNoticeParam): void {
        this.closeButton.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
        
        if (!param) return;
        this.sendWallNotice = param.send;
        if (param.defaultText) this.editBox.string = param.defaultText;

        this.editBox.node.on('text-changed', this.onTextChanged, this);
        this.updateCounter();
        
        this.okButton.addAsyncListener(async () => {
            const message = this.editBox.string.trim();
            await this.sendWallNotice(message);
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }

    private onTextChanged(editBox: EditBox) {
        const text = editBox.string;

        if (text.length > this.MAX_LENGTH) {
            editBox.string = text.slice(0, this.MAX_LENGTH);
            Constants.showConfirm("Nội dung thông báo không được vượt quá 1000 ký tự!");
        } else {
            this.updateCounter();
        }
    }

    private updateCounter() {
        const count = this.editBox.string.length;
        this.counterLabel.string = `${count}/${this.MAX_LENGTH}`;
        if (count >= this.MAX_LENGTH * 0.9) {
            this.counterLabel.color = new Color(255, 100, 100);
        } else {
            this.counterLabel.color = new Color(200, 200, 200);
        }
    }
}

export interface PopupClanNoticeParam {
    send: (message: string) => Promise<void> | void;
    defaultText?: string; 
}
