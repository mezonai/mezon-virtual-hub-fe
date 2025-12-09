import { _decorator, Collider2D, IPhysics2DContact } from "cc";
import { PopupManager } from "../../PopUp/PopupManager";
import { InteracterLabel } from "../../PopUp/InteracterLabel";
import {
    SlotMachineController,
    SlotmachineParam,
} from "../../SlotMachine/SlotMachineController";
import { MapItemController } from "../MapItem/MapItemController";
const { ccclass, property } = _decorator;

@ccclass("InteractableSlotMachine")
export class InteractableSlotMachine extends MapItemController {
    protected override async interact(playerSessionId: string) {
        if (this.isOpenPopUp) return;
        this.isOpenPopUp = true;

        const param: SlotmachineParam = {
            onActionClose: () => {
                this.isOpenPopUp = false;
            },
        };
        await PopupManager.getInstance().openPopup( "UISlotMachinePopup", SlotMachineController, param);
        this.handleEndContact(null, null, null);
    }

    protected async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
            keyBoard: this.interactKey,
            action: "Để Quay Xổ Số May Mắn",
        });
    }
}
