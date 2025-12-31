import { Tween } from 'cc';
import { CCFloat } from 'cc';
import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShakeRotation')
export class ShakeRotation extends Component {
    @property({ type: CCFloat }) rotateSpeed: number = 0.8;
    protected start(): void {
        tween(this.node)
            .to(this.rotateSpeed, { angle: -20 })
            .to(this.rotateSpeed, { angle: 20 })
            .to(this.rotateSpeed, { angle: -20 })
            .to(this.rotateSpeed, { angle: 20 })
            .union()
            .repeatForever()
            .start();
    }

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
    }
}

