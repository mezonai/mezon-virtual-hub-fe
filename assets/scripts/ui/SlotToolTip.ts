import { _decorator, Component, Node, Label, Vec3, UITransform, Director, Prefab, view } from 'cc';
import { TooltipManager } from './TooltipManager'; // Import TooltipManager
import { RewardDisplayData } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('SlotTooltip')
export class SlotTooltip extends Component {
    private data: RewardDisplayData;
    private tooltipManager: TooltipManager = null;

    public setFullValue(tooltipManager: TooltipManager, data: RewardDisplayData) {
        this.data = data;
        this.tooltipManager = tooltipManager;
    }

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this._onHoverShow, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this._onHoverHide, this);
        this.node.on(Node.EventType.TOUCH_START, this._onHoverShow, this);
        this.node.on(Node.EventType.TOUCH_END, this._onHoverHide, this);
    }

    private _onHoverShow() {
        this.tooltipManager.showGlobalTooltip(this.data, this.node);
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