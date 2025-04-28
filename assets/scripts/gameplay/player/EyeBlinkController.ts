import { _decorator, CCFloat, Component, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EyeBlinkController')
export class EyeBlinkController extends Component {
    @property({ type: CCFloat }) blinkDelay: number = 3;
    private minScale: Vec3 = new Vec3(1, 0.1, 1);
    private maxScale: Vec3 = new Vec3(1, 1, 1);
    protected start(): void {
        tween(this.node)
            .to(0.2, { scale: this.minScale })
            .to(0.2, { scale: this.maxScale })
            .delay(this.blinkDelay)
            .union()
            .repeatForever()
            .start()
    }
}


