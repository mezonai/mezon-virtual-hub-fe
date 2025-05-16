import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { PlayerInteractAction } from './PlayerInteractAction';
import { UserMeManager } from '../../../core/UserMeManager';
import { UIManager } from '../../../core/UIManager';
import { UIID } from '../../../ui/enum/UIID';
import { SendTokenPanel } from '../../../ui/SendTokenPanel';
import { UserManager } from '../../../core/UserManager';
import { AudioType, SoundManager } from '../../../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('SendGameCoin')
export class SendGameCoin extends PlayerInteractAction {

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
        if (UserMeManager.Get) {
            if (UserMeManager.playerCoin <= 0) {
                UserManager.instance.GetMyClientPlayer.zoomBubbleChat("Tính năng chỉ dành cho người có tiền");
                this.controller.toggleShowUI(false);
                return;
            }
        }

        super.invite();

        let popop = UIManager.Instance.showUI(UIID.SendToken);
        popop.getComponent(SendTokenPanel).setSendCallback((data) => {
            this.startAction(data)
        });

    }

    public onBeingInvited(data) {
        const { fromName, amount, currentGold } = data;
        SoundManager.instance.playSound(AudioType.Notice);
        UIManager.Instance.showNoticePopup(null, `Nhận <color=#FF0000> ${amount} Dimond</color> từ ${fromName}`, () => {
            UserMeManager.playerCoin = currentGold;
        })
    }

    protected startAction(data) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
        if (data > UserMeManager.playerCoin) {
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
        const { toName, amount, currentGold: currentDiamond } = data;
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        UIManager.Instance.showNoticePopup(null, `Gửi <color=#FF0000> ${amount} Dimond</color> tới ${toName} thành công`, () => {
            UserMeManager.playerDiamond = currentDiamond;
        })
    }

    public stop() {
        super.stop();
    }
}