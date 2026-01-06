import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { UserMeManager } from '../core/UserMeManager';
import { AnimationController } from '../gameplay/player/AnimationController';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { PetBattleInfo, PetDTO } from '../Model/PetDTO';
import { RichText } from 'cc';
import { PetBattleResult } from '../animal/PetBattleResult';
import { WebRequestManager } from '../network/WebRequestManager';
import ConvetData from '../core/ConvertData';
import { Constants } from '../utilities/Constants';
import { PopupReward, PopupRewardParam, RewardStatus } from './PopupReward';
import { RewardItemDTO, RewardType } from '../Model/Item';
const { ccclass, property } = _decorator;

export enum StatusBattle {
    WIN,
    LOSE
}

@ccclass('PopupWinLoseBattle')
export class PopupWinLoseBattle extends BasePopup {
    @property({ type: AnimationEventController }) previewPlayer: AnimationEventController = null;
    @property({ type: AnimationController }) animationController: AnimationController = null;
    @property({ type: Button }) btnClose: Button = null;
    @property({ type: RichText }) title: RichText = null;
    @property({ type: [PetBattleResult] }) petBattleResult: PetBattleResult[] = [];

    public async init(param?: WinLoseBattleParam) {
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.node.active = false;
        if (UserMeManager.Get?.user?.skin_set != null) {
            this.previewPlayer.init(UserMeManager.Get.user.skin_set);
        }
        if (param.statusBattle == StatusBattle.WIN) {
            this.ActionHappy();
            this.title.string = "Chiến Thắng";
        }
        else {
            this.ActionSad();
            this.title.string = "Thất Bại";
        }
        this.showPopupReward(param);
        this.btnClose.addAsyncListener(async () => {
            for (const pet of this.petBattleResult) {
                await pet.cancelAnim();
            }
            await WebRequestManager.instance.getMyPetAsync();
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }
    async showPopupReward(param: WinLoseBattleParam) {
        const reward = new RewardItemDTO();
        reward.type = param.isDiamond ? RewardType.DIAMOND : RewardType.GOLD ;
        reward.quantity = param.currentValue;
        const paramPopup: PopupRewardParam = {
            status: param.statusBattle == StatusBattle.WIN ? RewardStatus.GAIN : RewardStatus.LOSS,
            content: param.statusBattle == StatusBattle.WIN ? "Chúc mừng bạn đã chiến thắng" : " Chia buồn cùng bạn",
            reward: reward
        };
        const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, paramPopup);
        await PopupManager.getInstance().waitCloseAsync((await popup).node.uuid);
        this.node.active = true;
        this.setInfoPet(param.expAddedPerPet, param.petsDataBeforeUpdate, param.petsDataAfterUpdate);
    }

    async setInfoPet(expAdded: number, petsDataBeforeUpdate: PetBattleInfo[], petsDataAfterUpdate: PetDTO[]) {
        this.petBattleResult.forEach(async (pet, index) => {
            const before = petsDataBeforeUpdate[index];
            const after = petsDataAfterUpdate.find(p => p.id === before?.id);
            await pet.SetData(expAdded, before, after);
        });
        await Constants.waitForSeconds(1);
        await this.playAnimResult();
    }

    async playAnimResult() {
        for (const pet of this.petBattleResult) {
            await pet.playAnim();
        }
    }

    public ActionHappy() {
        this.animationController.play("happy", true);
    }

    public ActionSad() {
        this.animationController.play("kneel", true);
    }

}
export interface WinLoseBattleParam {
    petsDataBeforeUpdate: PetBattleInfo[];
    petsDataAfterUpdate: PetDTO[];
    statusBattle: StatusBattle;
    currentValue: number;
    expAddedPerPet: number;
    isDiamond: boolean;
}

