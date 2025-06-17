import { _decorator, Component, Node, Label, Vec3, UITransform, Director, Prefab, view } from 'cc';
import { TooltipManager } from './TooltipManager'; // Import TooltipManager
import { RewardDisplayData } from '../Model/Item';
import { TooltipHover } from '../utilities/TooltipHover';
const { ccclass, property } = _decorator;

@ccclass('SlotTooltip')
export class SlotTooltip extends TooltipHover {
    private data: RewardDisplayData;
    private tooltipManager: TooltipManager = null;

    public setFullValue(tooltipManager: TooltipManager, data: RewardDisplayData) {
        this.data = data;
        this.tooltipManager = tooltipManager;
    }

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.on(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHoverHide, this);
    }

    public override onHoverShow() {
        this.tooltipManager.showGlobalTooltip(this.data, this.node);
    }

    public override onHoverHide() {
        this.tooltipManager.hideGlobalTooltip();
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.off(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.off(Node.EventType.TOUCH_END, this.onHoverHide, this);
        this.onHoverHide();
    }
}