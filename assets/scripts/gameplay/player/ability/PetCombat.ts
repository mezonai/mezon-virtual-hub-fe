import { _decorator } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { UIManager } from '../../../core/UIManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupStartCombatPet } from '../../../PopUp/PopupStartCombatPet';
import { GameData } from './RPSGame';
import { UserMeManager } from '../../../core/UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('PetCombat')
export class PetCombat extends PlayerInteractAction {
    private gameData: GameData = null;
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
        this.gameData = data;
    }

    public ShowCombat(data) {
        PopupManager.getInstance().openAnimPopup('PopupStartCombatPet', PopupStartCombatPet, data);
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
        PopupManager.getInstance().getPopup('PopupStartCombatPet').getComponent(PopupStartCombatPet).showEndCombat(data);
    }

    public stop() {
        super.stop();
    }
}