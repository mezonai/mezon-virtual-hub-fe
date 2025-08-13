import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { UserMeManager } from '../core/UserMeManager';
import { AnimationController } from '../gameplay/player/AnimationController';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { PetBattleInfo } from '../Model/PetDTO';
import { RichText } from 'cc';
import { PetBattleResult } from '../animal/PetBattleResult';
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
        this.setInfoPet(param.pets);
        this.btnClose.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }

    setInfoPet(pets: PetBattleInfo[]) {
        this.petBattleResult.forEach((pet, index) => {
            pet.SetData(pets[index]);
        });
    }

    public ActionHappy() {
        this.animationController.play("happy", true);
    }

    public ActionSad() {
        this.animationController.play("kneel", true);
    }

}
export interface WinLoseBattleParam {
    pets: PetBattleInfo[];
    statusBattle: StatusBattle;
}

