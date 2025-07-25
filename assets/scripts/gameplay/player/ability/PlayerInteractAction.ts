import { _decorator, Button, Component, Enum, Node } from 'cc';
import { Ability } from './Ability';
const { ccclass, property } = _decorator;

export enum ActionType {
    RPS = 1,
    Punch = 2,
    SendCoin = 3,
    CatchUser = 4,
    PetCombat = 5
}

@ccclass('PlayerInteractAction')
export class PlayerInteractAction extends Ability {
    public isUsing: boolean = false;
    @property({type: Enum(ActionType)}) actionType: ActionType = ActionType.RPS;
    @property({ type: Button }) actionButton: Button = null;

    protected start(): void {
        this.actionButton.addAsyncListener(async () => {
            await this.invite();
        });
        //this.actionButton.node.on(Node.EventType.TOUCH_START, this.invite, this);
    }

    public controller = null;
    protected inviteTimeout: number = 5;

    protected invite() {
        this.isUsing = true;
        this.controller.toggleShowUI(false);
    }

    public onBeingInvited(data) {

    }

    protected startAction(data) {}
    public onStartAction(data) {
        this.isUsing = true;
    }
    public rejectAction(data) {}
    public onRejectAction(data) {
        this.isUsing = false;
    }
    public actionResult(data) {
        this.isUsing = false;
    }

    public stop() {
        this.isUsing = false;
    }
}