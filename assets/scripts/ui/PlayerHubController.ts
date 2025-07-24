import { _decorator, Button, Component, Node } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager, InventoryParam } from '../gameplay/player/inventory/InventoryManager';
import { SettingManager, SettingParam } from '../core/SettingManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    protected isOpenPopUp: boolean = false;

    onLoad() {
        this.btn_UIInventory.node.on("click", this.onOpenInventory, this);
        this.btn_UISetting.node.on("click", this.onOpenSettings, this);
    }

    onOpenInventory() {
        if (this.isOpenPopUp) return;
        this.isOpenPopUp = true;

        const param: InventoryParam = {
            onActionClose: () => {
                this.isOpenPopUp = false;
            }
        };
        PopupManager.getInstance().openAnimPopup("UIInventory", InventoryManager, param);
    }

    onOpenSettings() {
        if (this.isOpenPopUp) return;
        this.isOpenPopUp = true;

        const param: SettingParam = {
            onActionClose: () => {
                this.isOpenPopUp = false;
            }
        };
        PopupManager.getInstance().openAnimPopup("UI_Settings", SettingManager, param);
    }
}


