import { _decorator, Component, Node } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { InteractSlot } from './ItemSlotSkill';
import { ItemSlotPet } from './ItemSlotpet';
import { PetDragItem } from './PetDragItem';
const { ccclass, property } = _decorator;

@ccclass('ItemPlacePet')
export class ItemPlacePet extends Component {
    @property({ type: PetDragItem }) petDragItem: PetDragItem = null;
    @property({ type: [Node] }) iconPet: Node[] = [];
    currentpet: PetDTO = null;

    setData(petData: PetDTO, interactSlot: InteractSlot, slotPet: ItemSlotPet[] = [], parentSkillCanMove: Node = null) {
        this.iconPet.forEach(node => {
            node.active = (node.name === petData.name);
        });
        this.currentpet = petData;
        if (interactSlot == InteractSlot.SHOW_UI) return; // chỉ show ui thì không cần set data
        this.petDragItem.intiData(slotPet, interactSlot, parentSkillCanMove);
    }
}