import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupSelectionTimeOut, SelectionTimeOutParam, TargetButton } from '../../../PopUp/PopupSelectionTimeOut';
import { UserMeManager } from '../../../core/UserMeManager';
import { ServerManager } from '../../../core/ServerManager';
import { PopupPetBetChallenge, PopupPetBetChallengeParam } from '../../../PopUp/PopupPetBetChallenge';
import { Constants } from '../../../utilities/Constants';
const { ccclass, property } = _decorator;
enum PetBattleError {
    NOT_PET,
    NOT_ENOUGH_BATTLE_SKILL_PETS,
    NOT_ENOUGH_BATTLE_PETS,
    NONE
}
@ccclass('PetCombat')
export class PetCombat extends PlayerInteractAction {
    protected onLoad() {
        this.actionType = ActionType.Battle;
    }

    protected override async invite() {
        if (!this.canBattle(null)) return;
        super.invite();

        const paramConfirmPopup: PopupPetBetChallengeParam = {
            title:'Thách Đấu đánh Pet',
            onActionChallenge: async (amount, isDiamond) => {
                console.log("this.isDiamond: ", isDiamond);
                this.room.send("p2pAction", {
                    targetClientId: this.playerController.myID,
                    action: this.actionType.toString(),
                    amount: amount,
                    isDiamond: isDiamond,
                });
                
            }
        };
        await PopupManager.getInstance().openPopup("PopupPetBetChallenge", PopupPetBetChallenge, paramConfirmPopup);

    }

    public onBeingInvited(data) {
        if (!this.canBattle(data)) return;
        const { amount, isDiamond } = data;
        console.log("this.isDiamondas : ", JSON.stringify(data));
        const param: SelectionTimeOutParam = {
            title: "Thông báo",
            content: `${data.fromName} mời bạn chơi đấu pet. Phí <color=#FF0000> ${amount} ${isDiamond ? 'Diamond' : 'Gold'}</color>`,
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
                Constants.showConfirm("Bạn chưa có Pet để đấu. Vui lòng hãy bắt pet", "Thông báo");
            } else if (error === PetBattleError.NOT_ENOUGH_BATTLE_PETS) {
                Constants.showConfirm("Bạn cần có đủ 3 Pet chiến đấu để thách đấu", "Thông báo");
            } else {
                Constants.showConfirm("Bạn cần cài đặt đủ kỹ năng chiến đấu cho Pet", "Thông báo");
            }
        }

        return false;
    }

    protected startAction(data) {
        let sendData = {
            targetClientId: data.from,
            action: data.action,
            amount: data.amount,
            isDiamond: data.isDiamond,
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