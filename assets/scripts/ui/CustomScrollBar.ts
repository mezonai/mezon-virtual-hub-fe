import { _decorator, Component, EventTouch, Node, ScrollView, Vec2, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomScrollBar')
export class CustomScrollBar extends Component {
    @property(ScrollView)
    scrollView: ScrollView = null;

    private _lastTouchPos: Vec2 = new Vec2();

    onLoad() {
        this.scrollView.inertia = false;
        this.scrollView.elastic = false;

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onEnable(): void {
        this.scheduleOnce(() => {
            if (this.scrollView) {
                this.scrollView.scrollToTop(0)
            }
        }, 0.05);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onTouchStart(event: EventTouch) {
        this._lastTouchPos = event.getLocation();
    }

    onTouchMove(event: EventTouch) {
        const currentPos = event.getLocation();
        const deltaY = currentPos.y - this._lastTouchPos.y;

        const currentOffset = this.scrollView.getScrollOffset();
        const newOffsetY = currentOffset.y - deltaY;

        const contentHeight = this.scrollView.content.getComponent(UITransform).height;
        const viewHeight = this.scrollView.view.getComponent(UITransform).height;
        const maxOffsetY = Math.max(0, contentHeight - viewHeight);

        const clampedY = Math.max(0, Math.min(newOffsetY, maxOffsetY));

        this.scrollView.scrollToOffset(new Vec2(0, clampedY), 0);
        this._lastTouchPos = currentPos;
    }
}
