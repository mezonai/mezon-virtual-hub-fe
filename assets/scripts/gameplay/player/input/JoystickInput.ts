import { _decorator, Component, EventTouch, find, Input, Node, Vec3 } from 'cc';
import { instance, Joystick, JoystickDataType, SpeedType } from '../Joystick';
const { ccclass, property } = _decorator;

@ccclass('JoystickInput')
export class JoystickInput extends Component {
    @property({ type: Joystick }) joystick: Joystick;
    private moveDirection;
    getJoystick() {
        this.joystick = find("Canvas/Joystick").getComponent(Joystick);
        instance.on(Input.EventType.TOUCH_START, this.onJoystickTouchStart, this);
        instance.on(Input.EventType.TOUCH_MOVE, this.onJoystickTouchMove, this);
        instance.on(Input.EventType.TOUCH_END, this.onJoystickTouchEnd, this);
        if (this.joystick) {
            this.joystick.node.active = true;
            this.joystick.node.setParent(this.node);
            this.joystick.node.setPosition(new Vec3(-560, -520));
        } else {
            this.joystick.node.active = false;
            this.joystick.node.setParent(this.node);
            this.joystick.node.setPosition(new Vec3(-560, -520));
        }
    }

    //region JOYSTICK
    onJoystickTouchStart() { }
    onJoystickTouchMove(event: EventTouch, data: JoystickDataType) {
        this.moveDirection = data.moveVec;
    }

    onJoystickTouchEnd(event: EventTouch, data: JoystickDataType) {
        // this.updateAction("idle");
    }
}


