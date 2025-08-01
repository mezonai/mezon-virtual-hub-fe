import { _decorator, Node } from 'cc';
import { DraggableBase } from '../utilities/DraggableBase';
import { Prefab } from 'cc';
import { InteractSlot } from './ItemSlotSkill';
import { EventTouch } from 'cc';
import { Vec3 } from 'cc';
import { ItemSlotPet } from './ItemSlotpet';
import { ItemPlacePet } from './ItemPlacePet';
const { ccclass, property } = _decorator;

@ccclass('PetDragItem')
export class PetDragItem extends DraggableBase {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    slotsPlacePet: ItemSlotPet[] = [];
    interactionMode: InteractSlot = InteractSlot.NONE;

    intiData(slotsPetPlace: ItemSlotPet[], interactSlot: InteractSlot, parentSkillCanMove: Node = null) {
        if (slotsPetPlace.length <= 0) {
            this.interactionMode = InteractSlot.NONE;
            return;
        }
        this.slotsPlacePet = slotsPetPlace;
        this.interactionMode = interactSlot;
        parentSkillCanMove != null && (this.containerNode = parentSkillCanMove);
    }

    protected onTouchMove(event: EventTouch) {
        if (this.interactionMode != InteractSlot.DRAG) return;
        const delta = event.getUIDelta();
        const tryPos = new Vec3(
            this.node.position.x + delta.x,
            this.node.position.y + delta.y,
            this.node.position.z
        );
        const clampedPos = this.clampToContainer(tryPos);
        this.node.setPosition(clampedPos);
    }

    onTouchStart(event: EventTouch): void {
        if (this.interactionMode == InteractSlot.DRAG) {
            this.touchStart();
            this.node.setSiblingIndex(this.containerNode.parent.children.length - 1);
        }
    }

    protected onTouchCancel(event: EventTouch): void {
        if (this.interactionMode != InteractSlot.DRAG) return;
        super.onTouchCancel(event);
    }

    onTouchEnd(event: EventTouch): void {
        if (this.interactionMode === InteractSlot.DRAG) {
            this.handleDropLogic();
            return;
        }
    }

    private handleDropLogic() {
        const itemPlacePet = this.node.getComponent(ItemPlacePet);
        if (!itemPlacePet) {
            this.resetPosition();
            return;
        }

        const draggedPet = itemPlacePet.currentpet;
        if (!draggedPet) {
            this.resetPosition();
            return;
        }

        for (const targetSlot of this.slotsPlacePet) {
            if (this.isOverlapping(this.node, targetSlot.node)) {
                const targetItem = targetSlot.itemPlacePet;
                const originalSlot = this.slotsPlacePet.find(s => s.itemPlacePet?.currentpet?.id === draggedPet.id);

                if (originalSlot === targetSlot) {
                    this.resetPosition();
                    return;
                }

                if (targetItem && originalSlot) {
                    const originItem = originalSlot.itemPlacePet;

                    originalSlot.setItempet(targetItem); 
                    targetSlot.setItempet(originItem);
                    this.resetPosition();
                    return;
                }

                if (!targetItem && originalSlot) {
                    originalSlot.setItempet(null);
                    targetSlot.setItempet(itemPlacePet);
                    this.resetPosition();
                    return;
                }

                break;
            }
        }

        this.resetPosition();
    }
}