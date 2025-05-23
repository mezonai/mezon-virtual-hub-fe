import { _decorator, Component, Node, randomRange, tween, Tween, UITransform, v2, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowTargetUser')
export class FollowTargetUser extends Component {    
    @property followSpeedFast: number = 150;
    @property maxSpeed: number = 100;
    @property minSpeed: number = 40;
    private spriteNode: Node = null!;
    private userTarget: Node;
    private currentTween: Tween<Node> = null;
    private isWandering = false;
    private lastPlayerPos: Vec3 = new Vec3();
    private stopDistance = 30;
    private wanderRadius = 80;
    private timeSchedule = 0.5;
    private parent: Node = null;
    
    public playFollowTarget(target: Node, spriteNode: Node, parentPetFollowUser: Node) {
        this.userTarget = target;
        this.spriteNode = spriteNode;
        this.parent = parentPetFollowUser;
        if (this.userTarget == null) return;
        this.schedule(this.updateFollowLogic, this.timeSchedule);
    }
    onDisable() {
        this.unschedule(this.updateFollowLogic);
    }
    updateFollowLogic() {
        const playerWorldPos = this.userTarget.worldPosition;
        const nodeWorldPos = this.node.getWorldPosition();
        const distance = Vec3.distance(nodeWorldPos, playerWorldPos);
        const playerMoved = !playerWorldPos.equals(this.lastPlayerPos);

        // Ban đầu pet tự do lang thang nếu chưa bắt đầu
        if (!this.isWandering && !this.currentTween) {
            this.startWanderingAroundPlayer();
            return;
        }
        if (distance > this.wanderRadius) {
            this.followPlayerSmoothly(this.timeSchedule, this.followSpeedFast, playerMoved);
        }

        this.lastPlayerPos = playerWorldPos.clone();
    }

    followPlayerSmoothly(dt: number, speed: number, isMoved: boolean) {
        this.stopTween();
        const direction = new Vec3();
        const currentPos = this.node.getWorldPosition();
        const targetPos = this.userTarget.worldPosition;
        Vec3.subtract(direction, targetPos, currentPos);
        let distance = direction.length();
        if (distance < this.stopDistance) {
            if (!this.isWandering) {
                this.startWanderingAroundPlayer();
            }
            return;
        }
        distance -= this.stopDistance;
        // Tính tốc độ giảm dần khi gần player
        const approachFactor = Math.min(1, distance / 40);
        const adjustedSpeed = speed * approachFactor;
        direction.normalize();
        const moveStep = direction.multiplyScalar(adjustedSpeed * dt);
        const newWorldPos = currentPos.clone().add(moveStep);
        const localPos = this.getTargetLocalPos(newWorldPos);
        // Cập nhật hướng lật pet
        this.spriteNode.setScale(new Vec3(direction.x < 0 ? -1 : 1, 1, 1));
        this.currentTween = tween(this.node)
            .to(dt, { position: localPos }, { easing: 'linear' })
            .call(() => {
                // Khi đến gần player thì tự động bắt đầu lang thang
                if (isMoved) this.followPlayerSmoothly(this.timeSchedule, this.followSpeedFast, isMoved);
                else setTimeout(() => this.followPlayerSmoothly(this.timeSchedule, this.followSpeedFast, isMoved), 300 + Math.random() * 500);

            })
            .start();
    }

    startWanderingAroundPlayer() {
        this.isWandering = true;
        const userWorldPos = this.userTarget.worldPosition.clone();
        const petWorldPos = this.node.getWorldPosition();
        let offsetVec = new Vec3();
        Vec3.subtract(offsetVec, petWorldPos, userWorldPos);
        const offsetDist = offsetVec.length();
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

        const targetWorldPos = userWorldPos.clone().add(offsetVec);
        const localTarget = this.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
        const distance = Vec3.distance(this.node.position, localTarget);
        const speed = randomRange(this.minSpeed, this.maxSpeed);
        const duration = distance / speed;
        const direction = new Vec2(targetWorldPos.x - petWorldPos.x, targetWorldPos.y - petWorldPos.y);
        this.spriteNode.scale = new Vec3(direction.x > 0 ? 1 : -1, 1); 
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

    getTargetLocalPos(positionWorld: Vec3): Vec3 {
        return this.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(positionWorld);
    }
    
}


