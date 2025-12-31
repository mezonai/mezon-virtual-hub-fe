import { _decorator, Button, CCInteger, Component, EditBox, Node, RichText, Toggle } from 'cc';
import CustomButton from './CustomButton';
import { UIIdentify } from './UIIdentify';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupManager } from '../PopUp/PopupManager';
import { Constants } from '../utilities/Constants';
import { AudioType, SoundManager } from '../core/SoundManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { Sprite } from 'cc';
import { ImageAsset } from 'cc';
import { Texture2D } from 'cc';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

export enum SendActionType {
    None = "NONE",
    Buy = "BUY",
    Withdraw = "WITHDRAW",
    Gift = "GIFT",
    ChangeDiamondToCoin = "CHANGEDIAMONDTOCOIN"
}
@ccclass('SendTokenPanel')
export class SendTokenPanel extends BasePopup {
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

    @property({ type: Button }) closeUIBtn: Button = null;
    @property({ type: Sprite }) qrSprite: Sprite = null;
    

    private sendValue: number = 0;
    private cb = null;
    private isBuy: boolean = false;
    private isWithdraw: boolean = false;
    private isExchange: boolean = false;
    private lastType: SendActionType = null;

    private cbBuy: (amount: number) => void = null;
    private cbChange: (amount: number) => void = null;
    private cbWithdraw: (amount: number) => void = null;

    public init(param: SendTokenParam): void {
        this.HandleEventButton();
        this.HandleCallback(param);
    }

    private HandleEventButton() {
        this.presetButton.forEach(button => {
            button.node.on(Node.EventType.TOUCH_START, () => {
                this.onPresetButtonClick(button.localData);
            }, this);
        });

        this.sendButton.on(Node.EventType.TOUCH_START, () => {
            SoundManager.instance.playSound(AudioType.Button);
            this.send(true, SendActionType.Buy);
        }, this);

        this.withdrawButton.on(Node.EventType.TOUCH_START, () => {
            SoundManager.instance.playSound(AudioType.Button);
            this.send(true, SendActionType.Withdraw);
        }, this);

        this.changeButton.on(Node.EventType.TOUCH_START, () => {
            SoundManager.instance.playSound(AudioType.Button);
            this.send(true, SendActionType.ChangeDiamondToCoin);
        }, this);

        this.send2Button.on(Node.EventType.TOUCH_START, () => {
            SoundManager.instance.playSound(AudioType.Button);
            this.send(false, this.lastType);
        }, this);

        this.closeUIBtn.node.on("click", this.closeUIBtnClick, this);
        WebRequestManager.instance.getQRMezon((respone) => { this.onGetAllItem(respone) }, (error) => { this.onApiError(error); });
    }

    private onGetAllItem(respone) {
        this.showImageFromBase64(this.qrSprite, respone.data.qr_base64);
    }
    showImageFromBase64(sprite: Sprite, base64: string) {
        if (!sprite || !base64) return;

        const img = new Image();
        img.src = base64;

        img.onload = () => {
            const imageAsset = new ImageAsset(img);

            const texture = new Texture2D();
            texture.image = imageAsset;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;

            sprite.spriteFrame = spriteFrame;
        };

        img.onerror = (err) => {
            console.error('[Base64Image] Load failed', err);
        };
    }
    private onApiError(error) {
        Constants.showConfirm(error.error_message, "Waning");
    }

    private HandleCallback(param: SendTokenParam) {
        const value = localStorage.getItem(Constants.NOTICE_TRANSFER_DIAMOND);
        this.noticeToggle.isChecked = (value != null && value == "true");
        if (param) {
            const handlerMap = {
                onActionClose: (cb: any) => this._onActionClose = cb,
                onActionSendDiamond: (cb: any) => this.setSendDimondCallback(cb),
                onActionBuyDiamond: (cb: any) => this.setBuyDimondCallback(cb),
                onActionWithdrawDiamond: (cb: any) => this.setWithdrawDimondCallback(cb),
                onActionChangeDiamondToCoin: (cb: any) => this.setChangeDiamondToCoinCallback(cb),
            };

            for (const key in handlerMap) {
                const cb = (param as any)[key];
                if (cb) handlerMap[key](cb);
            }
        }
    }

    public closeUIBtnClick() {
        SoundManager.instance.playSound(AudioType.Button);
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }

    public setSendDimondCallback(callback: (amount: number) => void) {
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

    public setBuyDimondCallback(callback: (amount: number) => void) {
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

    public setWithdrawDimondCallback(callback: (amount: number) => void) {
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
        this.isExchange = true;
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

        if (openpopup && (this.isBuy || this.isWithdraw || this.isExchange) && localStorage.getItem(Constants.NOTICE_TRANSFER_DIAMOND) != "true") {
            this.lastType = type;
            this.noticePopup.show();
            return;
        } else if (this.isBuy || this.isWithdraw || this.isExchange) {
            localStorage.setItem(Constants.NOTICE_TRANSFER_DIAMOND, this.noticeToggle.isChecked ? "true" : "false");
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
        this.closeUIBtnClick();
    }
}

export interface SendTokenParam {
    onActionClose?: () => void;
    onActionSendDiamond?: (value: number) => void;
    onActionBuyDiamond?: (value: number) => void;
    onActionWithdrawDiamond?: (value: number) => void;
    onActionChangeDiamondToCoin?: (value: number) => void;
}