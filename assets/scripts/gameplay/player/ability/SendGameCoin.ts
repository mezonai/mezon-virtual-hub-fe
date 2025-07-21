import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { PlayerInteractAction } from './PlayerInteractAction';
import { UserMeManager } from '../../../core/UserMeManager';
import { UIManager } from '../../../core/UIManager';
import { UIID } from '../../../ui/enum/UIID';
import { SendTokenPanel, SendTokenParam } from '../../../ui/SendTokenPanel';
import { UserManager } from '../../../core/UserManager';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../../../PopUp/PopupSelectionMini';
const { ccclass, property } = _decorator;

@ccclass('SendGameCoin')
export class SendGameCoin extends PlayerInteractAction {
    private isOpenPopUp: boolean = false;
    private readonly notEnoughGoldResponse = [
        "Bạn nghĩ mình có nhiều tiền thế ư?",
        "Bạn điền nhiều tiền quá rồi",
        "Có tâm nhưng không có tiền"
    ];

    private readonly invalidGoldResponse = [
        "0đ, thiệc luôn???",
        "Số tiền phải lớn hơn 0",
        "Có tâm nhưng không có tiền"
    ];

    protected override invite() {
        if (this.isOpenPopUp) return;
        this.isOpenPopUp = true;
        if (UserMeManager.Get) {
            if (UserMeManager.playerDiamond <= 0) {
                UserManager.instance.GetMyClientPlayer.zoomBubbleChat("Tính năng chỉ dành cho người có tiền");
                this.controller.toggleShowUI(false);
                return;
            }
        }

        super.invite();
        const param: SendTokenParam = {
            onActionClose: () => {
                this.isOpenPopUp = false;
            },
            onActionSendDiamond: (data) => { this.startAction(data); }
        }
        PopupManager.getInstance().openAnimPopup("UITransferDiamondPopup", SendTokenPanel, param);
    }

    public onBeingInvited(data) {
        const { fromName, amount, currentDiamond } = data;
        SoundManager.instance.playSound(AudioType.Notice);
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: `Nhận <color=#FF0000> ${amount} Diamond</color> từ ${fromName}`,
            textButtonLeft: "",
            textButtonRight: "",
            textButtonCenter: "OK",
            onActionButtonCenter: () => {
                UserMeManager.playerDiamond = currentDiamond;
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }

    protected startAction(data) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
        if (data > UserMeManager.playerDiamond) {
            let chatContent = this.notEnoughGoldResponse[randomRangeInt(0, this.notEnoughGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }

        let sendData = {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString(),
            amount: data
        }
        this.room.send("p2pAction", sendData);
    }

    public onStartAction(data) {
        super.onStartAction(data);

    }

    public rejectAction(data) {
    }

    public onRejectAction(data) {
        super.onRejectAction(data);
    }

    public actionResult(data) {
        super.actionResult(data);
        const { toName, amount, currentDiamond } = data;
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: `Gửi <color=#FF0000> ${amount} Diamond</color> tới ${toName} thành công`,
            textButtonLeft: "",
            textButtonRight: "",
            textButtonCenter: "OK",
            onActionButtonCenter: () => {
                UserMeManager.playerDiamond = currentDiamond;
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }

    public stop() {
        super.stop();
    }
}