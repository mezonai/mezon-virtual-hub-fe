import { _decorator, Button, CCInteger, Component, EditBox, Node, RichText, Toggle } from 'cc';
import CustomButton from './CustomButton';
import { UIIdentify } from './UIIdentify';
const { ccclass, property } = _decorator;

@ccclass('SendTokenPanel')
export class SendTokenPanel extends Component {
    @property({ type: RichText }) title: RichText = null;
    @property({ type: RichText }) sendButtonTitle: RichText = null;
    @property({ type: EditBox }) sendEditBox: EditBox = null;
    @property({ type: [CustomButton] }) presetButton: CustomButton[] = [];
    @property({type: UIIdentify}) noticePopup: UIIdentify = null;
    @property({ type: Node }) sendButton: Node = null;
    @property({ type: Node }) send2Button: Node = null;
    @property({ type: CCInteger }) maxLength: number = 10;
    @property({type: Toggle}) noticeToggle: Toggle = null;

    private sendValue: number = 0;
    private cb = null;
    private isBuy: boolean = false;

    protected start(): void {
        this.presetButton.forEach(button => {
            button.node.on(Node.EventType.TOUCH_START, () => {
                this.onPresetButtonClick(button.localData);
            }, this);
        });

        this.sendButton.on(Node.EventType.TOUCH_START, () => {
            this.send(true);
        }, this);
        this.send2Button.on(Node.EventType.TOUCH_START, () => {
            this.send(false);
        }, this);
    }

    public setSendCallback(callback) {
        this.isBuy = false;
        this.title.string = "Tặng Quà";
        this.sendButtonTitle.string = "Gửi";
        this.cb = callback;
        this.noticePopup.node.active = false;
    }

    public setBuyCallback(callback) {
        this.isBuy = true;
        this.title.string = "Mua Coin";
        this.sendButtonTitle.string = "Mua";
        this.cb = callback;
        this.noticePopup.node.active = false;
    }

    protected onDisable(): void {
        this.cb = null;
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

    private send(openpopup) {
        if (openpopup && this.isBuy && localStorage.getItem("dont_show_buy_notice") != "true") {
            this.noticePopup.show();
            return;
        }
        else if (this.isBuy) {
            localStorage.setItem("dont_show_buy_notice", this.noticeToggle.isChecked ? "true" : "false");
        }

        if (isNaN(this.sendValue) || this.sendValue <= 0) {
            this.sendValue = 0;
        }

        if (this.cb) {
            this.cb(this.sendValue);
            this.cb = null;
        }
        this.sendValue = 0;
        this.getComponent(UIIdentify).hide();
    }
}