import { _decorator, CCFloat, Component, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SeflRotate')
export class SeflRotate extends Component {
    @property({ type: CCFloat }) rotateSpeed: number = 1;

    protected start(): void {
        tween(this.node)
        .by(this.rotateSpeed, { eulerAngles: new Vec3(0, 0, 360) })
        .repeatForever()
        .start()
    }
}