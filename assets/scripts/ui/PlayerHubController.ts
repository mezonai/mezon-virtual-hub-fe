import { _decorator, Button, Component, Node } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { SettingManager } from '../core/SettingManager';
import { UIMissionDetail } from '../gameplay/Mission/UIMissionDetail';
import { WebRequestManager } from '../network/WebRequestManager';
import { PopupLoginQuest, PopupLoginQuestParam } from '../PopUp/PopupLoginQuest';
import { PopupOwnedAnimals } from '../PopUp/PopupOwnedAnimals';
import { PopupClanList } from '../PopUp/PopupClanList';
import { PopupClanDetailInfo } from '../PopUp/PopupClanDetailInfo';
import { UserMeManager } from '../core/UserMeManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    @property(Button) private btn_UIMission: Button = null!;
    @property(Button) private showOwnedButton: Button;
    @property(Button) private btn_UIDailyReward: Button = null!;
    @property(Button) private btn_UIGuildReward: Button = null!;
    @property(Node) private redDotNoticeMission: Node = null!;
    @property(Node) private redDotDailyReward: Node = null!;

    onLoad() {
        this.btn_UIInventory.addAsyncListener(async () => {
            this.btn_UIInventory.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UIInventory", InventoryManager);
            this.btn_UIInventory.interactable = true;
        });
        this.btn_UISetting.addAsyncListener(async () => {
            this.btn_UISetting.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_Settings", SettingManager);
            this.btn_UISetting.interactable = true;
        });
        this.btn_UIMission.addAsyncListener(async () => {
            this.btn_UIMission.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UIMission", UIMissionDetail);
            this.btn_UIMission.interactable = true;
        });
        this.showOwnedButton.addAsyncListener(async () => {
            this.showOwnedButton.interactable = false;
            await PopupManager.getInstance().openAnimPopup('PopupOwnedAnimals', PopupOwnedAnimals);
            this.showOwnedButton.interactable = true;
        });
        this.btn_UIGuildReward.addAsyncListener(async () => {
            this.btn_UIGuildReward.interactable = false;
            if(UserMeManager.Get.clan){
                await PopupManager.getInstance().openAnimPopup('UI_ClanDetailInfo', PopupClanDetailInfo);
            }
            else{
                await PopupManager.getInstance().openAnimPopup('UI_ClanList', PopupClanList);
            }
            this.btn_UIGuildReward.interactable = true;
        });
        this.btn_UIDailyReward.addAsyncListener(async () => {
            this.btn_UIDailyReward.interactable = false;
            const rewards = await WebRequestManager.instance.getRewardNewbieLoginAsync()
            if (rewards != null && rewards.length > 0) {
                const param: PopupLoginQuestParam = {
                    rewardNewbieDTOs: rewards,
                };
                await PopupManager.getInstance().openPopup('PopupLoginQuest', PopupLoginQuest, param);
            }
            this.btn_UIDailyReward.interactable = true;
        });
    }

    onMissionNotice(isShow: boolean) {
        this.redDotNoticeMission.active = isShow;
    }

    showNoticeDailyReward(isShow: boolean) {
        this.redDotDailyReward.active = isShow;
    }

    showUIDailyReward(isShow: boolean){
        this.btn_UIDailyReward.node.active = isShow;
    }
}