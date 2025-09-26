import { _decorator, Component, instantiate, Label, Node, ParticleSystem2D, Prefab, Sprite, SpriteFrame, tween, Tween, UITransform, Vec3 } from 'cc';
import { BaseInventoryUIITem } from '../gameplay/player/inventory/BaseInventoryUIItem';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { Item, RewardItemDTO, RewardType } from '../Model/Item';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends BaseInventoryUIITem {
    @property({ type: Node }) go_Avartar: Node = null;
    @property({ type: Node }) go_ItemOtherReceive: Node = null;
    @property({ type: Node }) go_Particle: Node = null;
    @property({ type: IconItemUIHelper }) iconItemOther: IconItemUIHelper = null;

    setIconReward(itemReward: RewardItemDTO){
        this.iconItemOther.setIconByReward(itemReward);
        this.amountLabel.string = "+" + itemReward.quantity.toString()
        this.go_Avartar.active = false;
        this.go_ItemOtherReceive.active = true;
        this.go_Particle.active = true;
    }

    setupAvatar() {
        this.go_ItemOtherReceive.active = false;
        this.go_Avartar.active = true;
        this.go_Particle.active = true;
    }

    public setupEmpty() {
        this.go_Avartar.active = false;
        this.go_ItemOtherReceive.active = false;
        this.go_Particle.active = false;
    }

    public getItem(): Item {
        return this.data;
    }

    protected onDisable(): void {
        this.go_Avartar.active = false;
        this.go_ItemOtherReceive.active = false;
    }

}