import { _decorator, Component, Node, Prefab } from 'cc';
import { AnimalElement } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemSkill } from './ItemSkill';
import { SkillData } from './Skills';
const { ccclass, property } = _decorator;
export enum InteractSlot {
    NONE,
    DRAG,
    DOUBLE_CLICK,
    SHOW_UI,
}
@ccclass('ItemSlotSkill')
export class ItemSlotSkill extends Component {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    @property({ type: Node }) parentSkill: Node = null;
    itemSkill: ItemSkill = null;
    interactSlot: InteractSlot = InteractSlot.NONE

    initData(skillData: SkillData, interactSlot: InteractSlot, slotSkillFighting: ItemSlotSkill[] = []) {
        this.interactSlot = interactSlot;
        if (skillData == null) return;
        this.setDataSlotSkill(skillData, slotSkillFighting);
    }

    setDataSlotSkill(skillData: SkillData, slotSkillFighting: ItemSlotSkill[] = []) {
        this.resetSkill();
        let newitemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        newitemSkill.setParent(this.parentSkill);
        this.itemSkill = newitemSkill.getComponent(ItemSkill);
        if (this.itemSkill != null) {
            this.itemSkill.setData(skillData, this.interactSlot, slotSkillFighting);
        }    
    }

    setItemSkill(itemSkill: ItemSkill) {
        this.itemSkill = itemSkill
    }

    resetSkill() {
        this.parentSkill.removeAllChildren();
        this.itemSkill = null;
    }
}


