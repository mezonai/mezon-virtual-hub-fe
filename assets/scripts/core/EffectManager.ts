import { _decorator, Color, Component, Label, Node, ParticleSystem2D, Prefab, tween, UIOpacity, Vec3 } from 'cc';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    private static _instance: EffectManager;

    @property({ type: Node }) effectParent: Node = null;
    @property({ type: Prefab }) textEffect: Prefab = null;
    @property({type: [Color]}) stasColor: Color[] = [];

    public static get instance() {
        return EffectManager._instance;
    }

    protected onLoad(): void {
        if (EffectManager._instance == null) {
            EffectManager._instance = this;
        }
    }

    protected onDestroy(): void {
        EffectManager._instance = null;
    }

    public spawnPointEffect(point: number, aimPos: Vec3) {
        let effect = ObjectPoolManager.instance.spawnFromPool(this.textEffect.name);
        effect.parent = this.effectParent;
        effect.worldPosition = aimPos;

        let label = effect.getComponent(Label);
        if (point > 0) {
            label.string = "+" + point.toLocaleString();
            label.color = this.stasColor[0];
        }
        else {
            label.string = point.toLocaleString();
            label.color = this.stasColor[1];
        }
        
        tween(effect)
            .to(1, { position: (effect.position.clone().add(new Vec3(0, 120, 0))) }, {easing: 'quadIn'})
            .start();

        let opacity = effect.getComponent(UIOpacity);
        opacity.opacity = 0;
        tween(opacity)
            .to(0.3, { opacity: 255 }, {easing: 'quadIn'})
            .delay(0.5)
            .to(0.4, { opacity: 0 }, {easing: 'sineInOut'})
            .delay(0.1)
            .call(() => { ObjectPoolManager.instance.returnToPool(effect); })
            .start();
    }

    public spawnTextEffect(content: string) {
        let effect = ObjectPoolManager.instance.spawnFromPool(this.textEffect.name);
        effect.parent = this.effectParent;
        effect.position = Vec3.ZERO;

        let label = effect.getComponent(Label);
        label.string = content;

        tween(effect)
            .to(0.3, { position: (effect.position.clone().add(new Vec3(0, 150, 0))) })
            .delay(0.5)
            .call(() => { ObjectPoolManager.instance.returnToPool(effect); })
            .start();
    }
}