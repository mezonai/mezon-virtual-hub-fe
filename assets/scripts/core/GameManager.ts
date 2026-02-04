import { _decorator, Component } from 'cc';
import { UIChat } from '../gameplay/ChatBox/UIChat';
import { UIMission } from '../gameplay/Mission/UIMission';
import { WebRequestManager } from '../network/WebRequestManager';
import ConvetData from './ConvertData';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupReward, PopupRewardParam, RewardStatus } from '../PopUp/PopupReward';
import { PopupTutorialCatchPet, PopupTutorialCatchPetParam } from '../PopUp/PopupTutorialCatchPet';
import { Constants } from '../utilities/Constants';
import { FoodType, RewardNewbieDTO, RewardType } from '../Model/Item';
import { PopupLoginQuest, PopupLoginQuestParam } from '../PopUp/PopupLoginQuest';
import { PlayerHubController } from '../ui/PlayerHubController';
import { PopupLoginEvents, PopupLoginEventsParam } from '../PopUp/PopupLoginEvents';
import { PopupTutorialFarm, PopupTutorialFarmParam } from '../PopUp/PopupTutorialFarm';
import { UserManager } from './UserManager';
import { PopupRewardClanWeekly, PopupRewardClanWeeklyParam } from '../PopUp/PopupRewardClanWeekly';
import { UserMeManager } from './UserMeManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() {
        return GameManager._instance;
    }
    @property({ type: UIChat }) uiChat: UIChat = null;
    @property({ type: UIMission }) uiMission: UIMission = null;
    @property({ type: PlayerHubController }) playerHubController: PlayerHubController = null;

    protected onLoad(): void {
        if (GameManager._instance == null) {
            GameManager._instance = this;
        }
    }

    public async init() {
        this.uiMission.getMissionEventData();
        this.resetNoticeTrandferDiamon();
        const runRewards = async () => {

            await this.getEventRewardNoQuest();
            await this.getEventReward();
            await this.getNewbieReward();
            await this.getReward();
            await this.getRewardClanWeekly();
        };
        await this.tutorialCacthPet();
        await this.tuturialFarm();
        UserMeManager.Get.user.isPetTutorialCompleted = true;
        UserMeManager.Get.user.isPlantTutorialCompleted = true;
        await runRewards();
    }

    resetNoticeTrandferDiamon() {
        if (localStorage.getItem(Constants.NOTICE_TRANSFER_DIAMOND) !== null) {
            localStorage.removeItem(Constants.NOTICE_TRANSFER_DIAMOND);
        }
    }

    async tutorialCacthPet() {
        await WebRequestManager.instance.checkUnclaimedQuest();
        if (UserMeManager.Get == null || UserMeManager.Get.user == null || UserMeManager.Get.user.isPetTutorialCompleted) return;
        const param: PopupTutorialCatchPetParam = {
            onActionCompleted: async () => {
            },
        };
        const popup = await PopupManager.getInstance().openPopup("PopupTutorialCatchPet", PopupTutorialCatchPet, param);
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
    }
    async tuturialFarm() {
        if (UserMeManager.Get == null || UserMeManager.Get.user == null || UserMeManager.Get.user.isPlantTutorialCompleted) return;
        const param: PopupTutorialFarmParam = {
        };
        const popup = await PopupManager.getInstance().openPopup("PopupTutorialFarm", PopupTutorialFarm, param);
        await Constants.waitUntil(() => UserManager.instance != null && UserManager.instance.GetMyClientPlayer != null && UserManager.instance.GetMyClientPlayer.get_MoveAbility != null);
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
    }
    async getReward() {
        const rewardItems = await WebRequestManager.instance.postGetRewardAsync();
        if (rewardItems.length <= 0) return;
        for (let i = 0; i < rewardItems.length; i++) {
            const name = Constants.getNameItem(rewardItems[i]);
            const content = `Chúc mừng bạn nhận thành công \n ${name}`;
            const param: PopupRewardParam = {
                status: RewardStatus.GAIN,
                content: content,
                reward: rewardItems[i]
            };
            const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, param);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        }
    }

    async getRewardClanWeekly() {
        const rewardItems = await WebRequestManager.instance.getRewardClanWeeklyAsync();
        if(rewardItems.items.length <= 0) return;
        const name = Constants.getNameRewardItem(rewardItems.type);
        const content = `Chúc mừng \n ${name}`;
        const param: PopupRewardClanWeeklyParam = {
            status: RewardStatus.GAIN,
            content: content,
            reward: rewardItems.items
        };
        const popup = await PopupManager.getInstance().openPopup('PopupRewardClanWeekly', PopupRewardClanWeekly, param);
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
    }

    async getNewbieReward() {
        const rewards = await WebRequestManager.instance.getRewardNewbieLoginAsync();
        if (!rewards || rewards.length === 0) {
            GameManager.instance.playerHubController.showButtonLoginNewbie(false);
            return;
        }
        GameManager.instance.playerHubController.showButtonLoginNewbie(true);
        const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        const lastLogged = localStorage.getItem(Constants.SHOW_DAILY_QUEST_FIRST_DAY);
        if (lastLogged !== today) {
            const param: PopupLoginQuestParam = {
                rewardNewbieDTOs: rewards,
            };

            const popup = await PopupManager.getInstance().openPopup(
                "PopupLoginQuest",
                PopupLoginQuest,
                param
            );
            localStorage.setItem(Constants.SHOW_DAILY_QUEST_FIRST_DAY, today);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        }
    }

    async getEventRewardNoQuest() {
        const rewardItems = await WebRequestManager.instance.getEventRewardNoQuestAsync();
        if (rewardItems.length <= 0) return;
        for (let i = 0; i < rewardItems.length; i++) {
            const name = Constants.getNameItem(rewardItems[i]);
            const content = `Chúc mừng bạn nhận thành công \n ${name}`;
            const param: PopupRewardParam = {
                status: RewardStatus.GAIN,
                content: content,
                reward: rewardItems[i]
            };
            const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, param);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        }
    }

    async getEventReward() {
        const eventReward = await WebRequestManager.instance.getEventRewardAsync();
        if (!eventReward || eventReward.rewards.length == 0) {
            GameManager.instance.playerHubController.showButtonLoginEvent(false);
            return;
        }
        if (!eventReward.isShowFirstDay) return;// ko show nhưng có event nên ko tắt nút
        GameManager.instance.playerHubController.showButtonLoginEvent(true);
        const param: PopupLoginEventsParam = {
            rewardEvents: eventReward,
        };

        const popup = await PopupManager.getInstance().openPopup(
            "PopupLoginEvents",
            PopupLoginEvents,
            param
        );
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);

    }

    protected onDestroy(): void {
        GameManager._instance = null;
    }


    private onError(error: any) {
        console.error("Error occurred:", error);
        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


