import { _decorator, Component, Node, Prefab } from 'cc';
import { AnimalElement } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemSkill } from './ItemSkill';
const { ccclass, property } = _decorator;
export enum InteractSlot {
    NONE,
    DRAG,
    CLICK,
    DOUBLE_CLICK,
}
@ccclass('ItemSlotSkill')
export class ItemSlotSkill extends Component {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    @property({ type: Node }) parentSkill: Node = null;
    itemSkill: ItemSkill = null;
    interactSlot: InteractSlot = InteractSlot.NONE

    initData(idSkill: string, element: AnimalElement, interactSlot: InteractSlot, slotSkillFighting: ItemSlotSkill[] = []) {
        this.interactSlot = interactSlot;
        if (idSkill == "") return;
        this.setDataSlotSkill(idSkill, element, slotSkillFighting);
    }

    setDataSlotSkill(idSkill: string, element: AnimalElement, slotSkillFighting: ItemSlotSkill[] = []) {
        this.resetSkill();
        let newitemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        newitemSkill.setParent(this.parentSkill);
        this.itemSkill = newitemSkill.getComponent(ItemSkill);
        if (this.itemSkill == null) return;
        this.itemSkill.setData(idSkill, element, this.interactSlot, slotSkillFighting);
    }

    setItemSkill(itemSkill: ItemSkill) {
        this.itemSkill = itemSkill
    }

    resetSkill() {
        this.parentSkill.removeAllChildren();
        this.itemSkill = null;
    }
}


