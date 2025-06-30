import { _decorator, CCFloat, Node, tween, Vec3 } from 'cc';
import { Ability } from './Ability';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { UIManager } from '../../../core/UIManager';
import { RPSGame } from './RPSGame';
import { CombatPet } from './CombatPet';
const { ccclass, property } = _decorator;

@ccclass('P2PInteractManager')
export class P2PInteractManager extends Ability {
    @property({ type: Node }) actionButtonParent: Node = null;
    @property({ type: [PlayerInteractAction] }) actionButtons: PlayerInteractAction[] = [];
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: CCFloat }) interactDistance: number = 60;
    private lastActionTime: number = 0;
    private interactDelay: number = 1000;

    private get CanShowUI(): boolean {
        if (this.InteractTarget != null) {
            return Math.abs(Vec3.distance(this.InteractTarget.worldPosition, this.node.worldPosition)) <= this.interactDistance;
        }

        return false;
    }

    public override init(sessionId, playerController, room) {        
        super.init(sessionId, playerController, room);
        if (!this.isMyClient) {
            this.targetClicker.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
        this.toggleShowUI(false);

        console.log("action.node.name ---: ", this.actionButtons.length);
        this.actionButtons.forEach(action => {
            console.log("action.node.name: ",action.actionType);
            action.init(sessionId, playerController, room);
            action.controller = this;
        });
    }

    protected onDisable() {
        this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(event) {
        if (this.CanShowUI) {
            if (Date.now() - this.lastActionTime > this.interactDelay) {
                this.lastActionTime = Date.now()
                this.toggleShowUI(!this.actionButtonParent.active);
            }
        }
        else {
            let content = "Lại gần hơn để tương tác với tôi!!!";
            this.playerController.zoomBubbleChat(content);
        }
    }

    public onActionFromOther(data) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == data.action) {
                action.onBeingInvited(data);
                break;
            }
        }
    }

    public onAcceptedActionFromOther(data) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == data.action) {
                action.onStartAction(data);
                UIManager.Instance.hideMessageTimeout();
                break;
            }
        }
    }

    public onRejectedActionFromOther(data) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == data.action) {
                action.onRejectAction(data);
                UIManager.Instance.hideMessageTimeout();
                break;
            }
        }
    }

    public onCallbackAction(data) {
        if (data.action == ActionType.RPS) {
            UIManager.Instance.showMessageTimeout(`Chờ ${data.toName} phản hồi`, 5);
        }
        else if (data.action == ActionType.SendCoin || data.action == ActionType.CatchUser) {
            this.showActionResult(data);
        }
    }

    public toggleShowUI(show: boolean) {
        this.lastActionTime = Date.now()
        this.actionButtonParent.active = show;
        if (show) {
            this.actionButtonParent.scale = Vec3.ZERO;
            tween(this.actionButtonParent)
                .to(0.2, { scale: Vec3.ONE })
                .start();
        }
    }

    protected update(dt: number): void {
        if (this.actionButtonParent.active) {
            if (!this.CanShowUI) {
                this.toggleShowUI(false);
            }
        }
    }

    public showSpinRPS() {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == ActionType.RPS.toString()) {
                (action as RPSGame).spin()
                break;
            }
        }
    }

    public showCombat() {
        for (const action of this.actionButtons) {
            console.log("action.actionType.toString(): "+action.actionType.toString());
            if (action.actionType.toString() == ActionType.CombatPet.toString()) {
                (action as CombatPet).ShowCombat()
                break;
            }
        }
    }
    
    public showSpinResultRPS(result) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == ActionType.RPS.toString()) {
                action.actionResult(result)
                break;
            }
        }
    }

    public showActionResult(data) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == data.action) {
                action.actionResult(data)
                break;
            }
        }
    }

    public stopP2pAction(data) {
        for (const action of this.actionButtons) {
            if (action.actionType.toString() == data.action) {
                action.stop();
                break;
            }
        }
    }
}