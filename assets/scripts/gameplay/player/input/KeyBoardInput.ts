import { _decorator, EventKeyboard, Input, input, KeyCode, Vec3 } from 'cc';
import { PlayerInput } from './PlayerInput';
const { ccclass, property } = _decorator;

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

    public override getInput(): Vec3{
        this.inputValue.x = (this.isD || this.isRight ? 1 : 0) + (this.isA || this.isLeft ? -1 : 0);
        this.inputValue.y = (this.isW || this.isUp ? 1 : 0) + (this.isS || this.isDown ? -1 : 0);

        return this.inputValue;
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
}