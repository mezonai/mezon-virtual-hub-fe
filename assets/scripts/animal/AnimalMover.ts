import { _decorator, Component, Vec3, Node, Collider, IPhysics2DContact, BoxCollider, Sprite, randomRange, tween, Tween, CCBoolean, Vec2 } from 'cc';
import { RandomlyMover } from '../utilities/RandomlyMover';
const { ccclass, property } = _decorator;
export enum AnimalMoveType {
    RandomMove = 1,
    FollowTarget = 2,
}
@ccclass('AnimalMover')
export class AnimalMover extends Component {
    @property
    speed: number = 50;
    @property(Node)
    spriteNode: Node = null!;
    @property({ type: RandomlyMover }) randomlyMover: RandomlyMover = null;

    private animalMoveTye: AnimalMoveType;
    private ownedTargetNode: Node;
    private currentTween: Tween<Node> = null;
    private lastTargetPos: Vec3 = new Vec3();
    private ratioSpeed : number = 0.8;

    update(dt: number){
        if (this.animalMoveTye == AnimalMoveType.FollowTarget && this.ownedTargetNode != null) {
            this.checkOwnedMove();
            return;
        }
    }
    
    public setRandomMove(newArea: Vec2){
        this.animalMoveTye = AnimalMoveType.RandomMove;
        this.randomlyMover.areaSize = newArea;
        this.randomlyMover.move();
    }

    //#region Move follow Owned
    public setFollowOwnedUser(target: Node){
        this.ownedTargetNode = target;
        this.animalMoveTye = AnimalMoveType.FollowTarget;
        this.lastTargetPos = this.ownedTargetNode.getPosition();
    }
    checkOwnedMove() {
        const currentOwnedPos = this.ownedTargetNode.getPosition();
        if (!currentOwnedPos.equals(this.lastTargetPos)) {
            if (this.currentTween != null) {
                this.currentTween.stop();
            }
            this.moveToOwnedFast(currentOwnedPos);          
        }
        this.lastTargetPos = currentOwnedPos; 
    }

    moveToOwnedFast(targetPos : Vec3) {
        const currentPos = this.node.getPosition()

        const directionToTarget = new Vec3();
        Vec3.subtract(directionToTarget, targetPos, currentPos);
        directionToTarget.normalize();
        const distance = Vec3.distance(currentPos, targetPos);
        const moveVec = directionToTarget.multiplyScalar(distance); // Di chuyển nhanh
        const newPos = new Vec3();
        Vec3.add(newPos, currentPos, moveVec);
        const speedFactor = 1.5 + Math.floor(distance / 100) * this.ratioSpeed;
        const duration = distance / (this.speed * speedFactor);
        this.spriteNode.setScale(new Vec3(directionToTarget.x < 0 ? -1 : 1, 1, 1));

        this.currentTween = tween(this.node)
            .to(duration, { position: newPos }, { easing: 'smooth' })
            .call(() => {
                this.currentTween = tween(this.node)
                .delay(0.5)
                .call(() => {
                    this.moveAroundOwnedWithTween();
                })
                .start();
                
            })
            .start();            
    }

    moveAroundOwnedWithTween(distanceToMove: number = 100, maxDistanceToTarget: number = 200) {
        const currentPos = this.node.getPosition();
        const targetPos = this.ownedTargetNode.getPosition();

        const distanceToTarget = Vec3.distance(currentPos, targetPos);

        if (distanceToTarget > maxDistanceToTarget) {
            const directionToTarget = new Vec3();
            Vec3.subtract(directionToTarget, targetPos, currentPos);
            directionToTarget.normalize();
            const newPos = new Vec3();
            Vec3.add(newPos, currentPos, directionToTarget.multiplyScalar(distanceToMove));

            const duration = Vec3.distance(currentPos, newPos) / this.speed;
            this.spriteNode.setScale(new Vec3(directionToTarget.x < 0 ? -1 : 1, 1, 1));
            this.moveToPositionThenContinue(newPos, duration, distanceToMove, maxDistanceToTarget);
            return;
        }
        const allowedAngles = [0, 45, -45, 180, 135, -135];
        const angle = allowedAngles[Math.floor(Math.random() * allowedAngles.length)];
        const rad = angle * Math.PI / 180;
        const direction = new Vec3(Math.cos(rad), Math.sin(rad), 0);
        const newPos = new Vec3();
        Vec3.add(newPos, currentPos, direction.multiplyScalar(distanceToMove));

        const duration = Vec3.distance(currentPos, newPos) / this.speed;
        this.spriteNode.setScale(new Vec3(direction.x < 0 ? -1 : 1, 1, 1));
        this.moveToPositionThenContinue(newPos, duration, distanceToMove, maxDistanceToTarget);
    }
    moveToPositionThenContinue(newPos: Vec3, duration: number, distanceToMove: number, maxDistanceToTarget: number) {
        if (this.currentTween) {
            this.currentTween.stop();
        }
    
        this.currentTween = tween(this.node)
            .to(duration, { position: newPos }, { easing: 'smooth' })
            .call(() => {
                setTimeout(() => {
                    this.moveAroundOwnedWithTween(distanceToMove, maxDistanceToTarget);
                }, 300 + Math.random() * 500);
            })
            .start();
    }
}
