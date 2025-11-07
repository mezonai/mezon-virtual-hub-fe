import { _decorator, Component, Node, tween, UIOpacity, Vec3, randomRange } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SelfBlinkAndFloat')
export class SelfBlinkAndFloat extends Component {
    @property({ type: Node }) targetNode: Node = null!;
    @property minOpacity: number = 50;
    @property maxOpacity: number = 255;
    @property blinkDuration: number = 0.5;
    @property moveRadius: number = 5;
    @property moveDuration: number = 1.5;
    private uiOpacity!: UIOpacity;
    private originPos: Vec3 = new Vec3();
    private isMoving: boolean = false;

    protected onEnable(): void {
        if (!this.targetNode) this.targetNode = this.node;
        this.originPos.set(this.targetNode.position);
        this.uiOpacity = this.targetNode.getComponent(UIOpacity) || this.targetNode.addComponent(UIOpacity);

        tween(this.uiOpacity)
            .to(this.blinkDuration, { opacity: this.minOpacity })
            .to(this.blinkDuration, { opacity: this.maxOpacity })
            .union()
            .repeatForever()
            .start();

        this.startRandomMove();
    }

    private startRandomMove() {
        this.isMoving = true;
        this.moveToRandomPos();
    }

    private moveToRandomPos() {
        if (!this.isMoving) return;
        const offsetX = randomRange(-this.moveRadius, this.moveRadius);
        const offsetY = randomRange(-this.moveRadius, this.moveRadius);
        const newPos = new Vec3(this.originPos.x + offsetX, this.originPos.y + offsetY, this.originPos.z);

        tween(this.targetNode)
            .to(this.moveDuration, { position: newPos })
            .call(() => this.moveToRandomPos())
            .start();
    }

    protected onDisable(): void {
        this.isMoving = false;
        tween(this.uiOpacity).stop();
        tween(this.targetNode).stop();
        this.uiOpacity.opacity = this.maxOpacity;
        this.targetNode.setPosition(this.originPos);
    }
}
