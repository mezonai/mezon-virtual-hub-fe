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
        instance.emit(Input.EventType.TOUCH_START, event);

        const location = event.getUILocation();
        const touchPos = new Vec3(location.x, location.y);

        if (this.joystickType === JoystickType.FIXED) {
            this._stickPos = this.ring.getPosition();

            const moveVec = touchPos.subtract(this.ring.getPosition());
            const distance = moveVec.length();

            if (this.radius > distance) {
                this.dot.setPosition(moveVec);
            }
        } else if (this.joystickType === JoystickType.FOLLOW) {
            this._stickPos = touchPos;
            this.node.getComponent(UIOpacity)!.opacity = 255;
            this._touchLocation = event.getUILocation();
            this.ring.setPosition(touchPos);
            this.dot.setPosition(new Vec3());
        }
    }

    public _touchMoveEvent(event: EventTouch) {
        if (!this.dot || !this.ring) return;
        if (
            this.joystickType === JoystickType.FOLLOW &&
            this._touchLocation === event.getUILocation()
        ) {
            return false;
        }

        const location = event.getUILocation();
        const touchPos = new Vec3(location.x, location.y);
        // move vector
        const moveVec = touchPos.subtract(this.ring.getPosition());
        const distance = moveVec.length();

        let speedType = SpeedType.NORMAL;
        if (this.radius > distance) {
            this.dot.setPosition(moveVec);
            speedType = SpeedType.NORMAL;
        } else {
            this.dot.setPosition(moveVec.normalize().multiplyScalar(this.radius));
            speedType = SpeedType.FAST;
        }

        instance.emit(Node.EventType.TOUCH_MOVE, event, {
            SpeedType,
            moveVec: moveVec.normalize(),
        });
    }

    public _touchEndEvent(event: EventTouch) {

        if (!this.dot || !this.ring) return;
        this.dot.setPosition(new Vec3());
        if (this.joystickType === JoystickType.FOLLOW) {
            this.node.getComponent(UIOpacity)!.opacity = 0;
        }

        instance.emit(Input.EventType.TOUCH_END, event, {
            speedType: SpeedType.STOP,
        });
    }
}