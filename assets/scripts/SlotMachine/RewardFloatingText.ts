import { _decorator, Component, Label, Sprite, tween, Vec3, Color, UITransform, RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RewardFloatingText')
export class RewardFloatingText extends Component {
    @property(RichText)
    rewardLabel: RichText = null;

    @property(Sprite)
    coinIcon: Sprite = null;

    public showReward(text: string, isCoin: boolean) {
        let formattedText = text;
    
        const match = text.match(/([+-]\d[\d,.]*)/);
        if (match) {
            const value = match[1];
            const color = value.startsWith('+') ? '#3399FF' : '#FF0000';
    
            formattedText = text.replace(value, `<color=${color}>${value}</color>`);
        }
    
        this.rewardLabel.string = formattedText;
    
        if (this.coinIcon) {
            this.coinIcon.node.active = isCoin;
        }
    
        this.node.setPosition(0, 0, 0);
        this.node.setScale(0, 0, 0);
    
        tween(this.node)
            .to(0.15, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'backOut' })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' })
            .to(1, { position: new Vec3(0, 40, 0) }, { easing: 'sineOut' })
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'sineIn' })
            .call(() => this.node.destroy())
            .start();
    }
    
}
