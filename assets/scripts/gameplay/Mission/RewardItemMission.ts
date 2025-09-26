import { _decorator, Component, Node } from 'cc';
import { FoodType, ItemType, RewardItemDTO, RewardType } from '../../Model/Item';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { SpriteFrame } from "cc";
import { IconItemUIHelper } from '../../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('RewardItemMission')
export class RewardItemMission extends Component {
  @property({ type: Label }) quantity: Label = null;
  @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;

  public setupReward(reward: RewardItemDTO) {
    this.iconItemUIHelper.setIconByReward(reward);
    this.iconItemUIHelper.setSizeIconByItemType(reward.item?.type);
    this.quantity.string = `+${reward.quantity}`;
  }
}
