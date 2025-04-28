import { _decorator, Component, Node, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PositionAnchor')
export class PositionAnchor extends Component {
    @property({ type: Vec3 }) targetPos: Vec3 = new Vec3();

    public moveToAnchor() {
        Tween.stopAllByTarget(this.node);
        this.node.position = Vec3.ZERO;
        tween(this.node)
            .to(0.2, { position: this.targetPos.clone() })
            .start();
    }
}