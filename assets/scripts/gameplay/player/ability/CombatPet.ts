import { _decorator, Component, Node } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { UIManager } from '../../../core/UIManager';
import { UIID } from '../../../ui/enum/UIID';
import { UserMeManager } from '../../../core/UserMeManager';
import { PopupManager } from '../../../PopUp/PopupManager';
import { PopupOwnedAnimals } from '../../../PopUp/PopupOwnedAnimals';
import { PopupStartCombatPet } from '../../../PopUp/PopupStartCombatPet';
const { ccclass, property } = _decorator;

@ccclass('CombatPet')
export class CombatPet extends PlayerInteractAction {
    private fee: number = 5;

    protected onLoad() {
        this.actionType = ActionType.CombatPet;
    }

    protected override invite() {
         super.invite();
        let data = {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString()
        }
        this.room.send("p2pAction", data);
    }

    public onBeingInvited(data) {
        SoundManager.instance.playSound(AudioType.Notice);
        UIManager.Instance.showYesNoPopup(null, `${data.fromName} mời bạn chơi đấu pet.</color>`,
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

    public ShowCombat() {
        PopupManager.getInstance().openAnimPopup('PopupStartCombatPet', PopupStartCombatPet, { message: ""});
    }

    public rejectAction(data) {
    }

    public onRejectAction(data) {
        super.onRejectAction(data);
    }

    public actionResult(data) {
        super.actionResult(data);
    }

    public stop() {
        super.stop();
    }
}