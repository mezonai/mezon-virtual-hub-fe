import { _decorator, Component, EventTouch, instantiate, Node, Prefab, Vec3 } from 'cc';
import { DraggableBase } from '../utilities/DraggableBase';
import { ItemSkill } from './ItemSkill';
import { InteractSlot, ItemSlotSkill } from './ItemSlotSkill';
import { SkillTooltip } from '../Tooltip/SkillTooltip';

const { ccclass, property } = _decorator;

@ccclass('SkillDragItem')
export class SkillDragItem extends DraggableBase {
    slotsSkillFighting: ItemSlotSkill[] = [];
    interactionMode: InteractSlot = InteractSlot.NONE;
    skillTooltip: SkillTooltip = null;
    private clickCount = 0;
    private clickTimeout: number = 300; // thời gian giữa 2 lần click để nhận là double click (ms)

    intiData(slotsSkillFighting: ItemSlotSkill[], interactSlot: InteractSlot, skillTooltip: SkillTooltip, parentSkillCanMove: Node = null) {
        if (slotsSkillFighting.length <= 0) {
            this.interactionMode = InteractSlot.NONE
            return;
        }
        this.skillTooltip = skillTooltip;
        this.slotsSkillFighting = slotsSkillFighting;
        this.interactionMode = interactSlot;
        parentSkillCanMove != null && (this.containerNode = parentSkillCanMove);
    }

    protected onTouchMove(event: EventTouch) {
        if (this.interactionMode != InteractSlot.DRAG) return;
        this.skillTooltip.closePopup();
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
            const slot = this.slotsSkillFighting.find(s => s.itemSkill?.currentSkill?.skill_code === itemSkill?.currentSkill.skill_code);
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
                const draggedSkill = itemSkill?.currentSkill;
                if (draggedSkill == null) continue;

                const currentSlotId = slot.itemSkill?.currentSkill.skill_code;
                const otherSlotId = otherSlot.itemSkill?.currentSkill.skill_code;

                if (currentSlotId === draggedSkill.skill_code) {
                    this.resetPosition();
                    return;
                }

                if (otherSlotId === draggedSkill.skill_code && currentSlotId) {
                    const currentSkill = slot.itemSkill;
                    slot.updateSlotSkill(draggedSkill, this.slotsSkillFighting);
                    otherSlot.updateSlotSkill(currentSkill.currentSkill, this.slotsSkillFighting, true);
                    this.resetPosition();
                    return;
                }

                if (otherSlotId === draggedSkill.skill_code) {
                    otherSlot.resetSkill();
                }

                slot.updateSlotSkill(draggedSkill, this.slotsSkillFighting, true);
                this.resetPosition();
                return;
            }
        }

        this.resetPosition();
    }
}


