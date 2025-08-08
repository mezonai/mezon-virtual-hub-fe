import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupSelectionTimeOut, SelectionTimeOutParam, TargetButton } from '../../../PopUp/PopupSelectionTimeOut';
import { ConfirmParam, ConfirmPopup } from '../../../PopUp/ConfirmPopup';
import { UserManager } from '../../../core/UserManager';
import { UserMeManager } from '../../../core/UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('PetCombat')
export class PetCombat extends PlayerInteractAction {
    private fee: number = 5;
    protected onLoad() {
        this.actionType = ActionType.PetCombat;
    }

    protected override invite() {
        const myPets = UserMeManager?.MyPets();
        if (!myPets || myPets.length === 0) {
            return this.showNotice("Bạn chưa có Pet để đấu. Vui lòng hãy bắt pet");
        }

        const petsInBattle = myPets.filter(pet => pet && pet.battle_slot > 0);

        if (petsInBattle.length < 3) {
            return this.showNotice("Bạn cần có đủ 3 Pet chiến đấu để thách đấu");
        }

        const allSetTwoSkills = petsInBattle.every(
            pet => pet.equipped_skill_codes?.length >= 2
        );
        if (!allSetTwoSkills) {
            return this.showNotice("Pet chiến đấu chưa thiết lập đủ kỹ năng chiến đấu, Vui lòng hãy thiết lập");
        }

        // Nếu qua được hết kiểm tra
        super.invite();
        this.room.send("p2pAction", {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString()
        });
    }

    private showNotice(message: string) {
        const param: ConfirmParam = {
            title: "Thông báo",
            message
        };
        PopupManager.getInstance().openAnimPopup("ConfirmPopup", ConfirmPopup, param);
    }

    public onBeingInvited(data) {
        const param: SelectionTimeOutParam = {
            title: "Thông báo",
            content: `${data.fromName} mời bạn chơi đấu pet. Phí <color=#FF0000> ${this.fee} diamond</color>`,
            textButtonLeft: "Chơi",
            textButtonRight: "Thôi",
            textButtonCenter: "",
            timeout: {
                seconds: this.inviteTimeout,
                targetButton: TargetButton.LEFT,
            },
            onActionButtonLeft: () => {
                this.startAction(data);
            },
            onActionButtonRight: () => {
                this.rejectAction(data);
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionTimeOut", PopupSelectionTimeOut, param);
    }

    protected startAction(data) {
        let sendData = {
            targetClientId: data.from,
            action: data.action
        }
        this.room.send("p2pCombatActionAccept", sendData);
        this.onStartAction(data);
    }

    public onStartAction(data) {
        super.onStartAction(data);
    }



    public rejectAction(data) {
        SoundManager.instance.playSound(AudioType.NoReward);
        let sendData = {
            targetClientId: data.from,
            action: data.action
        }
        this.room.send("p2pActionReject", sendData)
        this.onRejectAction(data);
    }

    public onRejectAction(data) {
        super.onRejectAction(data);
        console.log(data, "reject")
    }

    public actionResult(data) {
        super.actionResult(data);
    }

    public stop() {
        super.stop();
    }
}