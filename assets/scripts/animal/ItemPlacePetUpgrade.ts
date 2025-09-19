import { _decorator, Component, Node, Animation } from 'cc';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { InteractSlot } from './ItemSlotSkill';
import { PetUpgradeDragItem } from './PetUpgradeDragItem';
import { Color } from 'cc';
import { Sprite } from 'cc';
import { PetsDesignIcon } from './PetsDesignIcon';
import { ItemAnimalSlotDrag } from './ItemAnimalSlotDrag';
import { PetSlotUIHelper } from './PetSlotUIHelper';
const { ccclass, property } = _decorator;

@ccclass('ItemPlacePetDrag')
export class ItemPlacePetDrag extends Component {
    @property({ type: PetUpgradeDragItem }) petUpgradeDragItem: PetUpgradeDragItem = null;
    @property({ type: PetsDesignIcon }) petImage: PetsDesignIcon = null;
    @property({ type: Node }) slotNode: Node = null;
    @property(PetSlotUIHelper) petUIHelper: PetSlotUIHelper = null;
    currentPet: PetDTO = null;

    setData(petData: PetDTO, interactSlot: InteractSlot, slotPet: ItemAnimalSlotDrag[] = [], parentSkillCanMove: Node = null) {
        this.petImage.setActivePetByName(petData.name);
        this.petUIHelper.setBorder(petData);
        this.currentPet = petData;
        if (interactSlot == InteractSlot.SHOW_UI) return; // chỉ show ui thì không cần set data
        this.petUpgradeDragItem.intiData(slotPet, interactSlot, parentSkillCanMove);
    }
}