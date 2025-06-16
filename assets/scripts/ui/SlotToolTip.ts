import { _decorator, Component, Node, Label, Vec3, UITransform, Director, Prefab, view } from 'cc';
import { TooltipManager } from './TooltipManager'; // Import TooltipManager
const { ccclass, property } = _decorator;

@ccclass('SlotTooltip')
export class SlotTooltip extends Component {
    private valueRate: number = 0;
    private valueName: string = null;
    private tooltipManager: TooltipManager = null;

    public setFullValue(valueName: string, valueRate: number, tooltipManager: TooltipManager) {
        this.valueName = valueName;
        this.valueRate = valueRate;
        this.tooltipManager = tooltipManager;
    }

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this._onHoverShow, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this._onHoverHide, this);
        this.node.on(Node.EventType.TOUCH_START, this._onHoverShow, this);
        this.node.on(Node.EventType.TOUCH_END, this._onHoverHide, this);
    }

    private _onHoverShow() {
        this.tooltipManager.showGlobalTooltip(this.valueName, this.valueRate.toString(), this.node);
    }

    private _onHoverHide() {
        this.tooltipManager.hideGlobalTooltip();
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this._onHoverShow, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this._onHoverHide, this);
        this.node.off(Node.EventType.TOUCH_START, this._onHoverShow, this);
        this.node.off(Node.EventType.TOUCH_END, this._onHoverHide, this);
        this._onHoverHide();
    }
}