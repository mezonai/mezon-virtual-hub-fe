import { _decorator, Component, Enum, Node, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
export enum SlideDirection {
    HORIZONTAL = 0,
    VERTICAL = 1,
}
Enum(SlideDirection); // 👈 Quan trọng để hiện trong Inspector

@ccclass('SlideObject')
export class SlideObject extends Component {
    @property(Node)
    objectToSlide: Node = null;
    @property({ type: Vec3 })
    positionShow: Vec3 = new Vec3();

    @property({ type: Vec3 })
    positionHide: Vec3 = new Vec3();

    @property({ type: Enum(SlideDirection) })
    direction: SlideDirection = SlideDirection.HORIZONTAL;

    /**
     * Slide in or out based on direction and isShow
     */
    public async slide(isShow: boolean, timeShow: number) {
        const currentPos = this.objectToSlide.position.clone();
        const targetPos = currentPos.clone();

        if (this.direction === SlideDirection.HORIZONTAL) {
            targetPos.x = isShow ? this.positionShow.x : this.positionHide.x;
        } else {
            targetPos.y = isShow ? this.positionShow.y : this.positionHide.y;
        }

        await new Promise<void>((resolve) => {
            tween(this.objectToSlide)
                .to(timeShow, { position: targetPos })
                .call(resolve)
                .start();
        });
    }

    stopTween() {
        Tween.stopAllByTarget(this.objectToSlide);
    }
}


