import { _decorator, randomRangeInt } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import {SendTokenPanel, SendTokenParam } from '../../ui/SendTokenPanel';
import { ServerManager } from '../../core/ServerManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { UserManager } from '../../core/UserManager';
import { PopupManager } from '../../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('InteractATM')
export class InteractATM extends MapItemController {
    private readonly invalidGoldResponse = [
        "0đ, thiệc luôn???",
        "Số tiền phải lớn hơn 0",
        "Có tâm nhưng không có tiền"
    ];

    protected override async interact(playerSessionId: string) {
        if(this.isOpenPopUp) return;
        this.isOpenPopUp = true;
        
        const param: SendTokenParam = {
            onActionClose:()=>{
                this.isOpenPopUp = false;
            },    
            //onActionBuyDiamond: (data) => { this.onBuyClick(data); },
            onActionWithdrawDiamond: (data) => { this.onWithdrawClick(data); },
            onActionChangeDiamondToCoin: (data) => { this.onChangeDiamondToCoinClick(data); }
        };
        PopupManager.getInstance().openAnimPopup("UITransferDiamondPopup", SendTokenPanel, param);
        this.handleEndContact(null, null, null);
    }

    private onBuyClick(data) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
        
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME.ON_BUY_TOKEN, data);
        }
    }

    private onWithdrawClick(data: number) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
    
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME.ON_WITHDRAW_TOKEN, data);
        }
    }

      private onChangeDiamondToCoinClick(data: number) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
    
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME.ON_CHANGE_DIAMOND_TO_COIN, data);
        }
    }
   

    protected override canShowPopup(): boolean {
        return true;
    }
}