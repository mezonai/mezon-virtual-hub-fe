import { _decorator, Component, Label, Sprite, tween, Vec3, Color, UITransform, RichText, SpriteFrame } from 'cc';
import { RewardType } from '../Model/Item';
import { BaseFloatingText } from '../ui/BaseFloatingText';
const { ccclass, property } = _decorator;

@ccclass('RewardFloatingText')
export class RewardFloatingText extends BaseFloatingText {
   
    @property(RichText)
    rewardRichText: RichText = null;

    @property(Sprite)
    coinIcon: Sprite = null;

    @property(SpriteFrame)
    coinSpriteFrame: SpriteFrame = null;

    @property(SpriteFrame)
    diamondSpriteFrame: SpriteFrame = null;

    public setText(text: string, isNumberText: boolean, type: RewardType): void {
        let formattedText = text;
        const match = text.match(/([+-]\d[\d,.]*)/);
        if (match) {
            const value = match[1];
            const color = value.startsWith('+') ? '#FFEE35' : '#FF0000';
            formattedText = text.replace(value, `<color=${color}>${value}</color>`);
        }
        this.rewardRichText.string = formattedText;
        this.setIcon(isNumberText, type);
        this.node.setPosition(0, 0, 0);
        this.node.setScale(0, 0, 0);
    }

    public showReward(text: string, isCoin: boolean, type: RewardType) {
        this.setText(text, isCoin, type);
        tween(this.node)
            .to(0.15, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'backOut' })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
            .to(1, { position: new Vec3(0, 40, 0) }, { easing: 'sineOut' })
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'sineIn' })
            .call(() => this.node.destroy())
            .start();
    }
    
}
