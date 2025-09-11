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
import { ConfirmParam, ConfirmPopup } from '../../../PopUp/ConfirmPopup';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupSelectionTimeOut, SelectionTimeOutParam, TargetButton } from '../../../PopUp/PopupSelectionTimeOut';
import { ServerManager } from '../../../core/ServerManager';
const { ccclass, property } = _decorator;

@ccclass('CatchUser')
export class CatchUser extends PlayerInteractAction {
    private readonly sadTalk = "Hu hu buồn quá. Bị tìm thấy rồi";
    private readonly sadTalkFailFindPlayer = "Hơi Buồn nhỉ. Bạn không phải đối tượng mình cần tìm";
    private readonly successTalk = "Yeah! Thành công rồi";

    private get IsMissionRunning() {
        if (MissionEventManager.Get == null || (MissionEventManager.Get != null && MissionEventManager.isFinishedMission())) {
            return false;
        }

        return true;
    }

    async showPopupTargetUser() {
        const param: ConfirmParam = {
            message: "Bạn đang là đối tượng mọi người đang tìm kiếm, không thể bắt người khác",
            title: "Chú Ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    protected override invite() {
        if (this.IsMissionRunning && MissionEventManager.meIsTargetUser()) {
            this.showPopupTargetUser();
        }
        else {
            const param: SelectionTimeOutParam = {
                title: "Thông báo",
                content: this.IsMissionRunning ? `Bạn có muốn bắt người chơi này không?` : `Bạn có muốn khều người chơi này không?`,
                textButtonLeft: "Có",
                textButtonRight: "Không",
                textButtonCenter: "",
                timeout: {
                    seconds: this.inviteTimeout,
                    targetButton: TargetButton.LEFT,
                },
                onActionButtonLeft: () => {
                    let data = {
                        targetClientId: this.playerController.myID,
                        action: this.actionType.toString()
                    }
                    this.room.send("p2pAction", data);
                },
            };
            PopupManager.getInstance().openAnimPopup("PopupSelectionTimeOut", PopupSelectionTimeOut, param);
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

    public handleMissionAction(sender, receiver, isSenderAction: boolean) {
        const mission = MissionEventManager.Get;
        if (!sender || !receiver) return;

        // Cho hiển thị tên tạm
        if (isSenderAction) {
            receiver.showNameTemporarily(10);
        } else {
            sender.showNameTemporarily(10);
        }

        // Nếu không có mission
        if (!mission) {
            this.setAnimNoMission(sender, receiver);
            return;
        }

        const targetId = mission.target_user.id;
        const senderId = sender.userId;
        const receiverId = receiver.userId;

        // Trường hợp 1: sender là mục tiêu bị truy bắt
        if (senderId === targetId) {
            if (MissionEventManager.isFinishedMission()) {// Nhiệm vụ đã kết thúc
                this.setAnimFinishedMission(receiver, sender);
            }
            else {
                this.showPopupTargetUser();
            }
            return;
        }

        // Trường hợp 2: receiver là mục tiêu bị truy bắt
        if (receiverId === targetId) {
            if (MissionEventManager.isFinishedMission()) {// Nhiệm vụ đã kết thúc
                this.setAnimFinishedMission(sender, receiver);
                return;
            }
            if (MissionEventManager.IsUserCompletedMission(senderId)) {//User là người đã hoàn thành nhiệm vụ rồi
                this.setAmimFindUserSuccess(sender, receiver);
                return;
            }
            this.setAnimFindUserTargetCompleted(sender, receiver);
            if (isSenderAction) ServerManager.instance.sendCatchTargetUser(mission.id)
            return;
        }

        // Trường hợp 3: Bắt nhầm người
        this.setAnimFindUserTargetFailed(sender, receiver);
    }

    public senderAction(data) {
        const players = UserManager.instance.Players();
        const sender = players.get(data.from);
        const receiver = players.get(data.to);
        this.handleMissionAction(sender, receiver, true);
    }

    public receiverAction(data) {
        const players = UserManager.instance.Players();
        const sender = players.get(data.from);
        const receiver = players.get(data.to);
        this.handleMissionAction(sender, receiver, false);
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

    setAnimFinishedMission(sender: PlayerController, receiver: PlayerController) {
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
}


