import { _decorator, Component, instantiate, Label, Node, ParticleSystem2D, Prefab, Sprite, SpriteFrame, tween, Tween, UITransform, Vec3 } from 'cc';
import { BaseInventoryUIITem } from '../gameplay/player/inventory/BaseInventoryUIItem';
import { RewardItemDTO } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('RewardItem')
export class RewardItem extends BaseInventoryUIITem {

    setRewardItem(itemReward: RewardItemDTO){
        this.iconItemUIHelper.icon.spriteFrame = null;
        this.iconItemUIHelper.node.active = true;
        this.setIconByReward(itemReward);
        this.amountLabel.string = "+" + itemReward.quantity.toString();
    }

    public setupEmpty() {
        this.reset();
    }

    protected onDisable(): void {
        this.reset();
    }

    private reset(){
        this.iconItemUIHelper.node.active = false;
        this.amountLabel.string = "";
    }
}