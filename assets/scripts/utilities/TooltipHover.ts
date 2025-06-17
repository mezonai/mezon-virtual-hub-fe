import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TooltipHover')
export class TooltipHover extends Component {
     onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.on(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHoverHide, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_ENTER, this.onHoverShow, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onHoverHide, this);
        this.node.off(Node.EventType.TOUCH_START, this.onHoverShow, this);
        this.node.off(Node.EventType.TOUCH_END, this.onHoverHide, this);
    }

    protected onHoverShow() {
        
    }

    protected onHoverHide() {
       
    }
}


