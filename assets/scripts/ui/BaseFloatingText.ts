import { _decorator, Component, Sprite, SpriteFrame, Vec3, tween, Color } from 'cc';
import { RewardType } from '../Model/Item';

const { ccclass, property } = _decorator;

@ccclass('BaseFloatingText')
export abstract class BaseFloatingText extends Component {
    @property(Sprite)
    coinIcon: Sprite = null;

    @property(SpriteFrame)
    coinSpriteFrame: SpriteFrame = null;

    @property(SpriteFrame)
    diamondSpriteFrame: SpriteFrame = null;

    protected setIcon(show: boolean, type: RewardType) {
        if (!this.coinIcon) return;
        this.coinIcon.node.active = show;
        this.coinIcon.spriteFrame = type === RewardType.GOLD ? this.coinSpriteFrame : this.diamondSpriteFrame;
    }

    protected abstract setText(text: string, isNumberText: boolean, type: RewardType, color: Color): void;
}
