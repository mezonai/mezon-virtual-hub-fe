import { _decorator, CCFloat, Component, EventKeyboard, Input, input, KeyCode, Vec3, Node, BoxCollider2D, Contact2DType, CCString, tween, PhysicsSystem2D, Vec2, Graphics, RigidBody2D, ERigidBody2DType, find, EventTouch, Collider2D, IPhysics2DContact, ERaycast2DType, Tween } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { AnimationController } from '../AnimationController';
import { instance, Joystick, JoystickDataType, SpeedType } from '../Joystick';
import { Constants } from '../../../utilities/Constants';
import { PlayerInput } from '../input/PlayerInput';
import { Ability } from './Ability';
import { sys } from 'cc';
import { keyboardInstance } from '../input/KeyBoardInput';
import { EVENT_NAME } from '../../../network/APIConstant';
import { UIMobileManager } from '../../Mobile/UIMobileManager';
import { GameManager } from '../../../core/GameManager';

enum InputMethod {
    KEYBOARD,
    JOYSTICK
}

@ccclass('MoveAbility')
export class MoveAbility extends Ability {
    @property({ type: CCFloat }) moveSpeed: number = 100;
    @property({ type: Node }) colliderDetectParent: Node = null;
    @property({ type: Node }) colliderDetect: Node = null;
    @property({ type: [PlayerInput] }) playerInputs: PlayerInput[] = [];

    private lastPressedKey: KeyCode | null = null;
    private lastPosition: Vec3;
    private currentDirection = new Vec3(1, 1, 1);
    private canMove: boolean = true;
    public originMoveSpeed: number = 300;
    private joystickVec: Vec3 = new Vec3();
    //Mobile
    private animNames: string[] = ["kneel", "lie", "happy", "sit"];
    private currentAnimIndex: number = 0;
    protected start(): void {
        this.originMoveSpeed = this.moveSpeed;
    }

    public override async init(sessionId, playerController, room) {
        super.init(sessionId, playerController, room);
        this.lastPosition = this.node.position.clone();
        this.setColliderDetectOffset(1);
        if (this.isMyClient) {
            this.playerInputs.forEach(input => {
                input.init();
            });
            if (sys.isMobile) {
                instance.on(Input.EventType.TOUCH_MOVE, this.onJoystickMove, this);
                instance.on(Input.EventType.TOUCH_END, this.onJoystickEnd, this);
                await Constants.waitUntil(() => UIMobileManager.instance != null);
                UIMobileManager.instance?.node.on(EVENT_NAME.ON_CLICK_BUTTON_CHANGE_ANIM_MOBILE,
                    () => {
                        const animName = this.animNames[this.currentAnimIndex];
                        this.updateAction(animName, true);
                        this.currentAnimIndex++;
                        if (this.currentAnimIndex >= this.animNames.length) {
                            this.currentAnimIndex = 0;
                        }
                    }, this);
            } else {
                keyboardInstance.on(EVENT_NAME.ON_PRESS_KEYBOARD, this.setKeydown, this);
                keyboardInstance.on(EVENT_NAME.ON_RELEASE_KEYBOARD, this.setKeyUp, this);
            }
        }

        this.moveSpeed = this.originMoveSpeed;
        playerController.CanUpdateAnim = true;
    }

    protected onDestroy(): void {
        keyboardInstance.off(EVENT_NAME.ON_PRESS_KEYBOARD, this.setKeydown, this);
        keyboardInstance.off(EVENT_NAME.ON_RELEASE_KEYBOARD, this.setKeyUp, this);
    }

    protected onDisable(): void {
        keyboardInstance.off(EVENT_NAME.ON_PRESS_KEYBOARD, this.setKeydown, this);
        keyboardInstance.off(EVENT_NAME.ON_RELEASE_KEYBOARD, this.setKeyUp, this);
    }

    onJoystickMove(event, data: JoystickDataType) {
        if (!this.isMyClient) return;
        this.joystickVec = data.moveVec.clone();
        if (data.speedType === SpeedType.FAST) {
            this.moveSpeed = this.originMoveSpeed * 1.5;
        } else {
            this.moveSpeed = this.originMoveSpeed;
        }
    }

    onJoystickEnd() {
        if (!this.isMyClient) return;
        this.joystickVec.set(0, 0, 0);
        this.updateAction("idle");
    }

    setKeydown(event: EventKeyboard) {
        this.lastPressedKey = event.keyCode;
        switch (event.keyCode) {
            case KeyCode.KEY_C: this.updateAction("kneel", true); break;
            case KeyCode.KEY_Z: this.updateAction("lie", true); break;
            case KeyCode.KEY_J: this.updateAction("happy"); break;
            case KeyCode.KEY_L: this.updateAction("sit", true); break;
        }
    }

    setKeyUp(event: EventKeyboard) {
        if (event.keyCode == KeyCode.ENTER) return;
        if (this.lastPressedKey === event.keyCode) {
            this.lastPressedKey = null;
            this.updateAction("idle");
        }
    }

    private isCollideWithST() {
        return this.performRaycast();
    }

