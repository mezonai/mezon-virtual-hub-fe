import { _decorator, Button, RichText } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { AudioType, SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('ConfirmPopup')
export class ConfirmPopup extends BasePopup {
    @property(RichText)
    titleLabel: RichText = null!;

    @property(RichText)
    messageLabel: RichText = null!;
    @property(Button)
    closeButton: Button = null;

    public init(param?: ConfirmParam) {
        SoundManager.instance.playSound(AudioType.Notice);
        if(param == null){
            this.onButtonClick();
            return;
        }
        this.titleLabel.string = param.title == "" ? "Thông Báo" : param.title;
        if (this.messageLabel && param?.message != "") {
            this.messageLabel.string = param?.message;
        }
        this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
    }

    async onButtonClick() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }
}

export interface ConfirmParam {
    message: string;
    title: string;
}
