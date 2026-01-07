import { _decorator, EventTarget, Component, Node, Enum, UIOpacity, UITransform, EventTouch, Vec3, Vec2, Size, CCInteger, Input, sys } from "cc";
import { PlayerController } from "./PlayerController";
import { game } from "cc";
import { Game } from "cc";
import { director } from "cc";
import { Director } from "cc";
import { Constants } from "../../utilities/Constants";
import { GameManager } from "../../core/GameManager";
import { UserManager } from "../../core/UserManager";
const { ccclass, property } = _decorator;
export const instance = new EventTarget();
export const SET_JOYSTICK_TYPE = "SET_JOYSTICK_TYPE";
export enum DirectionType {
    FOUR,
    EIGHT,
    ALL,
}
export enum SpeedType {
    STOP,
    NORMAL,
    FAST,
}

export enum JoystickType {
    FIXED,
    FOLLOW,
}
export interface JoystickDataType {
    speedType: SpeedType;
    moveVec: Vec3;
}

@ccclass("Joystick")
export class Joystick extends Component {
    @property({
        type: Node,
        displayName: "Dot",
    })
    dot: Node | null = null;

    @property({
        type: Node,
        displayName: "Ring",
    })
    ring: Node | null = null;

    @property({
        type: Enum(JoystickType),
        displayName: "Touch Type",
    })
    joystickType = JoystickType.FIXED;

    @property({
        type: Enum(DirectionType),
        displayName: "Direction Type",
    })
    directionType = DirectionType.ALL;

    _stickPos = new Vec3();
    _touchLocation = new Vec2();
    @property({ displayName: "Auto hide on PC" })
    autoHideOnPC = true;

    @property({
        type: CCInteger,
        displayName: "Ring Radius",
    })
    radius = 15;

    onLoad() {
        if (!this.dot || !this.ring) {
            return;
        }

        this._initTouchEvent();
        const uiOpacity = this.node.getComponent(UIOpacity);
        if (this.joystickType === JoystickType.FOLLOW && uiOpacity) {
            uiOpacity.opacity = 0;
        }
        this.setJoystickEnabled(sys.isMobile || !this.autoHideOnPC);
        game.on(Game.EVENT_SHOW, this._onAppResume, this);
        game.on(Game.EVENT_HIDE, this._onAppPause, this);
    }

    public setJoystickEnabled(enable: boolean) {
        this.node.active = enable;

        if (enable) {
            this._initTouchEvent();
        } else {
            this._removeTouchEvent();
            if (this.dot) this.dot.setPosition(new Vec3());
            if (this.joystickType === JoystickType.FOLLOW) {
                const uiOpacity = this.node.getComponent(UIOpacity);
                if (uiOpacity) uiOpacity.opacity = 0;
            }
            instance.emit(Input.EventType.TOUCH_END, null, { speedType: SpeedType.STOP, moveVec: new Vec3() });
        }
    }
    onEnable() {
        instance.on(SET_JOYSTICK_TYPE, this._onSetJoystickType, this);
    }

    onDisable() {
        instance.off(SET_JOYSTICK_TYPE, this._onSetJoystickType, this);
    }

    private _onAppResume() {
        this._initTouchEvent();
        GameManager.instance.uiChat.editBox.focus();
    }

    private _onAppPause() {
        this._removeTouchEvent();
    }

    _onSetJoystickType(type: JoystickType) {
        this.joystickType = type;
        const uiOpacity = this.node.getComponent(UIOpacity);
        if (uiOpacity) {
            uiOpacity.opacity = type === JoystickType.FIXED ? 255 : 0;
        }
    }

    _initTouchEvent() {
        // set the size of joystick node to control scale
        this.node.on(Input.EventType.TOUCH_START, this._touchStartEvent, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this._touchMoveEvent, this);
        this.node.on(Input.EventType.TOUCH_END, this._touchEndEvent, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this._touchEndEvent, this);
    }

    private _removeTouchEvent() {
        this.node.off(Input.EventType.TOUCH_START, this._touchStartEvent, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this._touchMoveEvent, this);
        this.node.off(Input.EventType.TOUCH_END, this._touchEndEvent, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this._touchEndEvent, this);
    }

    public _touchStartEvent(event: EventTouch) {
        if (!this.ring || !this.dot) return;

        const touchPos = this.uiToLocal(event, this.node);
        if (this.joystickType === JoystickType.FIXED) {
            this._stickPos.set(this.ring.position);

            const moveVec = touchPos.clone().subtract(this.ring.position);
            if (moveVec.length() <= this.radius) {
                this.dot.setPosition(moveVec);
            }
        } else {
            this._stickPos.set(touchPos);
            this._touchLocation.set(event.getUILocation().x, event.getUILocation().y);
            this.node.getComponent(UIOpacity)!.opacity = 255;
            this.ring.setPosition(touchPos);
            this.dot.setPosition(Vec3.ZERO);
        }
    }


    public _touchMoveEvent(event: EventTouch) {
        if (!this.dot || !this.ring) return;
        const touchPos = this.uiToLocal(event, this.node);
        const moveVec = touchPos.clone().subtract(this.ring.position);
        const distance = moveVec.length();
        let speedType = SpeedType.NORMAL;
        let finalVec = new Vec3();
        if (distance <= this.radius) {
            finalVec.set(moveVec);
        } else {
            finalVec.set(moveVec.normalize().multiplyScalar(this.radius));
            speedType = SpeedType.FAST;
        }
        this.dot.setPosition(finalVec);
        instance.emit(Input.EventType.TOUCH_MOVE, event, {
            speedType,
            moveVec: finalVec.clone().normalize(),
        });
    }

    public _touchEndEvent(event: EventTouch) {
        if (!this.dot) return;
        this.dot.setPosition(Vec3.ZERO);
        if (this.joystickType === JoystickType.FOLLOW) {
            this.node.getComponent(UIOpacity)!.opacity = 0;
        }
        instance.emit(Input.EventType.TOUCH_END, event, {
            speedType: SpeedType.STOP,
            moveVec: Vec3.ZERO,
        });
    }

    private uiToLocal(event: EventTouch, target: Node): Vec3 {
        const uiPos = event.getUILocation();
        const uiTransform = target.getComponent(UITransform)!;
        return uiTransform.convertToNodeSpaceAR(
            new Vec3(uiPos.x, uiPos.y, 0)
        );
    }

}