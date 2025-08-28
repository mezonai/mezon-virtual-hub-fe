import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { RewardLoginItem } from '../Reward/RewardLoginItem';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
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
    }
}
export interface PopupLoginQuestParam {

}
