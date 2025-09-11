import { _decorator, Button, Component, director, instantiate, Node, Prefab, RichText, ScrollView, tween, Vec3 } from 'cc';
import { WebRequestManager } from '../../network/WebRequestManager';
import { MissionEventManager } from '../../core/MissionEventManager';
import { MissionEvent, User } from '../../Interface/DataMapAPI';
import { SlidingPopup } from '../../PopUp/SlidingPopup';
import { PopupManager } from '../../PopUp/PopupManager';
import { UIManager } from '../../core/UIManager';
import { UserManager } from '../../core/UserManager';
import { UserMeManager } from '../../core/UserMeManager';
import { MissionDetailPopup } from '../../PopUp/MissionDetailPopup';
import { AudioType, SoundManager } from '../../core/SoundManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMission')
export class UIMission extends Component {
    @property({ type: Node }) dimNode: Node = null;
    @property({ type: Label }) title: Label = null;
    @property({ type: RichText }) content: RichText = null;
    @property({ type: Button }) buttonShowDetailMission: Button = null;
    private messageQueue: string[] = [];
    private timeShow: number = 0.5;
    private popupSliding: SlidingPopup = null;
    protected onLoad(): void {
        this.buttonShowDetailMission.node.on(Button.EventType.CLICK, this.onClickShowDetailMission, this);
        this.node.active = false;
    }

    showMission(missionEvent: MissionEvent, isTargetUser: boolean) {
        this.title.string = `🎯 Nhiệm vụ: ${missionEvent.name}`;

        if (isTargetUser) {
            this.content.string =
                `<b>Đã bị phát hiện: <u>${missionEvent.completed_users.length}/${missionEvent.max_completed_users}</u> lần</b>`;
            return;
        }

        const targetName = missionEvent.target_user.display_name;
        const isCompleted = MissionEventManager.IsUserMeCompeletedMission();

        this.content.string = isCompleted
            ? `<b>Mục tiêu: Truy tìm <u>${targetName}</u> (Hoàn Thành)</b>`
            : `<b>Mục tiêu: Truy tìm <u>${targetName}</u></b>`;
    }

    onClickShowDetailMission() {
        if (!MissionEventManager.Get) return;
        let contentPopup = MissionEventManager.meIsTargetUser() ?
            `Bạn là mục tiêu truy tìm của mọi người. Hãy tránh xa mọi người. Nếu đứng gần người khác, Họ có thể sẽ bắt được bạn. Nếu ${MissionEventManager.Get.max_completed_users} người tìm thấy bạn, nhiệm vụ thất bại`
            : `${MissionEventManager.Get.target_user.display_name} có thể ở bất cứ văn phòng nào, hãy truy tìm mục tiêu. Click vào người chơi khác và chọn icon "Nấm đấm" để thử bắt mục tiêu`;
        PopupManager.getInstance().openPopup('MissionDetailPopup', MissionDetailPopup, { message: contentPopup });
    }
    public closeMissionEvent() {
        if (MissionEventManager.Get != null && !MissionEventManager.isFinishedMission() && !MissionEventManager.meIsTargetUser())
            this.showNotiMission("Mục tiêu đuổi bắt đã rời đi.");

        this.node.active = false;
    }

    private hasJoinEvent: boolean = false;
    async getMissionEventData() {
        let mission = await WebRequestManager.instance.getMissionEventAync();
        if (mission == null) {
            this.node.active = false;
            return;
        }
        let isTargetUser = MissionEventManager.meIsTargetUser();
        if (MissionEventManager.isFinishedMission()) {
            MissionEventManager.stopMissionTimer();
            this.node.active = false;
            if (MissionEventManager.isShowCompletedPopup || !this.hasJoinEvent) return;
            MissionEventManager.isShowCompletedPopup = true;
            const param: ConfirmParam = {
                message: isTargetUser ? "Nhiệm vụ đã thất bại cám ơn bạn đã tham gia" : "Nhiệm vụ đã hoàn thành cám ơn bạn đã tham gia",
                title: "Thông báo",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            return;
        }
        MissionEventManager.startMissionTimer(() => {
            const param: ConfirmParam = {
                message: isTargetUser ? "Nhiệm vụ hoàn thành. Chúc mừng bạn trốn thành công"
                    : `Nhiệm vụ thất bại . Còn ${mission.max_completed_users - mission.completed_users.length} người chưa thể tìm thấy ${mission.target_user.display_name}`,
                title: "Thông báo",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            this.getMissionEventData();
        });
        this.hasJoinEvent = true;
        if (isTargetUser) {
            if (!MissionEventManager.isShowUserTargetJoin) {
                const param: ConfirmParam = {
                    message: "Bạn là mục tiêu mọi người tìm kiếm, chạy thật nhanh và đừng để người khác chạm vào",
                    title: "Chú Ý",
                };
                PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
                MissionEventManager.isShowUserTargetJoin = true;
            }
        }

        if (this.hasJoinEvent) {
            isTargetUser = MissionEventManager.meIsTargetUser();
            this.node.active = true;
            this.showMission(mission, isTargetUser);
        }
    }

    public showNotiTargetJoined() {
        this.getMissionEventData();
        if (MissionEventManager.meIsTargetUser() || MissionEventManager.isFinishedMission()) return;
        this.showNotiMission("Mục tiêu tìm kiếm đã vào. Hãy cùng đi săn nào")
    }

    public async showNotiMission(contentChat: string) {
        this.addMessageToQueue(contentChat);
        if (this.popupSliding == null) {
            await this.processQueue();
        }
    }

    public addMessageToQueue(message: string) {
        this.messageQueue.push(message);
    }

    private async processQueue() {
        if (this.messageQueue.length === 0) {
            this.popupSliding = null;
            return;
        }
        const messageChat = this.messageQueue.shift();
        this.popupSliding = await PopupManager.getInstance().openPopup('SlidingPopup', SlidingPopup, { message: messageChat });
        await this.waitUntilPopupClosed('SlidingPopup');
        if (!this.isValid) return;
        this.processQueue();
    }

    private async waitUntilPopupClosed(popupName: string) {
        return new Promise<void>((resolve) => {
            const check = () => {
                const popup = PopupManager.getInstance().getPopup(popupName);
                if (!popup || !popup.isValid) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
}


