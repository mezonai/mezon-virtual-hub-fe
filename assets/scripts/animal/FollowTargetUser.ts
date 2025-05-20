import { _decorator, Component, Node, randomRange, tween, Tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowTargetUser')
export class FollowTargetUser extends Component {
    @property followSpeedSlow: number = 50;
    @property followSpeedFast: number = 100;
    @property wanderSpeed: number = 50;
    private spriteNode: Node = null!;
    private userTarget: Node;
    private currentTween: Tween<Node> = null;
    private isWandering = false;
    private lastPlayerPos: Vec3 = new Vec3();
    private stopDistance = 50;
    private wanderRadius = 100;
    private timeSchedule = 0.5;
    public playFollowTarget(target: Node, spriteNode: Node) {
        this.userTarget = target;
        this.spriteNode = spriteNode;
        if (this.userTarget == null) return;
        this.schedule(this.updateFollowLogic, this.timeSchedule);
    }
    onDisable() {
        this.unschedule(this.updateFollowLogic);
    }
    updateFollowLogic() {
    const playerWorldPos = this.userTarget.worldPosition;
    const petWorldPos = this.node.getWorldPosition();
    const distance = Vec3.distance(playerWorldPos, petWorldPos);
    const playerMoved = !playerWorldPos.equals(this.lastPlayerPos);

    // Ban đầu pet tự do lang thang nếu chưa bắt đầu
    if (!this.isWandering && !this.currentTween) {
        this.startWanderingAroundPlayer();
        return;
    }

    if (playerMoved) {
        // Player đang di chuyển
        if (distance > this.wanderRadius) {
            this.stopTween();
            this.followPlayerSmoothly(this.timeSchedule, petWorldPos, playerWorldPos, this.followSpeedFast);
        }
    } else {
        // Player đứng yên → chỉ chạy tới gần nếu khoảng cách > wanderRadius
        this.stopTween();
        if (distance > this.wanderRadius) {         
            this.followPlayerSmoothly(this.timeSchedule, petWorldPos, playerWorldPos, this.followSpeedFast);
        } else {
            this.followPlayerSmoothly(this.timeSchedule, petWorldPos, playerWorldPos, this.followSpeedSlow);
        }
    }

    this.lastPlayerPos = playerWorldPos.clone();
}

    followPlayerSmoothly(dt: number, currentPos: Vec3, targetPos: Vec3, speed: number) {
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);
        const distance = direction.length();

        if (distance < this.stopDistance) {
            this.stopTween();
            if (!this.isWandering) {
                this.startWanderingAroundPlayer();
            }
            return;
        }

        // Tính tốc độ giảm dần khi gần player
        const approachFactor = Math.min(1, distance / 50);
        const adjustedSpeed = speed * approachFactor;

        direction.normalize();
        const moveStep = direction.multiplyScalar(adjustedSpeed * dt);
        const newWorldPos = currentPos.clone().add(moveStep);

        const localPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(newWorldPos);

        // Cập nhật hướng lật pet
        this.spriteNode.setScale(new Vec3(direction.x < 0 ? -1 : 1, 1, 1));

        this.stopTween();

        this.currentTween = tween(this.node)
            .to(dt, { position: localPos }, { easing: 'linear' })
            .call(() => {
                // Khi đến gần player thì tự động bắt đầu lang thang
                const petWorldPos = this.node.getWorldPosition();
                const distToPlayer = Vec3.distance(petWorldPos, targetPos);
                if(distToPlayer > this.wanderRadius){
                    this.followPlayerSmoothly(this.timeSchedule, petWorldPos, targetPos, this.followSpeedFast);
                }
                else this.startWanderingAroundPlayer();
            })
            .start();
    }

    startWanderingAroundPlayer() {
        this.isWandering = true;

        const center = this.userTarget.worldPosition.clone();
        const petWorldPos = this.node.getWorldPosition();

        // Tính vector offset từ player tới pet
        let offsetVec = new Vec3();
        Vec3.subtract(offsetVec, petWorldPos, center);
        const offsetDist = offsetVec.length();
        const distance1 = Vec3.distance(center, petWorldPos);
        // console.log("offsetDist: " + offsetDist + " distance1:", distance1);
        // Nếu pet đi quá bán kính, điều chỉnh lại vị trí mục tiêu trong bán kính
        if (offsetDist > this.wanderRadius) {
            offsetVec.normalize();
            offsetVec.multiplyScalar(this.wanderRadius * 0.9);
        } else {
            // Random vị trí lang thang trong bán kính
            const angle = Math.random() * Math.PI * 2;
            const radius = randomRange(this.wanderRadius * 0.3, this.wanderRadius);
            offsetVec = new Vec3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        }

        const targetWorldPos = center.clone().add(offsetVec);
        const localTarget = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
        const distance = Vec3.distance(this.node.worldPosition, localTarget);
        const duration = distance / this.wanderSpeed;
        this.spriteNode.setScale(new Vec3(offsetVec.x < 0 ? -1 : 1, 1, 1));
        this.currentTween = tween(this.node)
            .to(duration, { position: localTarget })
            .call(() => {
                setTimeout(() => this.startWanderingAroundPlayer(), 300 + Math.random() * 500);
            })
            .start();
    }

    stopTween() {
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
        this.isWandering = false;
    }
}


