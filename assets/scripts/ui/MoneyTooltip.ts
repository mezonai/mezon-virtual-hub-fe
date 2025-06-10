import { _decorator, Component, Node, EventTouch, EventMouse, Label, input, Input, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoneyTooltip')
export class MoneyTooltip extends Component {
    @property(Label)
    public tooltipLabel: Label = null;

    @property(Node)
    public tooltipNode: Node = null;

    private fullValue: number = 0;
    private moneyLimitTooltip: number = 10000;

    public setFullValue(value: number) {
        this.fullValue = value;
    }

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.showTooltip, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.hideTooltip, this);
        this.node.on(Node.EventType.TOUCH_START, this.showTooltip, this);
        this.node.on(Node.EventType.TOUCH_END, this.hideTooltip, this);

    }

    showTooltip() {
        if (!this.tooltipNode || !this.tooltipLabel || this.fullValue < this.moneyLimitTooltip) return;
        this.tooltipNode.active = true;
        this.tooltipLabel.string = this.fullValue.toLocaleString();
    }

    hideTooltip() {
        if (this.tooltipNode) this.tooltipNode.active = false;
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.showTooltip, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.hideTooltip, this);
        this.node.off(Node.EventType.TOUCH_START, this.showTooltip, this);
        this.node.off(Node.EventType.TOUCH_END, this.hideTooltip, this);
    }
}
