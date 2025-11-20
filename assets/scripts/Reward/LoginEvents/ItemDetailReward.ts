import { RichText } from 'cc';
import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { FoodType, RewardItemDTO, RewardType } from '../../Model/Item';
import { Species } from '../../Model/PetDTO';
import { Sprite } from 'cc';
import { ItemIconManager } from '../../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('ItemDetailReward')
export class ItemDetailReward extends Component {
    @property({ type: RichText }) quantity: RichText = null;
    @property({ type: Sprite }) icon: Sprite = null;

    setDataDetail(reward: RewardItemDTO) {
        this.icon.spriteFrame = ItemIconManager.getInstance().getIconReward(reward);
        this.quantity.string = `<outline color=#6D4B29 width=1> ${reward.quantity} </outline>`;
    }
}