    performRaycast(): boolean {
        const startPos = this.colliderDetectParent.worldPosition;
        const endPos = this.colliderDetect.worldPosition;
        const results = PhysicsSystem2D.instance.raycast(startPos, endPos, ERaycast2DType.All);
        if (results && results.length > 0) {
            for (let result of results) {
                if ((result.collider.node.layer & Constants.BORDER_LAYER) !== 0) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    public setColliderDetectOffset(level) {
        switch (level) {
            case 1:
                this.colliderDetect.setPosition(new Vec3(15, 0, 0));
                break;
            case 2:
                this.colliderDetect.setPosition(new Vec3(40, 0, 0));
                break;
        }
    }

    protected update(dt: number): void {
        if (!this.canMove) return;

        if (this.joystickVec.lengthSqr() > 0) {
            const value = this.joystickVec.clone();
            const angleDeg = Math.atan2(value.y, value.x) * (180 / Math.PI);
            this.colliderDetectParent.angle = angleDeg;

            if (this.isCollideWithST()) {
                this.updateAction("idle");
                return;
            }

            value.normalize();
            if (value.x > 0) {
                this.currentDirection.x = 1;
            }
            else if (value.x < 0) {
                this.currentDirection.x = -1;
            }
            const move = value.multiplyScalar(this.moveSpeed * dt);
            this.move(this.node.position.add(move));
            return;
        }

        for (const input of this.playerInputs) {
            let value = input.getInput();
            if (value.lengthSqr() > 0) {
                const angleDeg = Math.atan2(value.y, value.x) * (180 / Math.PI);
                this.colliderDetectParent.angle = angleDeg;

                if (this.isCollideWithST()) {
                    this.updateAction("idle");
                    return;
                }

                value.normalize();
                if (value.x > 0) {
                    this.currentDirection.x = 1;
                }
                else if (value.x < 0) {
                    this.currentDirection.x = -1;
                }
                const move = value.clone().multiplyScalar(this.moveSpeed * dt);
                const nextPos = this.node.position.clone().add(move);
                this.move(nextPos);
                break;
            }
        }
    }

    move(targetPosition: Vec3) {
        this.node.setPosition(targetPosition);
        this.animationController.node.scale = this.currentDirection;
        this.lastPosition = targetPosition.clone();
        this.updateAction("move");
    }

    public forceUpdateMyPlayerPosition(newPosition: Vec3) {
        this.node.setWorldPosition(newPosition);
    }

    // public updateAction(actionName = "move", keepAction = false) {
    //     if (this.playerController.CanUpdateAnim) {
    //         this.animationController.play(actionName, keepAction);
    //     }
    //     else {
    //         this.animationController.play("idle", keepAction);
    //     }

    //     const moveData = this.encodeMoveData(
    //         this.lastPosition.x,
    //         this.lastPosition.y,
    //         this.currentDirection.x,
    //         this.animationController.getCurrentAnim
    //     );
    //     this.room.send("move", moveData);

    // }

    public updateAction(actionName = "move", keepAction = false) {
        this.lastPosition.x = Math.round(this.node.position.x);
        this.lastPosition.y = Math.round(this.node.position.y);

        if (this.playerController.CanUpdateAnim) {
            this.animationController.play(actionName, keepAction);
        } else {
            this.animationController.play("idle", keepAction);
        }
        const currentAnim = typeof this.animationController.getCurrentAnim === 'function'
            ? this.animationController.getCurrentAnim
            : this.animationController.getCurrentAnim;

        const moveData = this.encodeMoveData(
            this.lastPosition.x,
            this.lastPosition.y,
            this.currentDirection.x,
            currentAnim
        );
        this.room.send("move", moveData);
    }

    private clampInt16(v: number) {
        if (v > 32767) return 32767;
        if (v < -32768) return -32768;
        return v;
    }

    private encodeMoveData(x: number, y: number, sX: number, anim: string): ArrayBuffer {
        const encoder = new TextEncoder();
        const animBytes = encoder.encode(anim ?? "");
        const xi = this.clampInt16(Math.round(x));
        const yi = this.clampInt16(Math.round(y));
        const buffer = new ArrayBuffer(5 + animBytes.length);
        const view = new DataView(buffer);
        view.setInt16(0, xi, true);
        view.setInt16(2, yi, true);
        const sxByte = sX >= 0 ? 1 : -1;
        view.setInt8(4, sxByte);
        new Uint8Array(buffer, 5).set(animBytes);
        return buffer;
    }

    public updateRemotePosition(data) {
        const { x, y, sX, anim } = data;
        let target = new Vec3(x, y);

        if (this.lastPosition == null) {
            this.lastPosition = target.clone();
        }
        if (target.clone().subtract(this.lastPosition).lengthSqr() > 1000) {
            Tween.stopAllByTarget(this.node);
            tween(this.node)
                .to(0.1, { position: target.clone() })
                .start();
        }
        else {
            this.node.position = target.clone();
        }

        this.lastPosition = target.clone();
        this.currentDirection.x = sX;
        this.animationController.node.setScale(this.currentDirection.x, 1, 1);
        this.animationController.play(anim);
    }

    public InputClose() {
        if (this.isMyClient) {
            for (const input of this.playerInputs) {
                input.setCanAcceptInput(false);
            }
            this.updateAction("idle");
        }
    }


    public InputInit() {
        if (this.isMyClient) {
            for (const input of this.playerInputs) {
                input.setCanAcceptInput(true);
            }
            this.updateAction("idle");
        }
    }

    isMyPlayerCanMove() {
        return this.isMyClient && this.canMove;
    }

    public StopMove() {
        this.InputClose();
        this.canMove = false;
        this.lastPressedKey = null;
        Tween.stopAllByTarget(this.node);
        const rb = this.node.getComponent(RigidBody2D);
        if (rb) {
            rb.sleep();
        }
    }

    public startMove() {
        this.InputInit();
        this.canMove = true;
        const rb = this.node.getComponent(RigidBody2D);
        if (rb) {
            rb.wakeUp();
        }
    }
}