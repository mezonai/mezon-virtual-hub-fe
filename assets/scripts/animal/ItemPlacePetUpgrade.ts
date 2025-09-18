import { _decorator, Component, Node, Animation } from 'cc';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { InteractSlot } from './ItemSlotSkill';
import { PetUpgradeDragItem } from './PetUpgradeDragItem';
import { Color } from 'cc';
import { Sprite } from 'cc';
import { PetsDesignIcon } from './PetsDesignIcon';
import { ItemAnimalSlotDrag } from './ItemAnimalSlotDrag';
const { ccclass, property } = _decorator;

@ccclass('ItemPlacePetDrag')
export class ItemPlacePetDrag extends Component {
    @property({ type: PetUpgradeDragItem }) petUpgradeDragItem: PetUpgradeDragItem = null;
    @property({ type: PetsDesignIcon }) petImage: PetsDesignIcon = null;
    @property({ type: Animation }) animator: Animation = null;
    @property({ type: Node }) slotNode: Node = null;
    @property({ type: [Color] }) colorBorder: Color[] = [];
    @property(Sprite) borderSprite: Sprite;
    currentPet: PetDTO = null;

    setData(petData: PetDTO, interactSlot: InteractSlot, slotPet: ItemAnimalSlotDrag[] = [], parentSkillCanMove: Node = null) {
        this.petImage.setActivePetByName(petData.name);
        if (petData.pet.rarity == AnimalRarity.LEGENDARY) {
            this.animator.node.active = true;
            this.borderSprite.color = this.colorBorder[0];
            this.playAnimBorder(petData.pet.rarity);
        }
        else {
            this.animator.node.active = false;
            const indexColor = petData.pet.rarity == AnimalRarity.COMMON ? 0 : petData.pet.rarity == AnimalRarity.RARE ? 1 : 2;
            this.borderSprite.color = this.colorBorder[indexColor];
        }
        this.currentPet = petData;
        if (interactSlot == InteractSlot.SHOW_UI) return; // chỉ show ui thì không cần set data
        this.petUpgradeDragItem.intiData(slotPet, interactSlot, parentSkillCanMove);
    }
    
    private playAnimBorder(animationName: string) {
        if (animationName != "") {
            this.animator.play(animationName);
        }
    }
}