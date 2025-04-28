import { _decorator, Component, Node } from 'cc';
import { PlayerInteractAction } from './PlayerInteractAction';
import { UIManager } from '../../../core/UIManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { MissionEventManager } from '../../../core/MissionEventManager';
import { WebRequestManager } from '../../../network/WebRequestManager';
import { GameManager } from '../../../core/GameManager';
import { UserManager } from '../../../core/UserManager';
import { PlayerController } from '../PlayerController';
import { AudioType, SoundManager } from '../../../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('CatchUser')
export class CatchUser extends PlayerInteractAction {
    private readonly sadTalk = "Hu hu buồn quá. Bị tìm thấy rồi";
    private readonly sadTalkFailFindPlayer = "Hơi Buồn nhỉ. Bạn không phải đối tượng mình cần tìm";
    private readonly successTalk = "Yeah! Thành công rồi";

    private get IsMissionRunning() {
        if (MissionEventManager.Get == null || (MissionEventManager.Get != null && MissionEventManager.CompletedMision())) {
            return false;
        }

        return true;
    }

    protected override invite() {
        if (this.IsMissionRunning && MissionEventManager.meIsTargetUser()) {
            UIManager.Instance.showNoticePopup("Chú Ý", "Bạn đang là đối tượng mọi người đang tìm kiếm, không thể bắt người khác");
        }
        else {
            UIManager.Instance.showYesNoPopup(null, this.IsMissionRunning ? `Bạn có muốn bắt người chơi này không?` : `Bạn có muốn khều người chơi này không?`,
                () => {
                    this.catchUser();
                },
                () => {

                },
                "Có", "Không", this.inviteTimeout)
        }

        super.invite();

    }

    public onBeingInvited(data) {
        SoundManager.instance.playSound(AudioType.Notice);
        this.receiverAction(data);
    }

    protected startAction(data) {

    }

    public onStartAction(data) {


    }

    public override rejectAction(data) {

    }

    public override onRejectAction(data) {

    }

    public actionResult(data) {
        super.actionResult(data);
        this.senderAction(data);

    }

    public stop() {
        super.stop();
    }

    catchUser() {
        this.sendData();
    }


    sendData() {
        let data = {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString()
        }
        this.room.send("p2pAction", data);
    }

    sendDataCacthUser() {
        this.room.send("catchTargetUser", {});
    }

    public senderAction(data) {
        let players = UserManager.instance.Players();
        const sender = players.get(data.from);
        const receiver = players.get(data.to);
        const mission = MissionEventManager.Get;
        if (!sender || !receiver) return;
        if (mission) {
            receiver.showNameTemporarily(10);
            if (sender.UserId == mission.target_user.id) {
                if (MissionEventManager.CompletedMision()) {
                    this.setAnimCompletedMission(receiver, sender);
                    return;
                }
                this.setAnimNoMission(sender, receiver);
                return;
            }
            if (receiver.userId === mission.target_user.id) {
                if (MissionEventManager.CompletedMision()) {
                    this.setAnimCompletedMission(sender, receiver);
                    return;
                }
                if (MissionEventManager.IsUserCompletedMission(sender.userId)) {
                    this.setAmimFindUserSuccess(sender, receiver);
                    return;
                }
                this.setAnimFindUserTargetCompleted(sender, receiver);
                this.updateUserCompletedData();
                return;
            }
            this.setAnimFindUserTargetFailed(sender, receiver);
            return;
        }
        this.setAnimNoMission(sender, receiver);
    }

    public receiverAction(data) {
        let players = UserManager.instance.Players();
        const sender = players.get(data.from);
        const receiver = players.get(data.to);
        const mission = MissionEventManager.Get;
        if (!sender || !receiver) return;
        if (mission) {
            sender.showNameTemporarily(10);
            if (sender.userId === mission.target_user.id) {
                if (MissionEventManager.CompletedMision()) {
                    this.setAnimCompletedMission(receiver, sender);
                    return;
                }
                this.setAnimNoMission(sender, receiver);
                return
            }
            if (receiver.userId === mission.target_user.id) {
                if (MissionEventManager.CompletedMision()) {
                    this.setAnimCompletedMission(sender, receiver);
                    return;
                }
                if (MissionEventManager.IsUserCompletedMission(sender.userId)) {
                    this.setAmimFindUserSuccess(sender, receiver);
                    return;
                }
                this.setAnimFindUserTargetCompleted(sender, receiver);
                return;
            }
            this.setAnimFindUserTargetFailed(sender, receiver);
            return;
        }
        this.setAnimNoMission(sender, receiver);
    }

    setAnimNoMission(sender, receiver) {
        //receiver.happyAction();
        // sender.happyAction();
        sender.zoomBubbleChat(this.talkFindPlayer(receiver.userName));
        receiver.zoomBubbleChat(this.talkFindPlayer(sender.userName));
    }

    setAmimFindUserSuccess(sender: PlayerController, receiver: PlayerController) {
        //receiver.happyAction();
        // sender.happyAction();
        receiver.zoomBubbleChat(this.talkFindPlayerRepeat(sender.userName));
        sender.zoomBubbleChat(`Ơ, Xin chào ${receiver.userName}. Lại tìm tìm thấy bạn nữa rồi`);
    }

    setAnimFindUserTargetCompleted(sender: PlayerController, receiver: PlayerController) {
        //receiver.sadAction();
        // sender.happyAction();
        receiver.zoomBubbleChat(this.sadTalk);
        sender.zoomBubbleChat(this.successTalk);
    }

    setAnimFindUserTargetFailed(sender: PlayerController, receiver: PlayerController) {
        //receiver.happyAction();
        // sender.sadAction();
        receiver.zoomBubbleChat(this.talkFindPlayer(sender.userName));
        sender.zoomBubbleChat(this.sadTalkFailFindPlayer);
    }

    setAnimCompletedMission(sender: PlayerController, receiver: PlayerController) {
        //receiver.happyAction();
        // sender.happyAction();
        receiver.zoomBubbleChat("Buồn quá thất bại nhiệm vụ rồi");
        sender.zoomBubbleChat("Vui quá, Nhiệm vụ hoàn thành rồi.");
    }

    talkFindPlayer(userName: string) {
        return `Xin chào ${userName}. Rất vui được làm quen`;
    }

    talkFindPlayerRepeat(userName: string) {
        return `Hi ${userName}. Bạn đã hoàn thành nhiệm vụ trước đó rồi Ha Ha`;
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
    private updateUserCompletedData() {
        WebRequestManager.instance.updateCompletedMission(
            MissionEventManager.Get.id,
            {},
            (response) => this.onGetMissionSuccess(response),
            (error) => this.onError(error)
        );
    }

    private onGetMissionSuccess(respone) {
        this.sendDataCacthUser();
    }
}


