import { _decorator, CCFloat, Component, EventKeyboard, Input, input, KeyCode, Vec3, Node, BoxCollider2D, Contact2DType, CCString, tween, PhysicsSystem2D, Vec2, Graphics, RigidBody2D, ERigidBody2DType, find, EventTouch } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { AnimationController } from '../AnimationController';
import { instance, Joystick, JoystickDataType, SpeedType } from '../Joystick';

enum InputMethod {
    KEYBOARD,
    JOYSTICK
}

@ccclass('MoveAbility')
export class MoveAbility extends Component {
    @property({ type: CCFloat }) normalSpeed: number = 100;
    @property({ type: CCFloat }) moveSpeed: number = 100;
    @property({ type: AnimationController }) animationController: AnimationController = null;
    isMoving: boolean = false;
    lastPressedKey: KeyCode | null = null;
    lastPosition: Vec3;
    isColliding: boolean;

    private moveDirection: Vec3 = new Vec3(0, 1, 0);

    private inputMethod: InputMethod | null = null;
    private _speedType: SpeedType = SpeedType.STOP;
    private _moveSpeed = 0;
    private stopSpeed = 0;
    private fastSpeed = 200;
    private rigidbody = false;
    private currentDirection = new Vec3(1, 1, 1);
    private _body: RigidBody2D | null = null;

    @property({ type: Joystick }) joystick: Joystick;

    private room: Colyseus.Room<any>;
    @property({ type: CCString }) myID: string = "";

    private get isMyClient() {
        if (this.room == null || this.myID == "")
            return false;

        return this.room.sessionId == this.myID
    }

    public init(sessionId, room) {
        this.room = room;
        this.myID = sessionId;
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.lastPosition = this.node.getPosition();

        if (this.isMyClient) {
            this.getJoystick();
        }
    }

    getJoystick() {
        if (this.isMyClient) {
            this.joystick = find("Canvas/Joystick").getComponent(Joystick);
            instance.on(Input.EventType.TOUCH_START, this.onJoystickTouchStart, this);
            instance.on(Input.EventType.TOUCH_MOVE, this.onJoystickTouchMove, this);
            instance.on(Input.EventType.TOUCH_END, this.onJoystickTouchEnd, this);
            if (this.joystick) {
                this.joystick.node.active = true;
            } else {
                this.joystick.node.active = false;
            }
        }
    }

    //region JOYSTICK
    onJoystickTouchStart() { }
    onJoystickTouchMove(event: EventTouch, data: JoystickDataType) {
        this._speedType = data.speedType;
        this.moveDirection = data.moveVec;
        this.onSetMoveSpeed(this._speedType);
    }

    onJoystickTouchEnd(event: EventTouch, data: JoystickDataType) {
        this._speedType = data.speedType;
        this.onSetMoveSpeed(this._speedType);
        this.updateAction("idle");
    }

    onSetMoveSpeed(speedType: SpeedType) {
        switch (speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = this.normalSpeed;
                break;
            case SpeedType.FAST:
                this._moveSpeed = this.fastSpeed;
                break;
            default:
                break;
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (!this.isMyClient) return;
        this.lastPressedKey = event.keyCode;
        this.isMoving = true;

        switch (event.keyCode) {
            case KeyCode.KEY_C: this.updateAction("kneel", true); break;
            case KeyCode.KEY_Z: this.updateAction("lie", true); break;
            case KeyCode.KEY_J: this.updateAction("happy"); break;
            case KeyCode.KEY_L: this.updateAction("sit", true); break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (!this.isMyClient) return;

        if (this.lastPressedKey === event.keyCode) {
            this.lastPressedKey = null;
            this.isMoving = false;
            this.updateAction("idle");
        }
        this.checkCollisionWithRay();
    }

    checkCollisionWithRay(): boolean {
        this.isColliding = false;

        let start = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
        let end = new Vec2(start.x + 100, start.y);

        let results = PhysicsSystem2D.instance.raycast(start, end);

        for (let result of results) {
            let hitNode: Node = result.collider.node;

            if (hitNode.name === "Player" && hitNode !== this.node) {
                this.isColliding = true;
                this.SetCanMoveInMyMap(hitNode);
                return true;
            }
        }

        return false;
    }

    SetCanMoveInMyMap(hitNode: Node): void {
        if (this.isMyClient)
            hitNode.getComponent(RigidBody2D).type = ERigidBody2DType.Kinematic;
        else
            this.node.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
    }

    protected update(dt: number): void {
        if (this._speedType !== SpeedType.STOP) {
            this.move();
        }

        let moveStep = this.normalSpeed * dt;
        let newPosition = this.node.getPosition();

        if (this.inputMethod === InputMethod.JOYSTICK) {
            // Di chuyển theo joystick
            newPosition.x += this.moveDirection.x * moveStep;
            newPosition.y += this.moveDirection.y * moveStep;
        } else if (this.isMoving && this.lastPressedKey !== null) {
            let moveStep = this.normalSpeed * dt;
            let newPosition = this.node.getPosition();

            switch (this.lastPressedKey) {
                case KeyCode.ARROW_LEFT:
                case KeyCode.KEY_A:
                    newPosition.x -= moveStep;
                    this.currentDirection.x = -1;
                    break;
                case KeyCode.ARROW_RIGHT:
                case KeyCode.KEY_D:
                    newPosition.x += moveStep;
                    this.currentDirection.x = 1;
                    break;
                case KeyCode.ARROW_UP:
                case KeyCode.KEY_W:
                    newPosition.y += moveStep;
                    break;
                case KeyCode.ARROW_DOWN:
                case KeyCode.KEY_S:
                    newPosition.y -= moveStep;
                    break;
            }

            if (!this.lastPosition.equals(newPosition, 0.1)) {
                this.node.setPosition(newPosition);
                this.animationController.node.scale = this.currentDirection;
                this.updateAction("move");
                this.lastPosition = newPosition;
            }
        }
    }

    move() {
        if (this.rigidbody && this._body) {
            const moveVec = this.moveDirection.clone().multiplyScalar(this._moveSpeed / 20);
            const force = new Vec2(moveVec.x, moveVec.y);
            this._body.applyForceToCenter(force, true);
        } else {
            const oldPos = this.node.getPosition();
            const newPos = oldPos.add(
                this.moveDirection.clone().multiplyScalar(this._moveSpeed / 60)
            );
            this.node.setPosition(newPos);
        }

        this.currentDirection.x = this.moveDirection.x > 0  ? 1 : -1;
        let newPosition = this.node.getPosition();
        if (!this.lastPosition.equals(newPosition, 0.1)) {
            this.node.setPosition(newPosition);
            this.animationController.node.scale = this.currentDirection;
            this.updateAction("move");
            this.lastPosition = newPosition;
        }
    }

    private updateAction(actionName, keepAction = false) {
        this.animationController.play(actionName, keepAction);
        this.room.send("move", { x: this.lastPosition.x, y: this.lastPosition.y, sX: this.currentDirection.x, anim: this.animationController.getCurrentAnim })
    }

    public updateRemotePosition(data) {
        const { x, y, sX, anim } = data;
        this.node.position = new Vec3(x, y);
        this.currentDirection.x = sX;
        this.animationController.node.scale = this.currentDirection;
        this.animationController.play(anim);
    }
}