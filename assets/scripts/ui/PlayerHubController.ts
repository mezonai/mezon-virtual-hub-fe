import { _decorator, Button, Component, Node } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(Button) private btn_UIInventory: Button = null!;

    onLoad() {
        this.btn_UIInventory.node.on("click", this.onOpenInventory, this);
    }

    onOpenInventory() {
        PopupManager.getInstance().openPopup("UIInventory", InventoryManager);
    }
}


