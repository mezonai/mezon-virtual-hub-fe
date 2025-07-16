import { _decorator, Button, Component, Node } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { SettingManager } from '../core/SettingManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;

    onLoad() {
        this.btn_UIInventory.node.on("click", this.onOpenInventory, this);
        this.btn_UISetting.node.on("click", this.onOpenSettings, this);
    }

    onOpenInventory() {
        PopupManager.getInstance().openPopup("UIInventory", InventoryManager);
    }

    onOpenSettings() {
        PopupManager.getInstance().openPopup("UI_Settings", SettingManager);
    }
}


