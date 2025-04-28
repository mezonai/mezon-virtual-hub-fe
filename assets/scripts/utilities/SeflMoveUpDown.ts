import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SeflMoveUpDown')
export class SeflMoveUpDown extends Component {
    @property
    speed: number = 0.5;

    @property
    moveDistance: number = 30;

    start() {
        const startPos = this.node.position.clone();
        const targetPos = new Vec3(startPos.x, startPos.y + this.moveDistance, startPos.z);
        const moveTween = tween()
            .to(this.speed, { position: targetPos }, { easing: "sineInOut" })
            .to(this.speed, { position: startPos }, { easing: "sineInOut" });
        tween(this.node)
            .then(moveTween)
            .union()
            .repeatForever()
            .start();
    }
}


