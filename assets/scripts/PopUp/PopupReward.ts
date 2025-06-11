import { _decorator, Button, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { RewardItem } from '../SlotMachine/RewardItem';
import { Food, FoodType, RewardItemDTO, RewardType } from '../Model/Item';
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

        const currentItem = rewardItems[this.currentIndex] as RewardItemDTO;
        let indexIcon = 0;
        if (currentItem.type == RewardType.GOLD) indexIcon = 3;
        else if (currentItem.type == RewardType.FOOD) {
            indexIcon = currentItem.food.type == FoodType.NORMAL ? 0 : currentItem.food.type == FoodType.PREMIUM ? 1 : 2;
        }
        else indexIcon = 3;
        this.icon.spriteFrame = this.iconReward[indexIcon];
        let quantityReward = currentItem.type == RewardType.GOLD ? currentItem.amount : currentItem.quantity
        this.quantity.string = "+" + quantityReward;
        this.contentReward.string = currentItem.type == RewardType.FOOD ? this.contentRewardFood(currentItem.food) : this.contentOtherReward();
    }

    private contentRewardFood(food: Food): string {
        return `Chúc mừng bạn nhận thành công ${food.name}. Hãy dùng nó để bắt các thú cưng`;
    }

    private contentOtherReward(): string {
        return `Chúc mừng bạn nhận quà thành công`;
    }

    protected onLoad(): void {

    }

    async onButtonClick() {

    }
}


