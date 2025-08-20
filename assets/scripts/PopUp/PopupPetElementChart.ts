import { _decorator, Label, Button, Toggle, Sprite, Color } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupPetElementChart')
export class PopupPetElementChart extends BasePopup {
    @property([Toggle]) elementButtons: Toggle[] = [];
    @property(Button) closeButton: Button;
    @property([Label]) attackLabels: Label[] = [];
    @property([Sprite]) attackSprites: Sprite[] = [];
    @property([Label]) defenseLabels: Label[] = [];
    @property([Sprite]) defenseSprites: Sprite[] = [];

    private readonly damageMatrix: number[][] = [
        [1, 1,   1,   1,   1,   1,   1],
        [1, 0.5, 2,   0.5, 1,   2,   0.5],
        [1, 0.5, 0.5, 0.5, 1,   2,   2],
        [1, 2,   1,   0.5, 1,   0.5, 0.5],
        [1, 1,   1,   2,   0.5, 0.5, 0.5],
        [1, 0.5, 1,   2,   1,   0.5, 0.5],
        [1, 1,   1,   1,   1,   1,   2],
    ];

    private readonly colorMap: Record<number, Color> = {
        2: new Color(201, 0, 0),
        0.5: new Color(140, 219, 110),
        1: Color.WHITE,
    };

    public init(param?: any): void {
        this.elementButtons.forEach((toggle, index) => {
            toggle.node.on(Toggle.EventType.TOGGLE, () => {
                if (toggle.isChecked) this.showDamageFor(index);
            });
        });

        this.closeButton.addAsyncListener(async () => {
            PopupManager.getInstance().closePopup(this.node.uuid);
        });

        if (this.elementButtons.length > 0) {
            this.elementButtons[0].isChecked = true;
            this.showDamageFor(0);
        }
    }

    private showDamageFor(attackerIndex: number) {
        this.damageMatrix.forEach((_, i) => {
            this.updateDamageUI(this.attackLabels[i], this.attackSprites[i], this.damageMatrix[attackerIndex][i]);
            this.updateDamageUI(this.defenseLabels[i], this.defenseSprites[i], this.damageMatrix[i][attackerIndex]);
        });
    }

    private updateDamageUI(label: Label, sprite: Sprite, value: number) {
        if (label) label.string = this.formatDamage(value);
        if (sprite) sprite.color = this.colorMap[value] ?? Color.WHITE;
    }

    private formatDamage(value: number): string {
        return value === 0.5 ? "1/2" : value.toString();
    }
}