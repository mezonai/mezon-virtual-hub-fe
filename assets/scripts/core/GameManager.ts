import { _decorator, Component } from 'cc';
import { UIChat } from '../gameplay/ChatBox/UIChat';
import { UIMission } from '../gameplay/Mission/UIMission';
import { WebRequestManager } from '../network/WebRequestManager';
import ConvetData from './ConvertData';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupReward, PopupRewardParam, RewardNewType, RewardStatus } from '../PopUp/PopupReward';
import { PopupTutorialCatchPet, PopupTutorialCatchPetParam } from '../PopUp/PopupTutorialCatchPet';
import { Constants } from '../utilities/Constants';
import { FoodType, RewardNewbieDTO, RewardType } from '../Model/Item';
import { PopupLoginQuest, PopupLoginQuestParam } from '../PopUp/PopupLoginQuest';
import { PlayerHubController } from '../ui/PlayerHubController';

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
        this.tutorialCacthPet();
        this.resetNoticeTrandferDiamon();
    }

    resetNoticeTrandferDiamon() {
        if (localStorage.getItem(Constants.NOTICE_TRANSFER_DIAMOND) !== null) {
            localStorage.removeItem(Constants.NOTICE_TRANSFER_DIAMOND);
        }
    }

    tutorialCacthPet() {
        // if (localStorage.getItem(Constants.TUTORIAL_CACTH_PET) === null) {
        //     const param: PopupTutorialCatchPetParam = {
        //         onActionCompleted: () => {
        //             this.getReward();
        //         },
        //     };
        //     PopupManager.getInstance().openPopup("PopupTutorialCatchPet", PopupTutorialCatchPet, param);
        // }
        // else {
        //     this.getReward();
        // }
        this.getReward();

        this.getNewbieReward();
    }

    getReward() {
        WebRequestManager.instance.postGetReward(
            (response) => this.handleGetReward(response),
            (error) => this.onError(error)
        );
    }

    async getNewbieReward() {
        const rewards = await WebRequestManager.instance.getRewardNewbieLogin();
        if (!rewards || rewards.length === 0) return;

        const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
        const lastLogged = localStorage.getItem(Constants.SHOW_DAILY_QUEST_FIRST_DAY);
        console.log("today: ", today);
        console.log("lastLogged : ", lastLogged);
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

    protected onDestroy(): void {
        GameManager._instance = null;
    }


    async handleGetReward(response: any) {
        const rewardsData = response?.data?.rewards ?? [];
        const rewardItems = ConvetData.ConvertReward(rewardsData);
        if (rewardItems.length <= 0) return;
        for (let i = 0; i < rewardItems.length; i++) {
            const type = Constants.mapRewardType(rewardItems[i]);
            const name = type == RewardNewType.NORMAL_FOOD ? "Thức ăn sơ cấp" : type == RewardNewType.PREMIUM_FOOD ? "Thức ăn cao cấp"
                : type == RewardNewType.ULTRA_PREMIUM_FOOD ? "Thức ăn siêu cao cấp" : type == RewardNewType.GOLD ? "Vàng" : "Kim cương";
            const content = `Chúc mừng bạn nhận thành công \n ${name}`;
            const param: PopupRewardParam = {
                rewardType: type,
                quantity: rewardItems[i].quantity,
                status: RewardStatus.GAIN,
                content: content,
            };
            const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, param);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        }


    }

    private onError(error: any) {
        console.error("Error occurred:", error);
        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


