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
        this.title.string = param.status === RewardStatus.GAIN ? "Nhận Quà" : "Thông Báo";

        // 2. Map rewardType -> indexIcon
        const rewardIconMap: Record<RewardNewType, number> = {
            [RewardNewType.NORMAL_FOOD]: 0,
            [RewardNewType.PREMIUM_FOOD]: 1,
            [RewardNewType.ULTRA_PREMIUM_FOOD]: 2,
            [RewardNewType.GOLD]: 3,
            [RewardNewType.DIAMOND]: 4,
        };
        const indexIcon = rewardIconMap[param.rewardType] ?? 0;
        this.icon.spriteFrame = this.iconReward[indexIcon];

        // 3. Content
        this.contentReward.string = param.content;

        // 4. Quantity text
        const prefix = param.status === RewardStatus.GAIN ? "+" : "-";
        this.quantity.string = `${prefix}${param.quantity}`;

        // 5. Update user data
        switch (param.rewardType) {
            case RewardNewType.GOLD:
                UserMeManager.playerCoin += (param.status === RewardStatus.GAIN ? param.quantity : -param.quantity);
                break;

            case RewardNewType.DIAMOND:
                UserMeManager.playerDiamond += (param.status === RewardStatus.GAIN ? param.quantity : -param.quantity);
                break;

            case RewardNewType.NORMAL_FOOD:
            case RewardNewType.PREMIUM_FOOD:
            case RewardNewType.ULTRA_PREMIUM_FOOD: {
                // food mapping
                const foodMap: Record<RewardNewType, FoodType> = {
                    [RewardNewType.NORMAL_FOOD]: FoodType.NORMAL,
                    [RewardNewType.PREMIUM_FOOD]: FoodType.PREMIUM,
                    [RewardNewType.ULTRA_PREMIUM_FOOD]: FoodType.ULTRA_PREMIUM,
                    // fallback values (won't be used here)
                    [RewardNewType.GOLD]: FoodType.NORMAL,
                    [RewardNewType.DIAMOND]: FoodType.NORMAL,
                };
                const foodType = foodMap[param.rewardType];
                const delta = (param.status === RewardStatus.GAIN ? param.quantity : -param.quantity);

                const addSuccess = UserMeManager.AddQuantityFood(foodType, delta);
                if (!addSuccess) {
                    WebRequestManager.instance.getUserProfile(
                        () => { },
                        () => { }
                    );
                }
                break;
            }
        }
    }
}


export interface PopupRewardParam {
    rewardType: RewardNewType;
    quantity: number,
    status: RewardStatus;
    content: string
}