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
const { ccclass, property } = _decorator;

@ccclass('UIMission')
export class UIMission extends Component {
    @property({ type: ScrollView }) chatScrollView: ScrollView = null;
    @property({ type: Node }) dimNode: Node = null;
    @property({ type: Node }) objectShow: Node = null;
    @property({ type: Prefab }) itemMissionPrefab: Prefab = null;
    @property({ type: Button }) buttonShow: Button = null;
    @property({ type: Button }) buttonHide: Button = null;
    @property({ type: Button }) buttonShowDetailMission: Button = null;
    @property({ type: Vec3 }) positionShow: Vec3 = new Vec3(0, 0, 0);
    @property({ type: Vec3 }) positionHide: Vec3 = new Vec3(0, 0, 0);
    private messageQueue: string[] = [];
    private timeShow: number = 0.5;
    private popupSliding: SlidingPopup = null;
    protected onLoad(): void {
        this.buttonShow.node.on(Button.EventType.CLICK, this.onClickShowPanel, this);
        this.buttonHide.node.on(Button.EventType.CLICK, this.onClickHidePanel, this);
        this.buttonShowDetailMission.node.on(Button.EventType.CLICK, this.onClickShowDetailMission, this);
        this.hideMission();
    }

    showMission(missionEvent: MissionEvent, isTargetUser: boolean) {
        this.chatScrollView.content.removeAllChildren();
        let newMessage = instantiate(this.itemMissionPrefab);
        newMessage.setParent(this.chatScrollView.content);
        newMessage.setSiblingIndex(this.chatScrollView.content.children.length - 1);
        let richText = newMessage.getComponent(RichText);

        if (isTargetUser) {
            richText.string = `<b><color=#6B4C2F>🎯 Nhiệm vụ: ${missionEvent.name}</color></b>\n` +
                "<color=#000000> - Đã bị phát hiện: <b>" + missionEvent.completed_users.length + "/" + missionEvent.max_completed_users + " lần</color></b>\n" +
                "<color=#FF003D> - Còn lại: <b>" + (missionEvent.max_completed_users - missionEvent.completed_users.length) + " lần trước khi thất bại.</color></b> ";
        }
        else {
            if (MissionEventManager.IsUserMeCompeletedMission()) {
                richText.string = `<b><color=#6B4C2F>🎯 Nhiệm vụ: ${missionEvent.name}</color></b>\n` +
                    `<b><color=#000000> - Mục tiêu: Truy tìm ${missionEvent.target_user.display_name} (Hoàn Thành)</color></b>\n`;
            }
            else {
                richText.string = `<b><color=#6B4C2F>🎯 Nhiệm vụ: ${missionEvent.name}</color></b>\n` +
                    `<b><color=#000000> - Mục tiêu: Truy tìm ${missionEvent.target_user.display_name}</color></b>\n`;
            }
        }

    }

    hideMission() {
        this.objectShow.active = false;
    }

    async onClickShowPanel() {
        await this.ShowPanel(true);
    }

    async onClickHidePanel() {
        await this.ShowPanel(false);
    }

    onClickShowDetailMission() {
        if (!MissionEventManager.Get) return;
        let contentPopup = MissionEventManager.meIsTargetUser() ?
            `Bạn là mục tiêu truy tìm của mọi người. Hãy tránh xa mọi người. Nếu đứng gần người khác, Họ có thể sẽ bắt được bạn. Nếu ${MissionEventManager.Get.max_completed_users} người tìm thấy bạn, nhiệm vụ thất bại`
            : `${MissionEventManager.Get.target_user.display_name} có thể ở bất cứ văn phòng nào, hãy truy tìm mục tiêu. Click vào người chơi khác và chọn icon "Nấm đấm" để thử bắt mục tiêu`;
        PopupManager.getInstance().openPopup('MissionDetailPopup', MissionDetailPopup, { message: contentPopup });
    }

    async ShowPanel(isShow: boolean) {
        this.dimNode.active = true;
        await new Promise<void>((resolve) => {
            tween(this.objectShow)
                .to(this.timeShow, { position: new Vec3(isShow ? this.positionShow.x : this.positionHide.x, this.node.position.y, this.node.position.z) })
                .call(() => {
                    resolve();
                })
                .start();
        });
        this.dimNode.active = false;
        this.buttonShow.node.active = !isShow;
        this.buttonHide.node.active = isShow;
    }

    public getMissionEventData() {
        WebRequestManager.instance.getMissionEvent(
            (response) => this.showUIMision(response),
            (error) => this.onError(error)
        );
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }

    public closeMissionEvent() {
        if (MissionEventManager.Get != null && !MissionEventManager.CompletedMision() && !MissionEventManager.meIsTargetUser())
            this.showNotiMission("Mục tiêu đuổi bắt đã rời đi.");

        this.chatScrollView.content.removeAllChildren();
        this.hideMission();
    }

    private hasJoinEvent: boolean = false;
    private showUIMision(respone) {
        MissionEventManager.Set = respone.data;
        let mission = MissionEventManager.Get;
        if (mission == null) {
            this.hideMission();
            return;
        }
        let isTargetUser = MissionEventManager.meIsTargetUser();
        if (MissionEventManager.CompletedMision()) {
            MissionEventManager.stopMissionTimer();
            this.hideMission();
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
                message: isTargetUser ? "Nhiệm vụ hoàn tất. Chúc mừng bạn trốn thành công"
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
            this.objectShow.active = true;
            this.showMission(mission, isTargetUser);
        }
    }

    public showNotiTargetJoined() {
        this.getMissionEventData();
        if (MissionEventManager.meIsTargetUser() || MissionEventManager.CompletedMision()) return;
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


