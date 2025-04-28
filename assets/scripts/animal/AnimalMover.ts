import { _decorator, Component, Vec3, Node, Collider, IPhysics2DContact, BoxCollider, Sprite, randomRange, tween, Tween } from 'cc';
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

    private _direction: Vec3 = new Vec3();
    private _timer = 0;
    private _changeInterval = 1;
    private originChangeInterval = 1;
    moveAreaMin: Vec3 = new Vec3();
    moveAreaMax: Vec3 = new Vec3();
    private animalMoveTye: AnimalMoveType;
    private targetNode: Node;
    private collider: Collider | null = null;
    private currentTween: Tween<Node> = null;
    private lastTargetPos: Vec3 = new Vec3();
    private ratioSpeed : number = 0.8;
    public SetAnimalAction(moveType: AnimalMoveType, target: Node) {
        this.animalMoveTye = moveType;
        this.targetNode = target;
        if (moveType == AnimalMoveType.RandomMove || target == null) {
            this.originChangeInterval = this._changeInterval;
            this.collider = this.node.getComponent(Collider);
            if (this.collider) {
                this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
            }
            this.setRandomDirection();
        }
        else {
            this.lastTargetPos = this.targetNode.getPosition();
        }

    }

    update(dt: number) {
        if (this.animalMoveTye == AnimalMoveType.FollowTarget && this.targetNode != null) {
            this.checkTargetMove();
            return;
        }
        this._timer += dt;
        if (this._timer >= this._changeInterval) {
            this.setRandomDirection();
            this._timer = 0;
        }

        let pos = this.node.getPosition().clone();

        pos.x += this._direction.x * this.speed * dt;
        pos.y += this._direction.y * this.speed * dt;

        pos.x = Math.max(this.moveAreaMin.x, Math.min(this.moveAreaMax.x, pos.x));
        pos.y = Math.max(this.moveAreaMin.y, Math.min(this.moveAreaMax.y, pos.y));

        this.node.setPosition(pos);

        // Flip sprite based on direction
        if (this._direction.x < 0) {
            this.spriteNode.setScale(new Vec3(-1, 1, 1));
        } else {
            this.spriteNode.setScale(new Vec3(1, 1, 1));
        }
    }

    // Handle collision by checking the collider's name and changing direction if needed
    onCollisionEnter(contact: IPhysics2DContact) {
        const colliderA = contact.colliderA;
        const colliderB = contact.colliderB;

        const otherNode = colliderA.node === this.node ? colliderB.node : colliderA.node;

        const isOtherAnimal = otherNode.getComponent(AnimalMover) !== null;

        if (isOtherAnimal) {
            // Không làm gì khi va chạm với một con vật khác
            return;
        }

        // Nếu va chạm với player
        if (colliderA.node.name.includes("Player") || colliderB.node.name.includes("Player")) {
            this.node.setPosition(this.node.position.x, this.node.position.y, 10);
        } else {
            this.node.setPosition(this.node.position.x, this.node.position.y, 0);
        }

        // Nếu là va chạm với collider như tường thì đổi hướng
        if (colliderA.node.name.includes("collider") || colliderB.node.name.includes("collider")) {
            this.setRandomDirection();
        }
    }


    // Function to set a random direction from a set of allowed angles
    setRandomDirection() {
        this._changeInterval = randomRange(this.originChangeInterval + 1, this.originChangeInterval - 1);
        const allowedAngles = [ // allowed angles
            0,   // right
            45,  // top-right diagonal
            -45, // bottom-right diagonal
            180, // left
            135, // top-left diagonal
            -135 // bottom-left diagonal
        ];

        const angle = allowedAngles[Math.floor(Math.random() * allowedAngles.length)];
        const rad = angle * Math.PI / 180;

        this._direction.x = Math.cos(rad);
        this._direction.y = Math.sin(rad);
    }

    checkTargetMove() {
        const currentTargetPos = this.targetNode.getPosition();
        if (!currentTargetPos.equals(this.lastTargetPos)) {
            if (this.currentTween != null) {
                this.currentTween.stop();
            }
            this.moveToTargetFast(currentTargetPos);          
        }
        this.lastTargetPos = currentTargetPos; 
    }

    moveToTargetFast(targetPos : Vec3) {
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
                    this.moveAroundTargetWithTween();
                })
                .start();
                
            })
            .start();            
    }

    moveAroundTargetWithTween(distanceToMove: number = 100, maxDistanceToTarget: number = 200) {
        const currentPos = this.node.getPosition();
        const targetPos = this.targetNode.getPosition();

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
                    this.moveAroundTargetWithTween(distanceToMove, maxDistanceToTarget);
                }, 300 + Math.random() * 500);
            })
            .start();
    }
}
