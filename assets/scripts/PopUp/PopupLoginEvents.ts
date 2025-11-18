import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { ItemRewardEvent } from '../Reward/LoginEvents/ItemRewardEvent';
import { RewardLoginItem } from '../Reward/RewardLoginItem';
import { Button } from 'cc';
import { Label } from 'cc';
import { PopupManager } from './PopupManager';
import { RewardNewbieDTO } from '../Model/Item';
import { Constants } from '../utilities/Constants';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('PopupLoginEvents')
export class PopupLoginEvents extends BasePopup {
    @property({ type: [ItemRewardEvent] }) itemRewardEvents: RewardLoginItem[] = [];
    @property({ type: [Node] }) backgroundEvent: Node[] = [];
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Label }) remainingLabel: Label = null;
    private countdownId: any = null;

    public async init(param?: PopupLoginEventsParam) {
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
        rewardNewbieDTOs.forEach((dto, i) => {
            this.itemRewardEvents[i].setData(dto, this.getNewbieReward.bind(this));
        });
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

    clearCountDown() {
        Constants.clearCountDown(this.countdownId);
        this.countdownId = null;
    }
}
export interface PopupLoginEventsParam {
    rewardNewbieDTOs: RewardNewbieDTO[];
}

