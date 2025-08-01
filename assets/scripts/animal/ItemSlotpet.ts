import { Prefab } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { InteractSlot } from './ItemSlotSkill';
import { PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemPlacePet } from './ItemPlacePet';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemSlotPet')
export class ItemSlotPet extends Component {
    @property({ type: Prefab }) itemSkillPrefab: Prefab = null;
    @property({ type: Node }) parentSkill: Node = null;
    @property({ type: Node }) parentSkillCanMove: Node = null;
    @property({ type: Node }) lockItem: Node = null;
    itemPlacePet: ItemPlacePet = null;
    interactSlot: InteractSlot = InteractSlot.NONE
    private onClickCallback: () => void = null;

    initData(petData: PetDTO, interactSlot: InteractSlot, slotPlacePet: ItemSlotPet[] = [], onClickCallback: () => void = null) {
        console.log(petData);
        this.interactSlot = interactSlot;
        this.onClickCallback = onClickCallback;
        this.resetpet();

        if (petData == null) {
            this.handleEmptySlot();
            return;
        }

        this.setupPetPrefab(petData, slotPlacePet);
    }

    private handleEmptySlot() {
        if (this.interactSlot !== InteractSlot.CLICK) {
            return;
        }

        const emptyItem = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        emptyItem.setParent(this.parentSkill);
        emptyItem.position = Vec3.ZERO;

        const emptyItemPlace = emptyItem.getComponent(ItemPlacePet);
        if (emptyItemPlace && this.onClickCallback) {
            emptyItem.on(Node.EventType.TOUCH_END, () => {
                this.onClickCallback?.();
            }, this);
        }
    }

    private setupPetPrefab(petData: PetDTO, slotPlacePet: ItemSlotPet[]) {
        let newItemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        newItemSkill.setParent(this.parentSkill);
        newItemSkill.position = Vec3.ZERO;

        this.itemPlacePet = newItemSkill.getComponent(ItemPlacePet);
        if (this.itemPlacePet != null) {
            this.itemPlacePet.setData(petData, this.interactSlot, slotPlacePet, this.parentSkillCanMove);

            if (this.interactSlot === InteractSlot.CLICK && this.onClickCallback) {
                this.itemPlacePet.node.on(Node.EventType.TOUCH_END, () => {
                    this.onClickCallback?.();
                }, this);
            }
        }
    }

    setDataSlotSkill(skillData: PetDTO, slotSkillFighting: ItemSlotPet[] = []) {
        this.resetpet();
        let newitemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemSkillPrefab.name);
        newitemSkill.setParent(this.parentSkill);
        this.itemPlacePet = newitemSkill.getComponent(ItemPlacePet);
        newitemSkill.position = Vec3.ZERO;
        if (this.itemPlacePet != null) {
            this.itemPlacePet.setData(skillData, this.interactSlot, slotSkillFighting, this.parentSkillCanMove);
            if (this.interactSlot === InteractSlot.CLICK && this.onClickCallback) {
                this.itemPlacePet.node.on(Node.EventType.TOUCH_END, () => {
                    this.onClickCallback?.();
                }, this);
            }
        }
    }

    setItempet(item: ItemPlacePet | null) {
        this.itemPlacePet = item;
        if (item) {
            item.node.setParent(this.parentSkill);
            item.node.setPosition(0, 0, 0);
        }
    }

    resetpet() {
        this.parentSkill.removeAllChildren();
        this.itemPlacePet = null;
    }
}