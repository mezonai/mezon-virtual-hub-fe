import { _decorator, Button, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Food, FoodType, RewardItemDTO } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

export enum RewardNewType {
    GOLD,
    NORMAL_FOOD,
    PREMIUM_FOOD,
    ULTRA_PREMIUM_FOOD,
    DIAMOND
}

export enum RewardStatus {
    GAIN = "GAIN",   // Nhận
    LOSS = "LOSS",   // Mất
}

@ccclass('PopupReward')
export class PopupReward extends BasePopup {
    @property(Button) confirmButton: Button = null;
    @property(RichText) contentReward: RichText = null!;
    @property({ type: RichText }) title: RichText = null;
    @property(Label) quantity: Label = null!;
    @property(Sprite) icon: Sprite = null!;
    @property({ type: [SpriteFrame] }) iconReward: SpriteFrame[] = [];//0 = normal foood, 1 = super food, 2 = rare food
    public async init(param?: PopupRewardParam) {
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.confirmButton.addAsyncListener(async () => {
            this.confirmButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.showReward(param);
    }

    showReward(param: PopupRewardParam) {
        this.title.string = param.status == RewardStatus.GAIN ? "Nhận Quà" : "Thông Báo";
        const indexIcon = param.rewardType == RewardNewType.NORMAL_FOOD ? 0 : param.rewardType == RewardNewType.PREMIUM_FOOD ? 1 :
            param.rewardType == RewardNewType.ULTRA_PREMIUM_FOOD ? 2 : param.rewardType == RewardNewType.GOLD ? 3 : 4;
        this.icon.spriteFrame = this.iconReward[indexIcon];
        this.contentReward.string = param.content;
        this.quantity.string = param.status == RewardStatus.GAIN ? `+${param.quantity}` : `-${param.quantity}`
        if (param.rewardType == RewardNewType.GOLD) {
            UserMeManager.playerCoin += param.quantity;
        }
        else if (param.rewardType == RewardNewType.DIAMOND) {
            UserMeManager.playerDiamond += param.quantity;
        } else {
            this.quantity.string = `+${param.quantity}`;
            const foodType = param.rewardType == RewardNewType.NORMAL_FOOD ? FoodType.NORMAL : param.rewardType == RewardNewType.PREMIUM_FOOD ? FoodType.PREMIUM : FoodType.ULTRA_PREMIUM;
            let addSucess = UserMeManager.AddQuantityFood(foodType, param.quantity);
            if (addSucess) return;
            WebRequestManager.instance.getUserProfile(
                (response) => { },
                (error) => { }
            );
        }
    }
}


export interface PopupRewardParam {
    rewardType: RewardNewType;
    quantity: number,
    status: RewardStatus;
    content: string
}