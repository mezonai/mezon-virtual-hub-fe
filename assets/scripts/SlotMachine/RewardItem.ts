import { _decorator, Component, instantiate, Label, Node, ParticleSystem2D, Prefab, Sprite, tween, Tween, UITransform, Vec3 } from 'cc';
import { BaseInventoryUIITem } from '../gameplay/player/inventory/BaseInventoryUIItem';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { Item } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends BaseInventoryUIITem {
    @property({ type: Label }) coinReceive: Label = null;
    @property({ type: Node }) go_Avartar: Node = null;
    @property({ type: Node }) go_CoinReceive: Node = null;
    @property({ type: Node }) go_Particle: Node = null;
    @property({ type: Prefab }) flyIcon: Prefab = null;


    setupGold(golReceive : number){
        this.go_Avartar.active = false;
        this.go_CoinReceive.active = true;
        this.coinReceive.string = "+"+golReceive.toString();
        this.go_Particle.active = true;
    }
    
    setupAvatar(){
        this.go_Avartar.active = true;
        this.go_CoinReceive.active = false;
        this.go_Particle.active = true;
        this.spawnFlyIconBurst();
    }

    public setupEmpty() {
        this.go_Avartar.active = false;
        this.go_CoinReceive.active = false;
        this.go_Particle.active = false;
    }
    
    public getItem(): Item {
        return this.data;
    }

    protected onDisable(): void {
        this.go_Avartar.active = false;
        this.go_CoinReceive.active = false;
    }

    spawnFlyIconBurst(count: number = 10, radius: number = 100) {
        for (let i = 0; i < count; i++) {
            const clone = instantiate(this.flyIcon);
            clone.setParent(this.node);
            clone.setScale(new Vec3(1, 1, 1));
            clone.active = true;
    
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            const targetOffset = new Vec3(Math.cos(angle) * distance, Math.sin(angle) * distance, 0);
    
            clone.setPosition(this.node.position);
    
            const midY = targetOffset.y + 30;
    
            tween(clone)
                .to(0.3, { position: new Vec3(targetOffset.x, midY, 0), scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "sineOut" })
                .to(0.5, { position: new Vec3(targetOffset.x, -100, 0), scale: new Vec3(0.5, 0.5, 0.5) }, { easing: "sineIn" })
                .call(() => {
                    clone.destroy();
                })
                .start();
        }
    }
    
}


