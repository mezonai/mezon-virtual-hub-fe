import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, debug, EventKeyboard, input, Input, IPhysics2DContact, ITriggerEvent, KeyCode, Layers, Node, UI } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { Interactable } from './Interactable';
import { BubbleRotation } from '../../SlotMachine/BubbleRotation';
import { SlotMachineController } from '../../SlotMachine/SlotMachineController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { UserManager } from '../../core/UserManager';
import { PlayerController } from '../player/PlayerController';
import { Constants } from '../../utilities/Constants';
import { MapItemController } from '../MapItem/MapItemController';
const { ccclass, property } = _decorator;

@ccclass('InteractableSlotMachine')
export class InteractableSlotMachine extends MapItemController {

    protected override async interact(playerSessionId: string) {
        let panel = await PopupManager.getInstance().openPopup('UISlotMachinePopup', SlotMachineController);
        const popupComponent = panel?.getComponent(SlotMachineController);
        popupComponent?.showNoticeSpin(true);
        this.handleEndContact(null, null, null);
    }

    protected async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
            keyBoard: String.fromCharCode(this.interactKey),
            action: "Để Quay Xổ Số May Mắn",
        });
    }
}


