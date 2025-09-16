import { _decorator, Component, Node } from 'cc';
import { FoodType, RewardItemDTO, RewardType } from '../../Model/Item';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass('RewardItemMission')
export class RewardItemMission extends Component {
  @property({ type: Label }) quantity: Label = null;
  @property({ type: [SpriteFrame] }) iconRewards: SpriteFrame[] = [];
  @property({ type: [SpriteFrame] }) iconFoodRewards: SpriteFrame[] = [];
  @property({ type: Sprite }) iconFrame: Sprite = null;

  public setupReward(reward: RewardItemDTO) {
    this.setIconReward(reward);
    this.quantity.string = `+${reward.quantity}`;
  }

  setIconReward(reward: RewardItemDTO) {
    switch (reward.type) {
      case RewardType.FOOD:
        this.iconFrame.spriteFrame = this.getIconFood(reward.food.type);
        break;
      case RewardType.GOLD:
      case RewardType.DIAMOND:
        this.iconFrame.spriteFrame = this.getIconValue(reward.type);
        break;
      default:
        this.iconFrame.spriteFrame = null; // hoặc icon mặc định nếu có
        break;
    }
  }

  getIconValue(itemType: RewardType): SpriteFrame {
    const index = itemType == RewardType.DIAMOND ? 0 : 1;
    return this.iconRewards[index];
  }

  getIconFood(foodType: FoodType): SpriteFrame {
    const index =
      foodType == FoodType.NORMAL ? 0 : foodType == FoodType.PREMIUM ? 1 : 2;
    return this.iconFoodRewards[index];
  }
}
