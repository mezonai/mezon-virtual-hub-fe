import { _decorator, Component, Node, EventTouch, EventMouse, Label, input, Input, Vec3 } from 'cc';
import { TooltipManager } from './TooltipManager';
const { ccclass, property } = _decorator;

@ccclass('MoneyTooltip')
export class MoneyTooltip extends TooltipManager  {
    @property(Label)
    public tooltipLabel: Label = null;

    @property(Node)
    public tooltipNode: Node = null;

    private fullValue: number = 0;
    private moneyLimitTooltip: number = 10000;

    public setFullValue(value: number) {
        this.fullValue = value;
    }

    public override onHoverShow() {
        if (!this.tooltipNode || !this.tooltipLabel || this.fullValue < this.moneyLimitTooltip) return;
        this.tooltipNode.active = true;
        this.tooltipLabel.string = this.fullValue.toLocaleString();
    }

    public override onHoverHide() {
        if (this.tooltipNode) this.tooltipNode.active = false;
    }

}
