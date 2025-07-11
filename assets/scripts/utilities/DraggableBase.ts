import { _decorator, Component, EventTouch, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DraggableBase')
export abstract class DraggableBase extends Component {
    private startPos: Vec3 = new Vec3();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }



    touchStart() {
        this.startPos.set(this.node.position);
        this.node.setSiblingIndex(999);
    }
    protected onTouchMove(event: EventTouch) {
        const delta = event.getUIDelta();
        this.node.setPosition(this.node.position.x + delta.x, this.node.position.y + delta.y);
    }


    protected isOverlapping(a: Node, b: Node): boolean {
        const aBox = a.getComponent(UITransform).getBoundingBoxToWorld();
        const bBox = b.getComponent(UITransform).getBoundingBoxToWorld();
        return aBox.intersects(bBox);
    }

    protected onTouchCancel(event: EventTouch) {
        this.resetPosition();
    }

    protected resetPosition() {
        this.node.setPosition(this.startPos);
    }
    abstract onTouchStart(event: EventTouch)
    abstract onTouchEnd(event: EventTouch)
}