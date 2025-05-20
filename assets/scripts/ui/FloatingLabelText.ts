import { _decorator, Color, Label } from 'cc';
import { BaseFloatingText } from './BaseFloatingText';
import { RewardType } from '../Model/Item';

const { ccclass, property } = _decorator;

@ccclass('FloatingLabelText')
export class FloatingLabelText extends BaseFloatingText {
    @property(Label)
    rewardLabel: Label = null;

    public setText(text: string, isNumberText: boolean, type: RewardType, color: Color): void {
        this.rewardLabel.string = text;

        if (isNumberText && color) {
            this.rewardLabel.color = color;
        }
        this.setIcon(isNumberText, type);
    }
}
