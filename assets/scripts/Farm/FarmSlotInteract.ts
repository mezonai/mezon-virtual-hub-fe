import { _decorator, Component, Node } from 'cc';
import { CCFloat } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupChoosePlant } from '../PopUp/PopupChoosePlant';
const { ccclass, property } = _decorator;

@ccclass('FarmSlotInteract')
export class FarmSlotInteract extends Component {
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: CCFloat }) interactDistance: number = 60;

    protected start(): void {
        if (this.targetClicker == null) {
            this.targetClicker = this.node.parent;
        }
        this.targetClicker.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    protected onDisable() {
        if (this.targetClicker) {
            this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    onTouchStart(event) {
        PopupManager.getInstance().openPopup( "PopupChoosePlant", PopupChoosePlant);
    }
}


