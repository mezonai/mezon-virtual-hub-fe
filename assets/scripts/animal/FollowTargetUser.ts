import { _decorator, Component, Node, randomRange, tween, Tween, UITransform, v2, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowTargetUser')
export class FollowTargetUser extends Component {       
    private spriteNode: Node = null!;
    private userTarget: Node;
    private currentTween: Tween<Node> = null;
    private isWandering = false;
    private lastPlayerPos: Vec3 = new Vec3();
    private stopDistance = 25;
    private wanderRadius = 35;
    private timeSchedule = 0.5;
    private parent: Node = null;
    maxSpeed: number = 0;
    minSpeed: number = 0;
    

    public playFollowTarget(target: Node, spriteNode: Node, parentPetFollowUser: Node, maxSpeed : number, minSpeed: number) {
        this.userTarget = target;
        this.spriteNode = spriteNode;
        this.parent = parentPetFollowUser;
        this.maxSpeed = maxSpeed;
        this.minSpeed = minSpeed;
        if (this.userTarget == null) return;
        this.schedule(this.updateFollowLogic, this.timeSchedule);
    }

    public stopMove(){
        this.stopTween();
        this.unschedule(this.updateFollowLogic);
    }

    updateFollowLogic() {
       if(this.userTarget == null) return;
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
            this.followPlayerSmoothly(this.timeSchedule, randomRange(60, this.maxSpeed), playerMoved);
        }

        this.lastPlayerPos = playerWorldPos.clone();
    }

    followPlayerSmoothly(dt: number, speed: number, isMoved: boolean) {
        if(this.userTarget == null) return;
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
                if (isMoved) this.followPlayerSmoothly(this.timeSchedule, this.randomSpeed(), isMoved);
                else setTimeout(() => this.followPlayerSmoothly(this.timeSchedule, this.randomSpeed(), isMoved), 300 + Math.random() * 500);

            })
            .start();
    }

    startWanderingAroundPlayer() {        
        const userWorldPos = this.userTarget?.worldPosition?.clone?.();
        if(!userWorldPos) return;
        const petWorldPos = this.node.getWorldPosition();
        this.isWandering = true;
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
        Tween.stopAllByTarget(this.node);
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
        this.isWandering = false;
    }

    getTargetLocalPos(positionWorld: Vec3): Vec3 {
        return this.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(positionWorld);
    }
    
    randomSpeed(): number{
        return randomRange(this.minSpeed, this.maxSpeed)
    }

}


