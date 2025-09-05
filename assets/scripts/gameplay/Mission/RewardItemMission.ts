import { _decorator, Component, Node } from 'cc';
import { RewardItemDTO, RewardType } from '../../Model/Item';
import { Sprite } from 'cc';
import { Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RewardItemMission')
export class RewardItemMission extends Component {
    @property({ type: Label }) coinReceive: Label = null;
    @property({ type: Label }) foodReceive: Label = null;
    @property({ type: Node }) go_CoinReceive: Node = null;
    @property({ type: Node }) go_foodReceive: Node = null;
    @property({ type: Sprite }) iconFrame: Sprite = null;
    @property({ type: Sprite }) iconFood: Sprite = null;

    public setupReward(reward: RewardItemDTO) {
        this.go_foodReceive.active = false;
        this.go_CoinReceive.active = false;
        switch (reward.type) {
            case RewardType.FOOD:
                this.go_foodReceive.active = true;
                this.foodReceive.string = `+${reward.quantity}`;
                break;
            case RewardType.DIAMOND:
            case RewardType.GOLD:
                this.go_CoinReceive.active = true;
                this.coinReceive.string = `+${reward.quantity}`;
                break;
            default:
                break;
        }
    }
}