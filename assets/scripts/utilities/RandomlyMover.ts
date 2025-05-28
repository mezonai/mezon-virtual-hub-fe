import { _decorator, Component, tween, Vec3, randomRange, Vec2, Tween, Node, CCBoolean } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RandomlyMover')
export class RandomlyMover extends Component {
    @property({ type: Node }) renderer: Node = null;
    @property({ type: Node }) notice: Node = null;
    @property({ type: CCBoolean }) needRotate: boolean = true;
    @property moveDuration: number = 5;
    @property areaSize: Vec2 = new Vec2(0, 0);
    @property maxSpeed: number = 100;
    @property minSpeed: number = 40;
    public get IsInSideMap() {
        return (this.node.position.x > -this.areaSize.x && this.node.position.x < this.areaSize.x) &&
            (this.node.position.y > -this.areaSize.y && this.node.position.y < this.areaSize.y)
    }

    public move() {
        this.moveRandomly();
    }

    // protected onDisable(): void {
    //     this.stop();
    // }

    public stopMove() {
        Tween.stopAllByTarget(this.node);
    }

    public stop() {
        Tween.stopAllByTarget(this.node);
        this.toggleActiveAll(false);
    }

    private moveRandomly() {
        const randomPos = new Vec3(
            randomRange(-this.areaSize.x, this.areaSize.x),
            randomRange(-this.areaSize.y, this.areaSize.y),
            0
        );

        this.moveToTarget(randomPos);
    }

    public moveToTarget(targetPosition: Vec3, repeat: boolean = true, callback = null) {
        const direction = new Vec2(targetPosition.x - this.node.position.x, targetPosition.y - this.node.position.y);
        const distance = Vec3.distance(this.node.position, targetPosition);
        const speed = randomRange(this.minSpeed, this.maxSpeed);
        const moveTime = distance / speed;

        if (this.needRotate) {
            const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
            tween(this.renderer)
                .to(0.3, { angle: angle })
                .start();
        }
        else {
            this.renderer.scale = new Vec3(direction.x > 0 ? 1 : -1, 1);
        }


        tween(this.node)
            .to(moveTime, { position: targetPosition }, { easing: 'linear' })
            .call(() => {
                if (repeat) {
                    this.moveRandomly();
                }
                else if (callback != null) {
                    callback();
                }
            })
            .start();
    }

    private toggleActiveAll(active) {
        this.node.parent.active = active;
        this.node.active = active;
        if (this.renderer.scale.x != 1) {
            this.renderer.scale = Vec3.ONE;
        }
    }

    public moveToTargetWorld(targetPosition: Vec3, repeat: boolean = true, speed: number = 100, callback = null) {
        this.notice.active = false;
        this.toggleActiveAll(true);
        const direction = new Vec2(targetPosition.x - this.node.worldPosition.x, targetPosition.y - this.node.worldPosition.y);
        const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);

        const distance = Vec3.distance(this.node.worldPosition, targetPosition);

        const moveTime = distance / speed;

        this.renderer.angle = angle;

        tween(this.renderer)
            .to(moveTime + 0.2, { scale: Vec3.ZERO })
            .call(() => {
                if (callback != null) {
                    callback();
                }
            })
            .start();
        tween(this.node)
            .to(moveTime, { worldPosition: targetPosition }, { easing: 'linear' })
            .start();
    }

    public moveToTarget2(targetPosition: Vec3, repeat: boolean = true, callback = null) {
        if ((this.node as any)._currentTween) {
            (this.node as any)._currentTween.stop();
            (this.node as any)._currentTween = null;
        }
        const direction = new Vec2(targetPosition.x - this.node.position.x, targetPosition.y - this.node.position.y);
        const distance = Vec3.distance(this.node.position, targetPosition);
        const speed = randomRange(this.minSpeed, this.maxSpeed);
        const moveTime = distance / speed;

        if (this.needRotate) {
            const angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
            tween(this.renderer)
                .to(0.3, { angle: angle })
                .start();
        }
        else {
            this.renderer.scale = new Vec3(direction.x > 0 ? 1 : -1, 1);
        }


        (this.node as any)._currentTween = tween(this.node)
            .to(moveTime, { position: targetPosition }, { easing: 'linear' })
            .call(() => {
                if (repeat) {
                    this.moveRandomly();
                }
                else if (callback != null) {
                    callback();
                }
            })
            .start();
    }
}
