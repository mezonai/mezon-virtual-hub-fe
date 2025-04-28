import { _decorator, RichText, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomToggle')
export class CustomToggle extends Toggle {
    @property({type: RichText}) label: RichText = null;

    onLoad() {
        this.node.on('toggle', this.onToggleChanged, this);
    }

    onEnable(): void {
        super.onEnable();
        this.onToggleChanged(this);
    }

    onDestroy() {
        this.node.off('toggle', this.onToggleChanged, this);
        super.onDestroy();
    }

    onToggleChanged(toggle: Toggle) {
        if(this.label) this.label.string = toggle.isChecked ? "<color=#34ff77>ON</color>" : "<color=#fe5454>OFF</color>";
    }
}


