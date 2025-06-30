import { _decorator, Button, Component, Node } from 'cc';
import { PopupStartCombatPet } from '../../PopUp/PopupStartCombatPet';
const { ccclass, property } = _decorator;

@ccclass('HandleCombat')
export class HandleCombat extends Component {
    @property({ type: Button }) giveupBtn: Button = null;
    @property({ type: Button }) fightBtn: Button = null;
    @property({ type: Button }) PetBtn: Button = null;
    @property({ type: PopupStartCombatPet }) popupStartCombatPet: PopupStartCombatPet = null;

    protected start(): void {
        this.giveupBtn.node.on(Node.EventType.TOUCH_START, this.HandleGiveUp, this);
        this.fightBtn.node.on(Node.EventType.TOUCH_START, this.HandleFight, this);
        this.PetBtn.node.on(Node.EventType.TOUCH_START, this.HandleShowPet, this);
    }

    HandleGiveUp(){
        this.popupStartCombatPet.cancelCombat();
    }

    HandleFight(){
        //
    }

    HandleShowPet(){
        //
    }
}


