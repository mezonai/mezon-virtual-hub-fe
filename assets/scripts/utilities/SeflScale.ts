import { _decorator, Component, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SeflScale')
export class SeflScale extends Component {
    public originScale: Vec3 = Vec3.ONE;
    @property({type: Vec3}) shinkAmount: Vec3 = new Vec3(0.1, 0.1, 0.1);
    protected onLoad(): void {
        this.originScale = this.node.scale.clone();
    }

    protected onEnable(): void {
        tween(this.node)
            .to(0.5, { scale: this.originScale.clone().subtract(this.shinkAmount.clone()) })
            .to(0.5, { scale: this.originScale })
            .union()
            .repeatForever()
            .start();
    }

    protected onDisable(): void {
        Tween.stopAllByTarget(this.node);
    }
    
}


