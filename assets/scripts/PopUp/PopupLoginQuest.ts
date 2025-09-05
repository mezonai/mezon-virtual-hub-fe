import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { RewardLoginItem } from '../Reward/RewardLoginItem';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { RewardNewbieDTO } from '../Model/Item';
import { WebRequestManager } from '../network/WebRequestManager';
import ConvetData from '../core/ConvertData';
const { ccclass, property } = _decorator;

@ccclass('PopupLoginQuest')
export class PopupLoginQuest extends BasePopup {
    @property({ type: [RewardLoginItem] }) rewardLoginItem6Days: RewardLoginItem[] = [];
    @property({ type: RewardLoginItem }) rewardLoginItem7Day: RewardLoginItem = null;
    @property({ type: Button }) closeButton: Button = null;

    public async init(param?: PopupLoginQuestParam) {
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.setDataReward(param.rewardNewbieDTOs);

    }

    setDataReward(rewardNewbieDTOs: RewardNewbieDTO[]) {
        rewardNewbieDTOs.slice(0, 6).forEach((dto, i) => {
            this.rewardLoginItem6Days[i].setData(dto, this.getNewbieReward.bind(this));
        });
        this.rewardLoginItem7Day.setData(rewardNewbieDTOs[rewardNewbieDTOs.length - 1], this.getNewbieReward.bind(this));
    }

    async getNewbieReward(questId: string): Promise<boolean> {
        const completed = await WebRequestManager.instance.claimReward(questId);
        if (!completed) return false;
        const rewards = await WebRequestManager.instance.getRewardNewbieLogin()
        if (rewards != null && rewards.length > 0) {
            this.setDataReward(rewards);
        }
        return true
    }
}
export interface PopupLoginQuestParam {
    rewardNewbieDTOs: RewardNewbieDTO[];
}
