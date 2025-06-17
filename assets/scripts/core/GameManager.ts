import { _decorator, Component, Node } from 'cc';
import { ShopController } from '../gameplay/shop/ShopController';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { UIChat } from '../gameplay/ChatBox/UIChat';
import { UIMission } from '../gameplay/Mission/UIMission';
import { SettingManager } from './SettingManager';
import { ShopPetController } from '../gameplay/shop/ShopPetController';
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
    @property({ type: ShopController }) shopController: ShopController = null;
    @property({ type: ShopPetController }) shopPetController: ShopPetController = null;
    @property({ type: InventoryManager }) inventoryController: InventoryManager = null;
    @property({ type: UIChat }) uiChat: UIChat = null;
    @property({ type: UIMission }) uiMission: UIMission = null;
    @property({ type: SettingManager }) settingManager: SettingManager = null;
    @property({ type: Node }) canvas: Node = null;
    @property({ type: Node }) uiCanvas: Node = null;

    protected onLoad(): void {
        if (GameManager._instance == null) {
            GameManager._instance = this;
        }
    }

    public init() {
        this.getReward();
        this.shopController.init();
        this.inventoryController.init();
        this.shopPetController.init();
        this.uiMission.getMissionEventData();
        if (localStorage.getItem(Constants.TUTORIAL_CACTH_PET) === null) {
            this.canvas.active = false;
            this.canvas.active = false;
            const param: PopupTutorialCatchPetParam = {
                onActionCancel: () => {
                    this.canvas.active = true;
                    this.uiCanvas.active = true;
                }
            };
            PopupManager.getInstance().openPopup("PopupTutorialCatchPet", PopupTutorialCatchPet, param);
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


