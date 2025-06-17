import { _decorator, Button, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { RewardItem } from '../SlotMachine/RewardItem';
import { Food, FoodType, RewardItemDTO, RewardType } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('PopupReward')
export class PopupReward extends BasePopup {
    @property(Button) confirmButton: Button = null;
    @property(RichText) contentReward: RichText = null!;
    @property(Label) quantity: Label = null!;
    @property(Sprite) icon: Sprite = null!;
    @property({ type: [SpriteFrame] }) iconReward: SpriteFrame[] = [];//0 = normal foood, 1 = super food, 2 = rare food
    private currentIndex: number = 0;
    public async init(param?) {
        if (param == null || param.rewards == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.confirmButton.node.on(Button.EventType.CLICK, () => {
            this.currentIndex++;
            this.showCurrentReward(param.rewards);
        }, this);
        this.showCurrentReward(param.rewards);
    }

    private async showCurrentReward(rewardItems: any) {
        if (this.currentIndex >= rewardItems.length) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }

        const currentItem = rewardItems[this.currentIndex];
        const isGold = currentItem.type === RewardType.GOLD;
        const isFood = currentItem.type === RewardType.FOOD;
        const indexIcon = isFood ? currentItem.food.type === FoodType.NORMAL ? 0 : currentItem.food.type === FoodType.PREMIUM ? 1 : 2 : 3;

        if (isGold) {
            UserMeManager.playerCoin += currentItem.amount;
            this.quantity.string = `+${currentItem.amount}`;
        } else if (isFood) {
            this.quantity.string = `+${currentItem.quantity}`;
            let addSucess = UserMeManager.AddQuantityFood(currentItem.food.type, currentItem.quantity);
            if (!addSucess) {
                WebRequestManager.instance.getUserProfile(
                    (response) => {
                        UserMeManager.Set = response.data;
                        GameManager.instance.inventoryController.addFoodToInventory(UserMeManager.GetFoods);
                    },
                    (error) => this.onError(error)
                );
            }
        }
        this.icon.spriteFrame = this.iconReward[indexIcon];
        this.contentReward.string = isFood
            ? this.contentRewardFood(currentItem.food)
            : this.contentOtherReward();
    }

    private contentRewardFood(food: Food): string {
        return `Chúc mừng bạn nhận thành công ${food.name}. Hãy dùng nó để bắt các thú cưng`;
    }

    private contentOtherReward(): string {
        return `Chúc mừng bạn nhận quà thành công`;
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


