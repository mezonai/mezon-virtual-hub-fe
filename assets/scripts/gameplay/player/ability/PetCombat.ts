import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupSelectionTimeOut, SelectionTimeOutParam, TargetButton } from '../../../PopUp/PopupSelectionTimeOut';
import { ConfirmParam, ConfirmPopup } from '../../../PopUp/ConfirmPopup';
import { UserManager } from '../../../core/UserManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { ServerManager } from '../../../core/ServerManager';
const { ccclass, property } = _decorator;
enum PetBattleError {
    NOT_PET,
    NOT_ENOUGH_BATTLE_SKILL_PETS,
    NOT_ENOUGH_BATTLE_PETS,
    NONE
}
@ccclass('PetCombat')
export class PetCombat extends PlayerInteractAction {
    private fee: number = 5;
    protected onLoad() {
        this.actionType = ActionType.PetCombat;
    }

    protected override invite() {
        if (!this.canBattle(null)) return;
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
        if (!this.canBattle(data)) return;
        const param: SelectionTimeOutParam = {
            title: "Thông báo",
            // content: `${data.fromName} mời bạn chơi đấu pet. Phí <color=#FF0000> ${this.fee} diamond</color>`,
            content: `${data.fromName} mời bạn chơi đấu pet.</color>`,
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
        PopupManager.getInstance().openPopup("PopupSelectionTimeOut", PopupSelectionTimeOut, param);
    }

    private validateBattlePets(): PetBattleError {
        const myPets = UserMeManager?.MyPets();
        if (!myPets || myPets.length <= 0) {
            return PetBattleError.NOT_PET;
        }

        const petsInBattle = myPets.filter(pet => pet?.battle_slot > 0);
        if (petsInBattle.length < 3) {
            return PetBattleError.NOT_ENOUGH_BATTLE_PETS;
        }
        const hasEnoughSkills = petsInBattle.every(pet =>
            Array.isArray(pet.equipped_skill_codes) &&
            pet.equipped_skill_codes.length >= 2 &&
            pet.equipped_skill_codes.every(skill => skill != null)
        );
        if (!hasEnoughSkills) {
            return PetBattleError.NOT_ENOUGH_BATTLE_SKILL_PETS;
        }
        return PetBattleError.NONE;
    }

    private canBattle(data: any): boolean {
        const error = this.validateBattlePets();
        if (error === PetBattleError.NONE) return true;
        if (data != null) {
            const dataSend = {
                sender: data.from,
            };
            if (error === PetBattleError.NOT_PET) {
                ServerManager.instance.sendNotPet(dataSend);
            } else if (error === PetBattleError.NOT_ENOUGH_BATTLE_PETS) {
                ServerManager.instance.sendNotEnoughPet(dataSend);
            } else {
                ServerManager.instance.sendNotEnoughSkillPet(dataSend);
            }
        } else {
            if (error === PetBattleError.NOT_PET) {
                this.showNotice("Bạn chưa có Pet để đấu. Vui lòng hãy bắt pet");
            } else if (error === PetBattleError.NOT_ENOUGH_BATTLE_PETS) {
                this.showNotice("Bạn cần có đủ 3 Pet chiến đấu để thách đấu");
            } else {
                this.showNotice("Bạn cần cài đặt đủ kỹ năng chiến đấu cho Pet");
            }
        }

        return false;
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