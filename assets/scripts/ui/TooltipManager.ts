import { _decorator, Component, Node, Prefab, instantiate, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TooltipManager')
export abstract class TooltipManager extends Component {

    protected currentTooltipInstance: Node = null;

    protected onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.on(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHoverHide, this);
    }

    protected onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.off(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.off(Node.EventType.TOUCH_END, this.onHoverHide, this);
    }

    protected abstract onHoverShow()

    protected abstract onHoverHide()
}