import { _decorator, EventKeyboard, Input, input, KeyCode, Vec3, EventTarget } from 'cc';
import { PlayerInput } from './PlayerInput';
import { EVENT_NAME } from '../../../network/APIConstant';
const { ccclass, property } = _decorator;
export const keyboardInstance = new EventTarget();
@ccclass('KeyBoardInput')
export class KeyBoardInput extends PlayerInput {
    private isW = false;
    private isA = false;
    private isS = false;
    private isD = false;
    private isUp = false;
    private isDown = false;
    private isLeft = false;
    private isRight = false;
    public override getInput(): Vec3 {
        this.inputValue.x = (this.isD || this.isRight ? 1 : 0) + (this.isA || this.isLeft ? -1 : 0);
        this.inputValue.y = (this.isW || this.isUp ? 1 : 0) + (this.isS || this.isDown ? -1 : 0);

        return this.inputValue;
    }

    setKeyPress(event: EventKeyboard, active: boolean) {
        if (event.keyCode == KeyCode.KEY_W || event.keyCode == KeyCode.KEY_S || event.keyCode == KeyCode.KEY_A
            || event.keyCode == KeyCode.KEY_D || event.keyCode == KeyCode.ARROW_UP || event.keyCode == KeyCode.ARROW_DOWN
            || event.keyCode == KeyCode.ARROW_LEFT || event.keyCode == KeyCode.ARROW_RIGHT
        ) return;
        if (active) {
            keyboardInstance.emit(EVENT_NAME.ON_PRESS_KEYBOARD, event);
        }
        else {
            keyboardInstance.emit(EVENT_NAME.ON_RELEASE_KEYBOARD, event);
        }
    }
    public override init(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDestroy(): void {
        this.inputValue.z = 0;
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onKeyDown(event: EventKeyboard) {
        if (!this.canAcceptInput) return;

        this.setKeyPress(event, true);
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.isW = true; break;
            case KeyCode.KEY_S: this.isS = true; break;
            case KeyCode.KEY_A: this.isA = true; break;
            case KeyCode.KEY_D: this.isD = true; break;
            case KeyCode.ARROW_UP: this.isUp = true; break;
            case KeyCode.ARROW_DOWN: this.isDown = true; break;
            case KeyCode.ARROW_LEFT: this.isLeft = true; break;
            case KeyCode.ARROW_RIGHT: this.isRight = true; break;

        }
    }

    protected onKeyUp(event: EventKeyboard) {
        if (!this.canAcceptInput) return;
        this.setKeyPress(event, false);
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.isW = false; break;
            case KeyCode.KEY_S: this.isS = false; break;
            case KeyCode.KEY_A: this.isA = false; break;
            case KeyCode.KEY_D: this.isD = false; break;
            case KeyCode.ARROW_UP: this.isUp = false; break;
            case KeyCode.ARROW_DOWN: this.isDown = false; break;
            case KeyCode.ARROW_LEFT: this.isLeft = false; break;
            case KeyCode.ARROW_RIGHT: this.isRight = false; break;
        }
    }

    private resetKeyState(): void {
        this.isW = false;
        this.isA = false;
        this.isS = false;
        this.isD = false;
        this.isUp = false;
        this.isDown = false;
        this.isLeft = false;
        this.isRight = false;
        this.inputValue.set(0, 0, 0);
    }

    public override setCanAcceptInput(value: boolean): void {
        this.canAcceptInput = value;
        if (!value) {
            this.resetKeyState();
        }
    }

    public override getCanAcceptInput(): boolean {
        return this.canAcceptInput;
    }
}