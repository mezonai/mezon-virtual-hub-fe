import { _decorator, Button, Component, Label, Node, RichText, Sprite, instantiate, Prefab, ScrollView } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { RewardItemDTO, RewardType } from '../Model/Item';
import { RewardStatus } from './PopupReward';
import { ItemDetailReward } from '../Reward/LoginEvents/ItemDetailReward';
import { UserMeManager } from '../core/UserMeManager';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('PopupRewardClanWeekly')
export class PopupRewardClanWeekly extends BasePopup {
    @property(Button) confirmButton: Button = null;
    @property(Label) contentReward: Label = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) scrollView: ScrollView = null!;

    public async init(param?: PopupRewardClanWeeklyParam) {
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.confirmButton.addAsyncListener(async () => {
            this.confirmButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.showReward(param);
        this.applyReward(param);
    }

    async showReward(param: PopupRewardClanWeeklyParam) {
        this.contentReward.string = param.content;
        for (let i = 0; i < param.reward.length; i++) {
            const itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.scrollView.content);

            const itemComp = itemNode.getComponent(ItemDetailReward)!;
            itemComp.setDataDetail(param.reward[i]);
        }
    }

    private applyReward(param: PopupRewardClanWeeklyParam) {
        for (const reward of param.reward) {
            const qty =
                param.status === RewardStatus.GAIN
                    ? reward.quantity
                    : -reward.quantity;
            switch (reward.type) {
                case RewardType.GOLD:
                    UserMeManager.playerCoin += qty;
                    break;
                case RewardType.DIAMOND:
                    UserMeManager.playerDiamond += qty;
                    break;
                case RewardType.FOOD:
                    if (!UserMeManager.AddQuantityFood(reward.food.type, qty)) {
                        WebRequestManager.instance.getUserProfileAsync();
                    }
                    break;
                case RewardType.ITEM:
                    WebRequestManager.instance.getUserProfileAsync();
                    break;
            }
        }
    }

}


export interface PopupRewardClanWeeklyParam {
    status: RewardStatus;
    content: string,
    reward: RewardItemDTO[]
}