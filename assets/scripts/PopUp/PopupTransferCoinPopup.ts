import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Button } from 'cc';
import { EditBox } from 'cc';
import CustomButton from '../ui/CustomButton';
import { CCInteger } from 'cc';
import { ClanFundPayload, ClansData } from '../Interface/DataMapAPI';
import { PurchaseMethod } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PopupTransferCoinPopup')
export class PopupTransferCoinPopup extends BasePopup {
    @property({ type: EditBox }) sendEditBox: EditBox = null;
    @property({ type: [CustomButton] }) presetButton: CustomButton[] = [];
    @property({ type: Node }) sendButton: Node = null;
    @property({ type: Button }) closeUIBtn: Button = null;
    @property({ type: CCInteger }) maxLength: number = 10;

    private clanDetail: ClansData;
    private sendValue: number = 0;
    private cbOfficeFund: (clanFundPayload: ClanFundPayload) => void = null;
 
    public init(param: SendClanFundParam): void {
        this.closeUIBtn.addAsyncListener(async () => {
            this.closeUIBtn.interactable = false;
            this.closeUI();
            this.closeUIBtn.interactable = true;
        });

        this.clanDetail = param.clanDetail;
        this.cbOfficeFund = param.onActionSendCoin;

        this.presetButton.forEach(button => {
            button.node.on(Node.EventType.TOUCH_START, () => {
                this.onPresetButtonClick(button.localData);
            }, this);
        });

        this.sendButton.on(Node.EventType.TOUCH_START, () => {
            this.send();
        }, this);
    }

    async closeUI(){
        await PopupManager.getInstance().closePopup(this.node.uuid);
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

    private send() {
        if (isNaN(this.sendValue) || this.sendValue <= 0) {
            this.sendValue = 0;
        }
        const dataType = PurchaseMethod.GOLD;
        let clanFundPayload: ClanFundPayload = {
            clanId: this.clanDetail.id,
            type: dataType,
            amount: this.sendValue
        }
        this.cbOfficeFund?.(clanFundPayload);
        this.sendValue = 0;
        this.closeUI();
    }
}

export interface SendClanFundParam {
    clanDetail: ClansData;
    onActionSendCoin?: (clanFundPayload: ClanFundPayload) => void;
}