import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, EventKeyboard, input, Input, IPhysics2DContact, ITriggerEvent, KeyCode, Layers, Node, Rect, UITransform, Vec3 } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { Interactable } from './Interactable';
import { ServerManager } from '../../core/ServerManager';
import { UserManager } from '../../core/UserManager';
const { ccclass, property } = _decorator;
@ccclass('InteractableDoor')
export class InteractableDoor extends Interactable {
    @property({ type: Node }) doorLocked: Node = null;
    isSet: boolean = false;
    id: string = "";
    private isOpen: boolean = false;
    private offsetPlayer: number = 30;

    protected async interact(playerSessionId: string) {
        if (!this.isPlayerNearby) return;

        this.toggleDoorState();
        this.updateDoorVisual();
        if (!this.isOpen) this.checkPlayerStandingOnDoor();
        const data = {
            doorId: this.id ?? "0",
        };
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
        this.isSet = true;
        await this.applyDoorData(door);
    }

    async updateDoor(door: { id: string, isOpen: boolean }) {
        if (!door) return;
        await this.applyDoorData(door);
        if (!this.isOpen) this.checkPlayerStandingOnDoor();
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

    async checkPlayerStandingOnDoor() {
        const playerNode = UserManager.instance.GetMyClientPlayer?.node;
        if (!playerNode || !this.doorLocked) return;

        const playerUI = playerNode.getComponent(UITransform);
        const doorUI = this.doorLocked.getComponent(UITransform);
        if (!playerUI || !doorUI) return;

        const playerBox = this.getWorldRect(playerNode, playerUI);
        const doorBox = this.getWorldRect(this.doorLocked, doorUI);

        if (!doorBox.intersects(playerBox)) return;

        const doorMidY = doorBox.y + doorBox.height / 2;
        const currentPos = playerNode.worldPosition;
        let newPos: Vec3;

        if (playerBox.yMin >= doorMidY) {
            // Đang đứng nửa trên → đẩy lên
            const offsetY = doorBox.yMax - playerBox.yMin;
            newPos = new Vec3(currentPos.x, currentPos.y + offsetY - 5, currentPos.z);
        } else {
            // Đang đứng nửa dưới → đẩy xuống
            const offsetY = playerBox.yMax - doorBox.y;
            newPos = new Vec3(currentPos.x, currentPos.y - offsetY + 10, currentPos.z);
        }
        playerNode.setWorldPosition(newPos);
        UserManager.instance?.GetMyClientPlayer?.moveAbility?.updateAction("idle");
    }

    getWorldRect(node: Node, uiTransform: UITransform): Rect {
        const worldPos = node.worldPosition;
        const width = uiTransform.width;
        const height = uiTransform.height;
        return new Rect(
            worldPos.x - width / 2,
            worldPos.y - height / 2,
            width,
            height
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

    private encodeMoveData(x: number, y: number, sX: number, anim: string): ArrayBuffer {
        const animBytes = new TextEncoder().encode(anim);
        const buffer = new ArrayBuffer(5 + animBytes.length);
        const view = new DataView(buffer);

        view.setInt16(0, x, true);
        view.setInt16(2, y, true);
        view.setInt8(4, sX);

        new Uint8Array(buffer, 5).set(animBytes);
        return buffer;
    }
}


