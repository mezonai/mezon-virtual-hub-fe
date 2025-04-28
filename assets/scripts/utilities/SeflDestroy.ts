import { _decorator, CCFloat, Component, Node, tween, UIOpacity } from 'cc';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('SeflDestroy')
export class SeflDestroy extends Component {
    @property({ type: CCFloat }) liveTime: number = 1;
    @property({ type: UIOpacity }) uiOpacity: UIOpacity = null;

    protected onEnable(): void {
        this.uiOpacity.opacity = 255;
        setTimeout(() => {
            tween(this.uiOpacity)
                .to(0.5, { opacity: 0 })
                .call(() => {
                    if (ObjectPoolManager.instance)
                        ObjectPoolManager.instance.returnToPool(this.node);
                })
                .start();
        }, this.liveTime * 1000);
    }
}


