import { _decorator, Node, EventTouch, Vec3, UITransform } from "cc";
import { DraggableBase } from "../utilities/DraggableBase";
import { Prefab } from "cc";
import { InteractSlot } from "./ItemSlotSkill";
import { ItemPlacePetDrag } from "./ItemPlacePetUpgrade";
import { ConfirmParam, ConfirmPopup } from "../PopUp/ConfirmPopup";
import { PopupManager } from "../PopUp/PopupManager";
import { PetDTO } from "../Model/PetDTO";
import { ItemAnimalSlotDrag } from "./ItemAnimalSlotDrag";
const { ccclass, property } = _decorator;

@ccclass("PetUpgradeDragItem")
export class PetUpgradeDragItem extends DraggableBase {
    @property({ type: Prefab }) itemPetDragPrefab: Prefab = null;
    slotsPlacePet: ItemAnimalSlotDrag[] = [];
    interactionMode: InteractSlot = InteractSlot.NONE;
    private isDragging = false;
    private dragThreshold = 10;
    private originalParent: Node = null;
    private originalPos: Vec3 = null;
    private dragStartPos: Vec3 = null;
    private clickCount = 0;
    private clickTimeout: number = 300; // thời gian giữa 2 lần click để nhận là double click (ms)
    onSelectedPet: () => void = () => {};

    intiData(
        slotsPetPlace: ItemAnimalSlotDrag[],
        interactSlot: InteractSlot,
        parentPetCanMove: Node = null,
        onSelectedPet: () => void = () => {}
    ) {
        if (!slotsPetPlace || slotsPetPlace.length <= 0) {
            this.interactionMode = InteractSlot.NONE;
            return;
        }
        this.interactionMode = interactSlot;
        this.onSelectedPet = onSelectedPet;
        this.slotsPlacePet = slotsPetPlace;
        if (parentPetCanMove) this.containerNode = parentPetCanMove;
    }

    onTouchStart(event: EventTouch): void {
        if (this.interactionMode == InteractSlot.DRAG) {
            const uiPos = event.getUILocation();
            const localPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(uiPos.x, uiPos.y, 0));
            this.dragStartPos = localPos.clone();
            this.isDragging = false;
            this.originalParent = this.node.parent;
            this.originalPos = this.node.position.clone();
            if (this.containerNode) {
                const worldPos = this.node.worldPosition.clone();
                this.node.parent = this.containerNode;
                const newLocalPos = this.containerNode.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
                this.node.setPosition(newLocalPos);
            }
            this.touchStart();
        }
    }

    protected onTouchMove(event: EventTouch) {
        if (this.interactionMode != InteractSlot.DRAG) return;

        const uiPos = event.getUILocation();
        const localPos = this.node.parent
            .getComponent(UITransform)
            .convertToNodeSpaceAR(new Vec3(uiPos.x, uiPos.y, 0));

        if (!this.isDragging && this.dragStartPos) {
            const delta = localPos.clone().subtract(this.dragStartPos);
            if (
                Math.abs(delta.x) > this.dragThreshold &&
                Math.abs(delta.x) > Math.abs(delta.y)
            ) {
                this.isDragging = true;
            } else {
                return; // still scrolling
            }
        }

        if (this.isDragging) {
            this.node.setPosition(localPos);
        }
    }

    protected onTouchCancel(event: EventTouch): void {
        if (this.interactionMode != InteractSlot.DRAG) return;
        super.onTouchCancel(event);
        this.restoreParent();
    }

    onTouchEnd(event: EventTouch): void {
        if (this.interactionMode === InteractSlot.DOUBLE_CLICK) {
            this.handleDoubleClick();
            return;
        }
        if (this.interactionMode === InteractSlot.DRAG) {
            if (this.isDragging) {
                this.handleDropLogic();
            }
            this.restoreParent();
        }
    }

    private handleDoubleClick() {
        this.clickCount++;
        // Nếu click lần đầu thì bắt đầu đếm
        if (this.clickCount === 1) {
            setTimeout(() => {
                this.clickCount = 0; // reset nếu không đủ 2 lần click trong thời gian cho phép
            }, this.clickTimeout);
        }

        // Nếu click lần thứ hai trong thời gian cho phép => double click
        else if (this.clickCount === 2) {
            this.clickCount = 0;

            const itemPet = this.node.getComponent(ItemPlacePetDrag);
            if (!itemPet) return;
            const slot = this.slotsPlacePet.find(
                s => s && s.itemPlacePetUpgrade?.currentPet?.id.toString() === itemPet?.currentPet?.id.toString()
            );
            if (slot) {
                slot.refeshSlot();
            }
        }
    }

    private restoreParent() {
        if (this.originalParent) {
            this.node.parent = this.originalParent;
            this.node.setPosition(this.originalPos);
            this.onSelectedPet?.();
            this.originalParent = null;
        }
        this.isDragging = false;
        this.dragStartPos = null;
    }

    private handleDropLogic() {
        const itemPlacePetUpgrade = this.node.getComponent(ItemPlacePetDrag);
        const draggedPet = itemPlacePetUpgrade?.currentPet;
        if (!itemPlacePetUpgrade || !draggedPet || this.checkExistingPet(draggedPet) || this.handleDropOnSlot(draggedPet, itemPlacePetUpgrade)) {
            this.resetPosition();
            return;
        }
    }

    private checkExistingPet(draggedPet: PetDTO): boolean {
        const existingSlot = this.slotsPlacePet.find(
            slot =>
                slot?.itemPlacePetUpgrade?.currentPet?.id === draggedPet.id &&
                !this.isOverlapping(this.node, slot.node)
        );

        if (existingSlot) {
            const slotIndex = this.slotsPlacePet.indexOf(existingSlot)+1;
            const param: ConfirmParam = {
                message: `Pet ${draggedPet.name} này đã tồn tại ở slot ${slotIndex}!`,
                title: "Chú ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            return true;
        }

        return false;
    }

    private handleDropOnSlot(draggedPet: PetDTO, itemPlacePetUpgrade: ItemPlacePetDrag): boolean {
        const targetSlot = this.slotsPlacePet.find(slot => slot && this.isOverlapping(this.node, slot.node));
        if (!targetSlot) return false;

        if (!targetSlot.itemPlacePetUpgrade?.currentPet) {
            targetSlot.updateSlotPet(draggedPet, this.slotsPlacePet, InteractSlot.DOUBLE_CLICK);
        } else {
            targetSlot.UpdateSlotExistedPet(draggedPet,InteractSlot.DOUBLE_CLICK);
        }
        targetSlot.onShowDetail?.(targetSlot, draggedPet); 

        return true;
    }
}
