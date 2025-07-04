import { _decorator, Component, Node, RichText, Sprite, SpriteFrame, Toggle, Vec3 } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { PetsDesignIcon } from './PetsDesignIcon';
const { ccclass, property } = _decorator;

@ccclass('ItemDisplayPetFighting')
export class ItemDisplayPetFighting extends Component {
    @property({ type: PetsDesignIcon }) petImage: PetsDesignIcon = null;
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Sprite }) iconSlotSprite: Sprite = null;
    @property({ type: [Node] }) stars: Node[] = [];
    @property({ type: [SpriteFrame] }) iconSlot: SpriteFrame[] = [];
    @property({ type: RichText }) slotValue: RichText = null;
    @property({ type: RichText }) levelPet: RichText = null;
    selectedCallback: () => void;
    setData(pet: PetDTO, slot: number, onClikcPet: (pet: PetDTO) => void) {

        if (pet == null) {
            this.levelPet.node.active = false;
            this.setStar(0);
            return
        }
        this.selectedCallback = async () => {
            if (onClikcPet) {
                await onClikcPet(pet);
            }
        };
        this.petImage.setActivePetByName(pet.name);
        this.iconSlotSprite.spriteFrame = this.iconSlot[slot < this.iconSlot.length ? slot : 0];
        this.slotValue.string = `<outline color=#222222 width=1> ${slot + 1} </outline>`;
        this.levelPet.string = `<outline color=#222222 width=1> Lv.? </outline>`
        this.setStar(2);
        this.node.setScale(slot == 0 ? new Vec3(1.15, 1.15, 1.15) : Vec3.ONE);
        this.toggle.node.off('toggle', this.onToggleChanged, this);
        this.toggle.node.on('toggle', this.onToggleChanged, this);
    }

    setStar(valueStar: number) {
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].active = i < valueStar;
        }
    }

    onToggleChanged(toggle: Toggle) {

        if (!toggle.isChecked) {
            return;
        }
        if (this.selectedCallback == null) return;
        this.selectedCallback();
    }
}


