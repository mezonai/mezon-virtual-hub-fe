import { _decorator, Component, EventTouch, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DraggableBase')
export abstract class DraggableBase extends Component {
    private startPos: Vec3 = new Vec3();
    public containerNode: Node;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
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

    clampToContainer(pos: Vec3): Vec3 {
        if (!this.containerNode) return pos;

        const container = this.containerNode.getComponent(UITransform).getBoundingBoxToWorld();
        const selfBox = this.node.getComponent(UITransform).getBoundingBoxToWorld();
        const halfW = selfBox.width / 2;
        const halfH = selfBox.height / 2;

        const minX = container.xMin + halfW;
        const maxX = container.xMax - halfW;
        const minY = container.yMin + halfH;
        const maxY = container.yMax - halfH;

        const worldPos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(pos);
        const clampedX = Math.min(maxX, Math.max(minX, worldPos.x));
        const clampedY = Math.min(maxY, Math.max(minY, worldPos.y));

        const localPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(
            new Vec3(clampedX, clampedY, pos.z)
        );

        return localPos;
    }

    protected resetPosition() {
        this.node.setPosition(this.startPos);
    }
    abstract onTouchStart(event: EventTouch)
    abstract onTouchEnd(event: EventTouch)
}