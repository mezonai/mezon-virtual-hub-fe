import { _decorator, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { DraggableBase } from '../utilities/DraggableBase';
import { ItemSkill } from './ItemSkill';
import { InteractSlot, ItemSlotSkill } from './ItemSlotSkill';

const { ccclass, property } = _decorator;

@ccclass('SkillDragItem')
export class SkillDragItem extends DraggableBase {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    slotsSkillFighting: ItemSlotSkill[] = [];
    interactionMode: InteractSlot = InteractSlot.NONE;
    private clickCount = 0;
    private clickTimeout: number = 300; // thời gian giữa 2 lần click để nhận là double click (ms)
    intiData(slotsSkillFighting: ItemSlotSkill[], interactSlot: InteractSlot) {
        if (slotsSkillFighting.length <= 0) {
            this.interactionMode = InteractSlot.NONE
            return;
        }
        this.slotsSkillFighting = slotsSkillFighting;
        this.interactionMode = interactSlot;
    }

    protected onTouchMove(event: EventTouch) {
        if (this.interactionMode != InteractSlot.DRAG) return;
        const delta = event.getUIDelta();
        this.node.setPosition(this.node.position.x + delta.x, this.node.position.y + delta.y);
    }

    onTouchStart(event: EventTouch): void {
        if (this.interactionMode == InteractSlot.DRAG) {
            this.touchStart();
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
        if (this.interactionMode === InteractSlot.DOUBLE_CLICK) {
            this.handleDoubleClick();
            return;
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
            const itemSkill = this.node.getComponent(ItemSkill);
            if (!itemSkill) return;
            const slot = this.slotsSkillFighting.find(s => s.itemSkill?.idSkill === itemSkill.idSkill);
            if (slot) {
                slot.resetSkill();
            }
        }
    }

    private handleDropLogic() {
        const itemSkill = this.node.getComponent(ItemSkill);
        if (!itemSkill) {
            this.resetPosition();
            return;
        }

        for (let i = 0; i < this.slotsSkillFighting.length; i++) {
            const slot = this.slotsSkillFighting[i];
            if (this.isOverlapping(this.node, slot.node)) {
                const otherSlot = this.slotsSkillFighting[1 - i];

                const draggedId = itemSkill.idSkill;
                const draggedElement = itemSkill.element;

                const currentSlotId = slot.itemSkill?.idSkill;
                const otherSlotId = otherSlot.itemSkill?.idSkill;

                if (currentSlotId === draggedId) {
                    this.resetPosition();
                    return;
                }

                if (otherSlotId === draggedId && currentSlotId) {
                    const currentSkill = slot.itemSkill;
                    slot.setDataSlotSkill(draggedId, itemSkill.element, this.slotsSkillFighting);
                    otherSlot.setDataSlotSkill(currentSkill.idSkill, currentSkill.element, this.slotsSkillFighting);
                    this.resetPosition();
                    return;
                }

                if (otherSlotId === draggedId) {
                    otherSlot.itemSkill.node.destroy();
                    otherSlot.setItemSkill(null);
                }

                slot.setDataSlotSkill(draggedId, draggedElement, this.slotsSkillFighting);
                this.resetPosition();
                return;
            }
        }

        this.resetPosition();
    }
}


