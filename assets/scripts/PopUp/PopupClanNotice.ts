import { _decorator, Component, Button, EditBox } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanNotice')
export class PopupClanNotice extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Button) okButton: Button = null!;
    @property(EditBox) editBox: EditBox = null!;

    private sendWallNotice: (message: string) => Promise<void> | void;
    
    public init(param?: PopupClanNoticeParam): void {
        this.closeButton.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });

        if (!param?.send) {
            return;
        }

        this.sendWallNotice = param.send;
        if (param.defaultText) {
            this.editBox.string = param.defaultText;
        }

        this.okButton.addAsyncListener(async () => {
            const message = this.editBox.string.trim();
            await this.sendWallNotice(message);
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }
}

export interface PopupClanNoticeParam {
    send: (message: string) => Promise<void> | void;
    defaultText?: string; 
}

