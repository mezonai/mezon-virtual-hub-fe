import { _decorator, Component, Node, Quat, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HandShake')
export class HandShake extends Component {
    protected start(): void {
        tween(this.node)
            .to(0.2, { angle: -10})
            .to(0.1, { angle: 6 })
            .to(0.2, { angle: -10})
            .to(0.1, { angle: 6 })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }
}


