import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, EventKeyboard, input, Input, IPhysics2DContact, ITriggerEvent, KeyCode, Layers, Node } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { Interactable } from './Interactable';
const { ccclass, property } = _decorator;
@ccclass('InteractableDoor')
export class InteractableDoor extends Interactable {

    @property({ type: Node }) doorLocked: Node = null;
    private isOpen: boolean = false;
    protected async interact(playerSessionId: string) {
        if (!this.isPlayerNearby) return;
        this.isOpen = !this.isOpen;
        this.doorLocked.active = !this.isOpen;
        let popup = await PopupManager.getInstance().getPopup('InteracterLabel');
        if (popup) {
            let popupComponent = popup.getComponent(InteracterLabel);
            if (popupComponent) {
                popupComponent.UpdateText({
                    keyBoard: String.fromCharCode(this.interactKey),
                    action: this.isOpen ? "Để Đóng Cửa" : "Để Mở Cửa"
                });
            }
        }
    }
    protected override async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
            keyBoard: String.fromCharCode(this.interactKey),
            action: this.isOpen ? "Để Đóng Cửa" : "Để Mở Cửa"
        });
    }
    protected async handleEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let popup = await PopupManager.getInstance().getPopup('InteracterLabel');
        await PopupManager.getInstance().closePopup(popup.uuid);
    }

}


