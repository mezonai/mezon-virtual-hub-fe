import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { UIManager } from '../../../core/UIManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { GameData } from './RPSGame';
import { ServerManager } from '../../../core/ServerManager';
import { BatllePetParam, PopupBattlePet } from '../../../PopUp/PopupBattlePet';
import { PopupSelectionTimeOut, SelectionTimeOutParam, TargetButton } from '../../../PopUp/PopupSelectionTimeOut';
const { ccclass, property } = _decorator;

@ccclass('PetCombat')
export class PetCombat extends PlayerInteractAction {
    private fee: number = 5;
    protected onLoad() {
        this.actionType = ActionType.PetCombat;
    }

    protected override invite() {
        // UIManager.Instance.showYesNoPopup(null, `mời bạn chơi đấu pet.</color>`,
        //     () => {
        //         PopupManager.getInstance().openAnimPopup('PopupStartCombatPet', PopupStartCombatPet, { message: "" });
        //     },
        //     () => {
        //     },
        //     "Chơi", "Thôi", this.inviteTimeout)
        // if (UserMeManager.Get) {
        //     if (UserMeManager.playerDiamond < this.fee) {
        //         UIManager.Instance.showNoticePopup(null, `Cần <color=#FF0000>${this.fee} diamond</color> để chơi`)
        //         return;
        //     }
        // }
        super.invite();
        let data = {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString()
        }
        this.room.send("p2pAction", data);
    }

    public onBeingInvited(data) {
        SoundManager.instance.playSound(AudioType.Notice);
        const param: SelectionTimeOutParam = {
            title: "Thông Báo",
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