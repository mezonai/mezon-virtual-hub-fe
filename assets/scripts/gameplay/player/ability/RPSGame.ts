import { _decorator, Button, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { ActionType, PlayerInteractAction } from './PlayerInteractAction';
import { UIManager } from '../../../core/UIManager';
import { UserMeManager } from '../../../core/UserMeManager';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { ConfirmParam, ConfirmPopup } from '../../../PopUp/ConfirmPopup';
import { PopupManager } from '../../../PopUp/PopupManager';
import { TargetButton, SelectionTimeOutParam, PopupSelectionTimeOut } from '../../../PopUp/PopupSelectionTimeOut';
const { ccclass, property } = _decorator;

export interface GameData {
    action: string;
    from: string;
    to: string;
    gameKey: string;
}

@ccclass('RPSGame')
export class RPSGame extends PlayerInteractAction {
    @property({ type: Node }) resultParent: Node = null;
    @property({ type: [Node] }) slots: Node[] = [];
    @property({ type: [Node] }) actions: Node[] = [];
    @property({ type: [SpriteFrame] }) icons: SpriteFrame[] = [];
    private readonly spriteDict: Map<string, SpriteFrame> = new Map();
    private breakSpin = false;
    private readonly slotHeight = 40;
    private result: string = "";
    private autoChooseTimeout: number = 5;
    private autoChooseTimeoutId: number = 0
    private gameData: GameData = null;
    private defaultChooseValue: string = "rock"
    private fee: number = 5;

    protected override start(): void {
        super.start();
        this.actions.forEach(action => {
            action.on(Node.EventType.TOUCH_START, () => {
                this.onChooseAction(action.name);
            }, this);
        });
    }

    private onChooseAction(action: string) {
        clearTimeout(this.autoChooseTimeoutId);
        let data = {
            senderAction: action,
            gameKey: this.gameData?.gameKey,
            action: ActionType.RPS.toString(),
            from: this.gameData?.from,
            to: this.gameData?.to
        }
        this.room.send("p2pActionChoosed", data);
        this.gameData = null;
        this.toogleShowActions(false);
        this.spin();
        this.stopSpineMachine(action, false);
    }

    public override invite(): void {
        if (UserMeManager.Get) {
            if (UserMeManager.playerDiamond < this.fee) {
                const param: ConfirmParam = {
                    message: `Cần <color=#FF0000>${this.fee} diamond</color> để chơi`,
                    title: "Chú Ý",
                };
                PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
                return;
            }
        }
        super.invite();
        let data = {
            targetClientId: this.playerController.myID,
            action: this.actionType.toString()
        }
        this.room.send("p2pAction", data);
    }

    public override onBeingInvited(data: any): void {
        const param: SelectionTimeOutParam = {
            title: "Chú Ý",
            content: `${data.fromName} mời bạn chơi kéo búa bao. Phí <color=#FF0000> ${this.fee} diamond</color>`,
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

    protected override startAction(data) {
        let sendData = {
            targetClientId: data.from,
            action: data.action
        }
        this.room.send("p2pActionAccept", sendData);
        this.onStartAction(data);
    }

    public override onStartAction(data) {
        SoundManager.instance.playSound(AudioType.CountDown, this.autoChooseTimeout);
        console.log(AudioType.CountDown, this.autoChooseTimeout)
        super.onStartAction(data);
        this.gameData = data;
        this.toogleShowActions(true);
        this.autoChooseTimeoutId = setTimeout(() => {
            this.onChooseAction(this.defaultChooseValue);
        }, this.autoChooseTimeout * 1000);
    }

    private toogleShowActions(active) {
        this.actions.forEach(action => {
            action.active = active;
        });
    }

    public override rejectAction(data) {
        SoundManager.instance.playSound(AudioType.NoReward);
        let sendData = {
            targetClientId: data.from,
            action: data.action
        }
        this.room.send("p2pActionReject", sendData)
        this.onRejectAction(data);
    }

    public override onRejectAction(data) {
        super.onRejectAction(data);
    }

    public override actionResult(data) {
        super.actionResult(data);
        this.stopSpineMachine(data);
        SoundManager.instance.stopSound(AudioType.CountDown);
    }

    public spin() {
        this.breakSpin = false;
        this.resetItemSprite();
        this.resultParent.active = true;
        this.checkSpinSlot(this.slots[0], 0.1);
    }

    private stopSpineMachine(result, autoHide: boolean = true, isInterupt: boolean = false) {
        this.result = result;
        this.breakSpin = true;

        if (isInterupt)
            return;

        if (autoHide) {
            setTimeout(() => {
                this.resultParent.active = false;
            }, 2000);
        }
    }

    private resetItemSprite() {
        this.spriteDict.set("rock", this.icons[0]);
        this.spriteDict.set("paper", this.icons[1]);
        this.spriteDict.set("scissors", this.icons[2]);

        this.slots.forEach(slot => {
            slot.children.forEach(item => {
                item.getComponent(Sprite).spriteFrame = this.spriteDict.get(item.name);
            });
        });
    }

    private checkSpinSlot(slot: Node, speed: number) {
        this.spinSlot(slot, speed)
            .then((item) => {
                if (item == null) {
                    this.checkSpinSlot(slot, speed);
                }
                else {
                    item.getComponent(Sprite).spriteFrame = this.spriteDict.get(this.result);
                }
            })
    }

    private spinSlot(slot: Node, speed: number = 0.05): Promise<Node> {
        return new Promise((resolve, reject) => {
            let childDone = 0;
            slot.children.forEach(item => {
                let currentPosition = item.getPosition().y;
                tween(item)
                    .to(speed, { position: new Vec3(0, currentPosition - this.slotHeight, 0) })
                    .call(() => {
                        if (item.getPosition().y < 0) {
                            item.setPosition(new Vec3(0, 2 * this.slotHeight, 0))
                        }
                        if (this.breakSpin) {
                            if (Math.abs(item.position.y) < 5) {
                                resolve(item);
                            }
                        }
                        else {
                            childDone++;
                            if (childDone >= 1) {
                                childDone = 0;
                                resolve(null);
                            }
                        }
                    })
                    .start();
            });
        });
    }

    public override stop() {
        this.stopSpineMachine("rock", true, true);
        this.resultParent.active = false;
        this.toogleShowActions(false);
    }
}