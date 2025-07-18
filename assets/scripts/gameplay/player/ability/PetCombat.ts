import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { UIManager } from '../../../core/UIManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { GameData } from './RPSGame';
import { ServerManager } from '../../../core/ServerManager';
import { BatllePetParam, PopupBattlePet } from '../../../PopUp/PopupBattlePet';
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
        UIManager.Instance.showYesNoPopup(null, `${data.fromName} mời bạn chơi đấu pet. Phí <color=#FF0000> ${this.fee} diamond</color>`,
            () => {
                this.startAction(data);
            },
            () => {
                this.rejectAction(data);
            },
            "Chơi", "Thôi", this.inviteTimeout)
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

    public ShowCombat(data) {
        const param: BatllePetParam = {
            data: data as GameData,
        };
        PopupManager.getInstance().openAnimPopup('PopupBattlePet', PopupBattlePet, param);
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
        PopupManager.getInstance().getPopup('PopupStartCombatPet').getComponent(PopupBattlePet).showEndCombat(data);
    }

    public stop() {
        super.stop();
    }
}