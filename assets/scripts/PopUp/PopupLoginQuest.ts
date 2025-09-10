import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { RewardLoginItem } from '../Reward/RewardLoginItem';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { RewardNewbieDTO } from '../Model/Item';
import { WebRequestManager } from '../network/WebRequestManager';
import { Label } from 'cc';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('PopupLoginQuest')
export class PopupLoginQuest extends BasePopup {
    @property({ type: [RewardLoginItem] }) rewardLoginItem6Days: RewardLoginItem[] = [];
    @property({ type: RewardLoginItem }) rewardLoginItem7Day: RewardLoginItem = null;
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Label }) remainingLabel: Label = null;
    private countdownId: any = null;

    public async init(param?: PopupLoginQuestParam) {
        if (param == null) {
            this.clearCountDown();
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.clearCountDown();
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.setDataReward(param.rewardNewbieDTOs);

    }

    setDataReward(rewardNewbieDTOs: RewardNewbieDTO[]) {
        this.showCountDown(rewardNewbieDTOs);
        rewardNewbieDTOs.slice(0, 6).forEach((dto, i) => {
            this.rewardLoginItem6Days[i].setData(dto, this.getNewbieReward.bind(this));
        });
        this.rewardLoginItem7Day.setData(rewardNewbieDTOs[rewardNewbieDTOs.length - 1], this.getNewbieReward.bind(this));
    }
    
    showCountDown(rewardNewbieDTOs: RewardNewbieDTO[]) {
        if (rewardNewbieDTOs.length === 0) return;
        const endAt = new Date(rewardNewbieDTOs[0].end_at);
        const diffSeconds = Math.floor((endAt.getTime() - Date.now()) / 1000);

        if (diffSeconds <= 0) {
            this.updateLabel("Đã hết hạn nhận quà");
            return;
        }

        if (this.countdownId) {
            this.clearCountDown();
        }

        this.countdownId = Constants.registCountDown(
            diffSeconds,
            (timeText) => this.updateLabel(timeText),
            () => {
                this.updateLabel("Đã hết hạn nhận quà");
                this.clearCountDown();
            }
        );
    }

    updateLabel(text: string) {
        if (this.remainingLabel && this.node.isValid) {
            this.remainingLabel.string = text;
        }
    };

    async getNewbieReward(questId: string): Promise<boolean> {
        const completed = await WebRequestManager.instance.claimRewardAsync(questId);
        if (!completed) return false;
        const rewards = await WebRequestManager.instance.getRewardNewbieLoginAsync()
        if (rewards != null && rewards.length > 0) {
            this.setDataReward(rewards);
        }
        return true
    }

    clearCountDown(){
        Constants.clearCountDown(this.countdownId);
        this.countdownId = null;
    }
}
export interface PopupLoginQuestParam {
    rewardNewbieDTOs: RewardNewbieDTO[];
}
