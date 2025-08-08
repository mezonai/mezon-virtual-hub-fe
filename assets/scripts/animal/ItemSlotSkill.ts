import { _decorator, Component, Node, Prefab } from 'cc';
import { SkillPayload, SkillSlot } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemSkill } from './ItemSkill';
const { ccclass, property } = _decorator;
export enum InteractSlot {
    NONE,
    DRAG,
    DOUBLE_CLICK,
    SHOW_UI,
    CLICK
}
@ccclass('ItemSlotSkill')
export class ItemSlotSkill extends Component {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    @property({ type: Node }) parentSkill: Node = null;
    @property({ type: Node }) parentSkillCanMove: Node = null;
    @property({ type: Node }) lockItem: Node = null;
    itemSkill: ItemSkill = null;
    interactSlot: InteractSlot = InteractSlot.NONE;
    onSkillChanged: () => void = () => { };
    skillData: SkillSlot = null;
    public slotIndex: number = -1;

    initData(skillData: SkillSlot, interactSlot: InteractSlot, slotSkillFighting: ItemSlotSkill[] = [], onSkillChanged: () => void = () => { }) {
        if (skillData == null) {
            this.refeshSlot();
            this.setLockSkill(true);
            return;
        }
        this.setLockSkill(false);
        this.onSkillChanged = onSkillChanged;
        this.interactSlot = interactSlot;
        this.setDataSlotSkill(skillData, slotSkillFighting);
    }

    setLockSkill(isLocked: boolean) {
        if (this.lockItem != null) this.lockItem.active = isLocked
    }

    setDataSlotSkill(skillData: SkillSlot, slotSkillFighting: ItemSlotSkill[] = []) {
        this.refeshSlot();
        if (skillData == null) {
            return;
        }
        this.skillData = skillData;
        let newitemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        newitemSkill.setParent(this.parentSkill);
        this.itemSkill = newitemSkill.getComponent(ItemSkill);
        if (this.itemSkill == null) return;
        this.itemSkill.setData(skillData, this.interactSlot, slotSkillFighting, this.parentSkillCanMove);
    }

    updateSlotSkill(skillData: SkillSlot, slotSkillFighting: ItemSlotSkill[] = [], isUpdateChange = false) {
        this.setDataSlotSkill(skillData, slotSkillFighting);
        if (!isUpdateChange) return;
        this.onSkillChanged?.();
    }

    refeshSlot() {
        this.parentSkill.removeAllChildren();
        this.itemSkill = null;
        this.skillData = null;
    }


    resetSkill() {
        this.refeshSlot();
        this.onSkillChanged?.();
    }
}


