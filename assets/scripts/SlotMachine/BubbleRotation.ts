import { _decorator, Component, Node, tween, v3, Tween, EventKeyboard, KeyCode, Prefab, instantiate, UITransform, Sprite } from 'cc';
import { RewardItemDTO, RewardType } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('BubbleRotation')
export class BubbleRotation extends Component {
    @property
    rotationSpeed: number = 1;
    private rotationTween: Tween<Node> | null = null;
    private idleBounceTween: Tween<Node> | null = null;

    public startRotation() {
        this.stopRotationTween();

        this.node.eulerAngles = v3(0, 0, 0);
        this.node.scale = v3(0, 0, 1);

        tween(this.node)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                const duration = 3;
                const totalRotation = 1080;
                const temp = { angle: 0 };

                this.rotationTween = tween(temp)
                    .to(duration, { angle: totalRotation }, {
                        easing: 'quadOut',
                        onUpdate: () => {
                            this.node.eulerAngles = v3(0, 0, temp.angle);
                        },
                    })
                    .call(() => {
                        this.node.eulerAngles = v3(0, 0, 0);
                    })
                    .start();
            })
            .start();
    }

    public stopRotation() {
        this.stopRotationTween();
        this.stopIdleBounce();
    }

    private stopRotationTween() {
        if (this.rotationTween) {
            this.rotationTween.stop();
            this.rotationTween = null;
            this.node.eulerAngles = v3(0, 0, 0);
        }
    }

    onEnable() {
        this.playIdleBounce();
    }

    onDisable() {
        this.stopIdleBounce();
    }

    private playIdleBounce() {
        this.stopIdleBounce();

        this.node.scale = v3(1, 1, 1);
        this.idleBounceTween = tween(this.node)
            .repeatForever(
                tween()
                    .to(1, { scale: v3(1.01, 1.01, 1) }, { easing: 'sineInOut' })
                    .to(1, { scale: v3(1, 1, 1) }, { easing: 'sineInOut' })
            )
            .start();
    }

    private stopIdleBounce() {
        if (this.idleBounceTween) {
            this.idleBounceTween.stop();
            this.idleBounceTween = null;
            this.node.scale = v3(1, 1, 1);
        }
    }

}
