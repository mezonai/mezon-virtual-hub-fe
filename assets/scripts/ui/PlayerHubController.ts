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
import { Vec3 } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { LoginEventController } from '../gameplay/LoginEvent/LoginEventController';
import { PopupCombieFragment, PopupCombieFragmentParam } from '../PopUp/PopupCombieFragment';

const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(LoginEventController) private loginEventController: LoginEventController = null;
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    @property(Button) private btn_UIMission: Button = null!;
    @property(Button) private showOwnedButton: Button;
    @property(Button) private btn_UIGuildReward: Button = null!;
    @property(Node) private redDotNoticeMission: Node = null!;
    @property(Node) private blockInteractHarvest: Node = null!;

    onLoad() {
        this.loginEventController.setData();
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
            const data = await WebRequestManager.instance.getItemFragmentAsync("Voltstrider");
            console.log("Data fragment: ", data);
            // await PopupManager.getInstance().openAnimPopup('PopupOwnedAnimals', PopupOwnedAnimals);
            const param: PopupCombieFragmentParam = {
                fragmentData: data,
                onFinishAnim: async () => { },
            };
            await PopupManager.getInstance().openPopup('PopupCombieFragment', PopupCombieFragment, param);
            this.showOwnedButton.interactable = true;
        });
        this.btn_UIGuildReward.addAsyncListener(async () => {
            this.btn_UIGuildReward.interactable = false;
            if (UserMeManager.Get.clan) {
                await PopupManager.getInstance().openAnimPopup('UI_ClanDetailInfo', PopupClanDetailInfo);
            }
            else {
                await PopupManager.getInstance().openAnimPopup('UI_ClanList', PopupClanList);
            }
            this.btn_UIGuildReward.interactable = true;
        });
    }

    onClickButtonA() {

    }

    onMissionNotice(isShow: boolean) {
        this.redDotNoticeMission.active = isShow;
    }

    showNoticeLoginNewbie(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showNoticeLoginNewbieReward(isShow);
    }

    showNoticeLoginEvent(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showNoticeLoginEventReward(isShow);
    }

    showButtonLoginNewbie(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showButtonLoginNewbie(isShow);
    }

    showButtonLoginEvent(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showButtonLoginEvent(isShow);
    }

    public showBlockInteractHarvest(isBlock: boolean) {
        this.blockInteractHarvest.active = isBlock;
    }

}