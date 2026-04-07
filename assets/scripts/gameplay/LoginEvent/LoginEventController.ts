import { Vec3 } from 'cc';
import { tween } from 'cc';
import { Tween } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { WebRequestManager } from '../../network/WebRequestManager';
import { PopupLoginQuest, PopupLoginQuestParam } from '../../PopUp/PopupLoginQuest';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupLoginEvents, PopupLoginEventsParam } from '../../PopUp/PopupLoginEvents';
import { PopupEventLeaderboard } from '../../PopUp/PopupEventLeaderboard';
const { ccclass, property } = _decorator;

@ccclass('LoginEventController')
export class LoginEventController extends Component {
    @property(Node) private redDotButtonEventReward: Node = null;
    @property(Node) private redDotLoginNewbieReward: Node = null;
    @property(Node) private redDotLoginEventReward: Node = null;
    @property(Node) private redDotOfficeDayLeaderboard: Node = null;
    @property(Button) private btn_EventReward: Button = null!;
    @property(Button) private btn_LoginNewbieReward: Button = null!;
    @property(Button) private btn_LoginEventReward: Button = null!;
    @property(Button) private btn_OfficeDayLeaderboard: Button = null!;
    @property(Node) private panelButtonEvent: Node = null!;
    private isShow = false;
    private hasLoginNewbieReward = false;
    private hasLoginEventReward = false;


    async setData() {
        this.showButtonEventReward(true);
        this.showPanelButton(false);
        
        this.btn_EventReward.addAsyncListener(async () => {
            this.showPanelButton(!this.isShow);
            this.btn_EventReward.interactable = true;
        });

        this.btn_LoginNewbieReward.addAsyncListener(async () => {
            this.btn_LoginNewbieReward.interactable = false;
            const rewards = await WebRequestManager.instance.getRewardNewbieLoginAsync();
            if (rewards != null && rewards.length > 0) {
                const param: PopupLoginQuestParam = {
                    rewardNewbieDTOs: rewards,
                };
                await PopupManager.getInstance().openPopup('PopupLoginQuest', PopupLoginQuest, param);
            }
            this.btn_LoginNewbieReward.interactable = true;
        });

        this.btn_LoginEventReward.addAsyncListener(async () => {
            this.btn_LoginEventReward.interactable = false;
            const eventReward = await WebRequestManager.instance.getEventRewardAsync();
            if (eventReward != null && eventReward.rewards.length > 0) {
                const param: PopupLoginEventsParam = {
                    rewardEvents: eventReward,
                };

                await PopupManager.getInstance().openPopup("PopupLoginEvents", PopupLoginEvents, param);
            }
            this.btn_LoginEventReward.interactable = true;
        });
        

        const allEventRes = await WebRequestManager.instance.getAllGameEventAsync();

        if (allEventRes && allEventRes.data) {
            const officeDayEvent = allEventRes.data.find(event => event.name === "Office Day Hour");

            if (officeDayEvent) {    
                this.btn_OfficeDayLeaderboard.addAsyncListener(async () => {
                    this.btn_OfficeDayLeaderboard.interactable = false; 
                    const leaderboard = await WebRequestManager.instance.getLeaderboardEventAsync(officeDayEvent.id);

                    if (leaderboard != null && leaderboard.data) {
                        const param: PopupLoginEventsParam = {
                            rewardEvents: officeDayEvent.id,
                        };

                        await PopupManager.getInstance().openAnimPopup('UI_EventLeaderboard', PopupEventLeaderboard, param);
                    }
                    this.btn_OfficeDayLeaderboard.interactable = true; 
                });
            } else {
                console.error("Get all event failed or return null");
            }
        }
    }


    private showPanelButton(isShow: boolean) {
        const target = this.panelButtonEvent;  // Node B

        const smallScale = new Vec3(0, 0, 1);
        const largeScale = new Vec3(1, 1, 1);

        Tween.stopAllByTarget(target);

        if (!isShow) {
            tween(target)
                .to(0.25, { scale: smallScale }, { easing: "backIn" })
                .start();
        } else {
            tween(target)
                .to(0.25, { scale: largeScale }, { easing: "backOut" })
                .start();
        }

        this.isShow = isShow;
    }

    private showButtonEventReward(isShow: boolean) {
        this.btn_EventReward.node.active = isShow;
    }

    showButtonLoginNewbie(isShow: boolean) {
        this.btn_LoginNewbieReward.node.active = isShow;
    }

    showButtonLoginEvent(isShow: boolean) {
        this.btn_LoginEventReward.node.active = isShow;
    }

    private showNoticeEventReward(hasRedDotLoginNewbie: boolean, hasRedDotLoginEvent: boolean) {
        this.redDotButtonEventReward.active = hasRedDotLoginNewbie || hasRedDotLoginEvent;
    }

    showNoticeLoginNewbieReward(isShow: boolean) {
        this.hasLoginNewbieReward = isShow;
        this.redDotLoginNewbieReward.active = isShow;
        this.showNoticeEventReward(isShow, this.hasLoginEventReward);

    }

    showNoticeLoginEventReward(isShow: boolean) {
        this.hasLoginEventReward = isShow;
        this.redDotLoginEventReward.active = isShow;
        this.showNoticeEventReward(this.hasLoginNewbieReward, isShow);
    }
}


