import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { ItemRewardEvent } from '../Reward/LoginEvents/ItemRewardEvent';
import { RewardLoginItem } from '../Reward/RewardLoginItem';
import { Button } from 'cc';
import { Label } from 'cc';
import { PopupManager } from './PopupManager';
import { EventRewardDTO, EventType, RewardNewbieDTO } from '../Model/Item';
import { Constants } from '../utilities/Constants';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('PopupLoginEvents')
export class PopupLoginEvents extends BasePopup {
    @property({ type: [ItemRewardEvent] }) itemRewardEvents: ItemRewardEvent[] = [];
    @property({ type: [Node] }) backgroundEvent: Node[] = [];
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Label }) remainingLabel: Label = null;
    eventType: EventType = EventType.EVENT_LOGIN_CLAN;
    private countdownId: any = null;

    public async init(param?: PopupLoginEventsParam) {
        if (param == null || param.rewardEvents == null || param.rewardEvents.rewards == null) {
            this.clearCountDown();
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.clearCountDown();
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.eventType = param.rewardEvents.eventType;
        this.setDataReward(param.rewardEvents.rewards);
        this.setColorBackground(this.eventType);

    }

    setDataReward(rewardEvents: RewardNewbieDTO[]) {
        this.showCountDown(rewardEvents);
        rewardEvents.forEach((dto, i) => {
            this.itemRewardEvents[i].setData(dto, this.eventType, this.claimReward.bind(this));
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

    async claimReward(questId: string): Promise<boolean> {
        const completed = await WebRequestManager.instance.claimRewardAsync(questId);
        if (!completed) return false;
        const rewards = await WebRequestManager.instance.getEventRewardAsync();
        if (rewards != null && rewards.rewards.length > 0) {
            this.setDataReward(rewards.rewards);
        }
        return true
    }

    clearCountDown() {
        Constants.clearCountDown(this.countdownId);
        this.countdownId = null;
    }

    setColorBackground(eventType: EventType) {
        const index = eventType == EventType.EVENT_LOGIN_PET ? 0 : eventType == EventType.EVENT_LOGIN_PLANT ? 1 : 0;
        this.backgroundEvent.forEach((element, i) => {
            element.active = i == index;
        });
    }
}
export interface PopupLoginEventsParam {
    rewardEvents: EventRewardDTO;
}

