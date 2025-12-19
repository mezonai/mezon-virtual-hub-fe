import { _decorator, CCFloat, Component, EventKeyboard, Animation, AudioSource } from 'cc';
import { MapItemController } from './MapItemController';
import { ServerManager } from '../../core/ServerManager';
import { UserManager } from '../../core/UserManager';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { InteractMessageMapping, MapItemAction } from './MapItemEnum';
import { SoundManager } from '../../core/SoundManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { sys } from 'cc';
import { UIMobileManager } from '../Mobile/UIMobileManager';
const { ccclass, property } = _decorator;

@ccclass('GoKart')
export class GoKart extends MapItemController {
    @property({ type: CCFloat }) moveSpeedInc: number = 100;
    @property({ type: Animation }) animation: Animation = null;
    @property({ type: AudioSource }) audioSource: AudioSource = null;
    private volumn: number = 0;
    protected start(): void {
        this.animation.play("idle");
        UIMobileManager.instance?.node.on(
            EVENT_NAME.ON_CLICK_BUTTON_B_MOBILE,
            this.getOffKart,
            this
        );
    }

    private onVolumnChange(volumn) {
        this.audioSource.volume = volumn / 3;
    }

    protected override async interact(playerSessionId: string) {
        super.interact(playerSessionId);
        this.animation.play("run");
    }

    public override async useItem(playerSessionId: string) {
        // if (UserManager.instance?.GetMyClientPlayer == null) return;
        super.useItem(playerSessionId);
        if (this.currentPlayer) {
            this.currentPlayer.addMoveSpeed(this.moveSpeedInc);
            this.currentPlayer.moveAbility.setColliderDetectOffset(2);
            this.currentPlayer.CanUpdateAnim = false;
            if (this.tempPopup == null && UserManager.instance?.GetMyClientPlayer != null && this.currentPlayer.myID == UserManager.instance.GetMyClientPlayer.myID) {
                this.tempPopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
                    keyBoard: this.interactKey,
                    action: InteractMessageMapping[this.type + MapItemAction.USING]
                });
            }
        }
    }

    public ResetSpeedPlayer() {
        if (!UserManager.instance) return;
        let canAct = this.currentPlayer?.myID == UserManager.instance.GetMyClientPlayer?.myID;
        this.currentPlayer.addMoveSpeed(-this.moveSpeedInc);
        this.currentPlayer.moveAbility.setColliderDetectOffset(1);
        this.currentPlayer.CanUpdateAnim = true;
        ServerManager.instance.playerUseItem(this.myID, "", this.currentPlayer.node.position.x, this.currentPlayer.node.position.y);
        this.animation.play("idle");
    }

    protected override onKeyDown(event: EventKeyboard): boolean {
        if (!UserManager.instance || sys.isMobile) return;

        let canAct = this.currentPlayer?.myID == UserManager.instance.GetMyClientPlayer?.myID;
        if (super.onKeyDown(event) && canAct) {
            this.getOffKart();

            return true;
        }

        return false;
    }

    getOffKart() {
        if (this.currentPlayer) {
            this.currentPlayer.addMoveSpeed(-this.moveSpeedInc);
            this.currentPlayer.moveAbility.setColliderDetectOffset(1);
            this.currentPlayer.CanUpdateAnim = true;
            ServerManager.instance.playerUseItem(this.myID, "", this.currentPlayer.node.position.x, this.currentPlayer.node.position.y);
            this.animation.play("idle");
        }

    }

    onDestroy(): void {
        UIMobileManager.instance?.node.off(
            EVENT_NAME.ON_CLICK_BUTTON_B_MOBILE,
            this.getOffKart,
            this
        );
    }
}