import { _decorator, RichText } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
const { ccclass, property } = _decorator;

@ccclass('PopupMessageTimeout')
export class PopupMessageTimeout extends BasePopup {
    @property({ type: RichText }) public messageLabel: RichText;
    @property({ type: RichText }) public countDownText: RichText;

    private timeoutIntervalId: number = 0;
    private timeoutCloseId: number = 0;

    public init(param?: MessageTimeoutParam) {
        if (param == null) {
            this.ClosePopup();
            return;
        }
        if (this.messageLabel && param?.message != "") {
            this.messageLabel.string = param?.message;
        }
        this.closeAfterTimeout("", "s", this.countDownText, param?.closeAfter);
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
           this.ClosePopup();
        }, closeAfter * 1000);
    }

    public ClosePopup() {
        clearInterval(this.timeoutIntervalId);
        PopupManager.getInstance().closePopup(this.node?.uuid);
    }
}

export interface MessageTimeoutParam {
    message: string;
    closeAfter: number;
}