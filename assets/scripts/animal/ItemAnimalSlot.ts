import { _decorator, Component, Node, Animation, Color, Sprite, Button, Vec3 } from 'cc';
import { AnimalController } from './AnimalController';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlot')
export class ItemAnimalSlot extends Component {
    @property({ type: [Node] }) petImage: Node[] = [];
    @property({ type: Button }) buttonClick: Button = null;
    @property({ type: Animation }) animator: Animation = null;
    @property({ type: Node }) bringNode: Node = null;
    @property({ type: Node }) fightingNode: Node = null;
    @property({ type: Node }) slotNode: Node = null;
    @property({ type: [Color] }) colorBorder: Color[] = [];
    @property(Sprite) borderSprite: Sprite;
    currentPet: PetDTO = null;
    selectedCallback: () => void;
    setDataSlot(pet: PetDTO, onClikcPet: (slot: ItemAnimalSlot) => void) {
        this.fightingNode.active = false;
        this.setBringPet(pet.is_brought);
        this.currentPet = pet;
        this.selectedCallback = async () => {
            if (onClikcPet) {
                await onClikcPet(this);
                this.setSelectedSlot(true);
            }
        };
        this.buttonClick.node.on(Button.EventType.CLICK, this.onSelectedCallback, this);
        if (pet.rarity == AnimalRarity.LEGENDARY) {
            this.animator.node.active = true;
            this.borderSprite.color = this.colorBorder[0];
            this.playAnimBorder(pet.rarity);
        }
        else {
            this.animator.node.active = false;
            const indexColor = pet.rarity == AnimalRarity.COMMON ? 0 : pet.rarity == AnimalRarity.RARE ? 1 : 2;
            this.borderSprite.color = this.colorBorder[indexColor];
        }
        this.setActivePetByName(pet.name);
    }

    onSelectedCallback() {
        if (this.selectedCallback == null) return;
        this.selectedCallback();
    }

    setActivePetByName(name: string) {
        for (let node of this.petImage) {
            node.active = node.name === name;
        }
    }

    resetAnimal() {
        this.buttonClick.node.off(Button.EventType.CLICK, this.onSelectedCallback, this);
        this.selectedCallback = null;
    }

    public playAnimBorder(animationName: string) {
        if (animationName != "") {
            this.animator.play(animationName);
        }
    }

    setBringPet(isBrought: boolean = true) {
        this.bringNode.active = isBrought;
    }

    setSelectedSlot(isSelected: boolean) {
        console.log("isSelected", this.currentPet.name, isSelected);
        if (isSelected) {
            this.slotNode.setScale(new Vec3(1.2, 1.2, 1.2))
            return;
        }
        this.slotNode.setScale(Vec3.ONE);
    }
}


