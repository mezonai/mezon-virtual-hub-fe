import { _decorator, Component } from 'cc';
import { UIChat } from '../gameplay/ChatBox/UIChat';
import { UIMission } from '../gameplay/Mission/UIMission';
import { WebRequestManager } from '../network/WebRequestManager';
import ConvetData from './ConvertData';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupReward } from '../PopUp/PopupReward';
import { PopupTutorialCatchPet, PopupTutorialCatchPetParam } from '../PopUp/PopupTutorialCatchPet';
import { Constants } from '../utilities/Constants';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() {
        return GameManager._instance;
    }
    @property({ type: UIChat }) uiChat: UIChat = null;
    @property({ type: UIMission }) uiMission: UIMission = null;

    protected onLoad(): void {
        if (GameManager._instance == null) {
            GameManager._instance = this;
        }
    }

    public init() {
        this.uiMission.getMissionEventData();
        this.tutorialCacthPet();
    }

    tutorialCacthPet() {
        if (localStorage.getItem(Constants.TUTORIAL_CACTH_PET) === null) {
            const param: PopupTutorialCatchPetParam = {
                onActionCompleted: () => {
                    this.getReward();
                },
            };
            PopupManager.getInstance().openPopup("PopupTutorialCatchPet", PopupTutorialCatchPet, param);
        }
        else {
            this.getReward();
        }
    }

    getReward() {
        WebRequestManager.instance.postGetReward(
            (response) => this.handleGetReward(response),
            (error) => this.onError(error)
        );
    }

    protected onDestroy(): void {
        GameManager._instance = null;
    }


    handleGetReward(response: any) {
        const rewardsData = response?.data?.rewards ?? [];
        const rewardItems = ConvetData.ConvertReward(rewardsData);
        if (rewardItems.length <= 0) return;
        PopupManager.getInstance().openAnimPopup('PopupReward', PopupReward, { rewards: rewardItems });

    }

    private onError(error: any) {
        console.error("Error occurred:", error);
        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


