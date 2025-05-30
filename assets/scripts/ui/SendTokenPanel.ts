import { _decorator, Button, CCInteger, Component, EditBox, Node, RichText, Toggle } from 'cc';
import CustomButton from './CustomButton';
import { UIIdentify } from './UIIdentify';
const { ccclass, property } = _decorator;

export enum SendActionType {
    None = "NONE",
    Buy = "BUY",
    Withdraw = "WITHDRAW",
    Gift = "GIFT",
    ChangeDiamondToCoin = "CHANGEDIAMONDTOCOIN"
}
@ccclass('SendTokenPanel')
export class SendTokenPanel extends Component {
    @property({ type: RichText }) title: RichText = null;
    @property({ type: RichText }) sendButtonTitle: RichText = null;
    @property({ type: EditBox }) sendEditBox: EditBox = null;
    @property({ type: [CustomButton] }) presetButton: CustomButton[] = [];
    @property({ type: UIIdentify }) noticePopup: UIIdentify = null;
    @property({ type: Node }) sendButton: Node = null;
    @property({ type: Node }) withdrawButton: Node = null;
    @property({ type: Node }) changeButton: Node = null;
    @property({ type: Node }) send2Button: Node = null;
    @property({ type: CCInteger }) maxLength: number = 10;
    @property({ type: Toggle }) noticeToggle: Toggle = null;

    private sendValue: number = 0;
    private cb = null;
    private isBuy: boolean = false;
    private isWithdraw: boolean = false;
    private isExchange: boolean = false;
    private lastType: SendActionType = null;

    private cbBuy: (amount: number) => void = null;
    private cbChange: (amount: number) => void = null;
    private cbWithdraw: (amount: number) => void = null;

    protected start(): void {
        localStorage.removeItem("dont_show_buy_notice");
        this.presetButton.forEach(button => {
            button.node.on(Node.EventType.TOUCH_START, () => {
                this.onPresetButtonClick(button.localData);
            }, this);
        });

        this.sendButton.on(Node.EventType.TOUCH_START, () => {
            this.send(true, SendActionType.Buy);
        }, this);

        this.withdrawButton.on(Node.EventType.TOUCH_START, () => {
            this.send(true, SendActionType.Withdraw);
        }, this);

        this.changeButton.on(Node.EventType.TOUCH_START, () => {
            this.send(true, SendActionType.ChangeDiamondToCoin);
        }, this);

        this.send2Button.on(Node.EventType.TOUCH_START, () => {
            this.send(false, this.lastType);
        }, this);

    }

    public setSendCallback(callback: (amount: number) => void) {
        this.isBuy = false;
        this.isWithdraw = false;
        this.isExchange = false;
        this.withdrawButton.active = false;
        this.changeButton.active = false;
        this.title.string = "Tặng Quà";
        this.sendButtonTitle.string = "Gửi";
        this.cbBuy = callback;
        this.noticePopup.node.active = false;
    }

    public setBuyCallback(callback: (amount: number) => void) {
        this.isBuy = true;
        this.isWithdraw = false;
        this.isExchange = false;
        this.title.string = "Nạp/Rút/Đổi Diamond";
        this.sendButtonTitle.string = "Nạp";
        this.withdrawButton.active = true;
        this.changeButton.active = true;
        this.cbBuy = callback;
        this.noticePopup.node.active = false;
    }

    public setWithdrawCallback(callback: (amount: number) => void) {
        this.isBuy = false;
        this.isWithdraw = true;
        this.isExchange = false;
        this.title.string = "Nạp/Rút/Đổi Diamond";
        this.sendButtonTitle.string = "Nạp";
        this.cbWithdraw = callback;
        this.noticePopup.node.active = false;
    }

    public setChangeDiamondToCoinCallback(callback: (amount: number) => void) {
        this.isBuy = false;
        this.isWithdraw = false;
        this.title.string = "Nạp/Rút/Đổi Diamond";
        this.sendButtonTitle.string = "Nạp";
        this.cbChange = callback;
        this.noticePopup.node.active = false;
    }

    protected onDisable(): void {
        this.cbBuy = null;
        this.cbWithdraw = null;
        this.cbChange = null;
        this.sendValue = 0;
        if (this.sendEditBox) {
            this.sendEditBox.string = "0";
        }
    }

    private onPresetButtonClick(value) {
        if (value) {
            try {
                let parseValue = parseInt(value);
                this.sendValue = parseValue;
                this.sendEditBox.string = parseValue.toLocaleString();
            }
            catch (e) {
                this.sendEditBox.string = "0";
                console.error(e);
            }
        }
    }

    public onInputBeginChanged() {
        this.sendEditBox.maxLength = this.maxLength;
    }

    public onInputChanged() {
        this.sendEditBox.maxLength = this.maxLength + 3;
        try {
            let parseValue = parseInt(this.sendEditBox.string);
            this.sendValue = parseValue;
            this.sendEditBox.string = parseValue.toLocaleString();
        }
        catch (e) {
            this.sendEditBox.string = "0";
            console.error(e);
        }
    }

    private send(openpopup: boolean, type: SendActionType = null) {
        if (!type && this.lastType) {
            type = this.lastType;
        }

        if (openpopup && (this.isBuy || this.isWithdraw) && localStorage.getItem("dont_show_buy_notice") != "true") {
            this.lastType = type;
            this.noticePopup.show();
            return;
        } else if (this.isBuy || this.isWithdraw) {
            localStorage.setItem("dont_show_buy_notice", this.noticeToggle.isChecked ? "true" : "false");
        }

        if (isNaN(this.sendValue) || this.sendValue <= 0) {
            this.sendValue = 0;
        }

        switch (type) {
            case SendActionType.Buy:
                this.cbBuy?.(this.sendValue);
                break;
            case SendActionType.Withdraw:
                this.cbWithdraw?.(this.sendValue);
                break;
            case SendActionType.Gift:
                this.cbBuy?.(this.sendValue);
                break;
            case SendActionType.ChangeDiamondToCoin:
                this.cbChange?.(this.sendValue);
                break;
            default:
                break;
        }
        this.sendValue = 0;
        this.getComponent(UIIdentify).hide();
    }
}