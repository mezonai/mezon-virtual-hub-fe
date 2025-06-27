import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, EventKeyboard, input, Input, IPhysics2DContact, ITriggerEvent, KeyCode, Layers, Node } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { Interactable } from './Interactable';
import { ServerManager } from '../../core/ServerManager';
const { ccclass, property } = _decorator;
@ccclass('InteractableDoor')
export class InteractableDoor extends Interactable {
    @property({ type: Node }) doorLocked: Node = null;
    isSet: boolean = false;
    id: string = "";
    private isOpen: boolean = false;

    protected async interact(playerSessionId: string) {
        if (!this.isPlayerNearby) return;

        this.toggleDoorState();
        this.updateDoorVisual();
        const data = {
            doorId: this.id ?? "0",
        };
        console.log("Send: ", data.doorId);
        ServerManager.instance.sendInteracDoor(data, this.isOpen);
        if (this.noticePopup) {
            await this.refreshPopup();
        }
    }

    protected override async handleBeginContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ) {
        await this.showPopup();
    }

    protected async handleEndContact(
        selfCollider: Collider2D,
        otherCollider: Collider2D,
        contact: IPhysics2DContact | null
    ) {
        super.handleEndContact(selfCollider, otherCollider, contact);
    }

    private async applyDoorData(door: { id: string, isOpen: boolean }) {
        this.id = door.id;
        this.isOpen = door.isOpen;

        this.updateDoorVisual();

        if (this.noticePopup) {
            await this.refreshPopup();
        }
    }

    async setDoor(door: { id: string, isOpen: boolean }) {
        if (!door) return;
        console.log("set Rooom: ", door);
        this.isSet = true;
        await this.applyDoorData(door);
    }

    async updateDoor(door: { id: string, isOpen: boolean }) {
        if (!door) return;
        await this.applyDoorData(door);
    }

    private toggleDoorState() {
        this.isOpen = !this.isOpen;
    }

    private updateDoorVisual() {
        if (this.doorLocked) {
            this.doorLocked.active = !this.isOpen;
        }
    }

    private async showPopup() {
        if (this.noticePopup) return;

        this.noticePopup = await PopupManager.getInstance().openPopup(
            'InteracterLabel',
            InteracterLabel,
            {
                keyBoard: String.fromCharCode(this.interactKey),
                action: this.isOpen ? 'Để Đóng Cửa' : 'Để Mở Cửa',
            }
        );
    }

    private async hidePopup() {
        if (!this.noticePopup) return;
        await PopupManager.getInstance().closePopup(this.noticePopup.node.uuid);
        this.noticePopup = null;
    }

    private async refreshPopup() {
        await this.hidePopup();
        await this.showPopup();
    }
}


