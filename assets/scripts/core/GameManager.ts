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

    public init() {
        this.uiMission.getMissionEventData();
        this.resetNoticeTrandferDiamon();
        this.tutorialCacthPet();
    }

    resetNoticeTrandferDiamon() {
        if (localStorage.getItem(Constants.NOTICE_TRANSFER_DIAMOND) !== null) {
            localStorage.removeItem(Constants.NOTICE_TRANSFER_DIAMOND);
        }
    }

    async tutorialCacthPet() {
        await WebRequestManager.instance.checkUnclaimedQuest();
        const runRewards = async () => {
            await this.getEventReward();
            await this.getNewbieReward();
            await this.getReward();
        };
        if (localStorage.getItem(Constants.TUTORIAL_CACTH_PET) === null) {
            const param: PopupTutorialCatchPetParam = {
                onActionCompleted: async () => {
                    await runRewards();
                },
            };
            await PopupManager.getInstance().openPopup("PopupTutorialCatchPet", PopupTutorialCatchPet, param);
            return;
        }
        await runRewards();
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

    async getNewbieReward() {
        const rewards = await WebRequestManager.instance.getRewardNewbieLoginAsync();
        if (!rewards || rewards.length === 0) return;
        GameManager.instance.playerHubController.showUIDailyReward(true);
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

    async getEventReward() {
        const eventReward = await WebRequestManager.instance.getEventRewardAsync();
        if (!eventReward || eventReward.rewards.length == 0) return;
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


