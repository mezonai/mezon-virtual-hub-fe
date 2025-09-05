import { _decorator, Button, Component, Node } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { SettingManager } from '../core/SettingManager';
import { UIMissionDetail } from '../gameplay/Mission/UIMissionDetail';
import { EVENT_NAME } from '../network/APIConstant';
import { director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    @property(Button) private btn_UIMission: Button = null!;
    @property(Node) private redDotNoticeMission: Node = null!;

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
    }

    onMissionNotice(isShow: boolean) {
        this.redDotNoticeMission.active = isShow;
    }
}