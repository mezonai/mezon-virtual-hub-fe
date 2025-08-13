import { _decorator, RichText, EventTouch, Toggle } from 'cc';
import { AudioType, SoundManager } from '../core/SoundManager';
import { Input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomToggle')
export class CustomToggle extends Toggle {
    @property({type: RichText}) label: RichText = null;

    onLoad() {
        this.node.on('toggle', this.onToggleChanged, this);
        this.node.on(Input.EventType.TOUCH_END, this.onUserClicked, this);
    }

    onEnable(): void {
        super.onEnable();
    }

    onDestroy() {
        this.node.off('toggle', this.onToggleChanged, this);
        this.node.off(Input.EventType.TOUCH_END, this.onUserClicked, this);
        super.onDestroy();
    }

    private onUserClicked() {
        if (SoundManager.instance) {
            SoundManager.instance.playSound(AudioType.Toggle);
        }
    }

    onToggleChanged(toggle: Toggle) {
        if(this.label) this.label.string = toggle.isChecked ? "<color=#34ff77>ON</color>" : "<color=#fe5454>OFF</color>";
    }
}


