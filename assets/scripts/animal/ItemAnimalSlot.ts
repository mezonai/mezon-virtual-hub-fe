import { _decorator, Component, Node, Animation, Color, Sprite, Button, Vec3, Toggle } from 'cc';
import { AnimalController } from './AnimalController';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { PetsDesignIcon } from './PetsDesignIcon';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlot')
export class ItemAnimalSlot extends Component {
    @property({ type: PetsDesignIcon }) petImage: PetsDesignIcon = null;
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Animation }) animator: Animation = null;
    @property({ type: Node }) bringNode: Node = null;
    @property({ type: Node }) fightingNode: Node = null;
    @property({ type: Node }) slotNode: Node = null;
    @property({ type: [Color] }) colorBorder: Color[] = [];
    @property(Sprite) borderSprite: Sprite;
    currentPet: PetDTO = null;
    selectedCallback: () => void;
    setDataSlot(pet: PetDTO, onClikcPet: (pet: PetDTO) => void) {
        this.fightingNode.active = false;
        this.node.setScale(Vec3.ONE);
        this.setBringPet(pet.is_brought);
        this.setBattlePet(pet.battle_slot);
        this.currentPet = pet;
        this.selectedCallback = async () => {
            if (onClikcPet) {
                await onClikcPet(this.currentPet);
            }
        };
        this.toggle.node.on('toggle', this.onToggleChanged, this);
        if (pet.current_rarity == AnimalRarity.LEGENDARY) {
            this.animator.node.active = true;
            this.borderSprite.color = this.colorBorder[0];
            this.playAnimBorder(pet.current_rarity);
        }
        else {
            this.animator.node.active = false;
            const indexColor = pet.current_rarity == AnimalRarity.COMMON ? 0 : pet.current_rarity == AnimalRarity.RARE ? 1 : 2;
            this.borderSprite.color = this.colorBorder[indexColor];
        }
        this.petImage.setActivePetByName(pet.name);
    }

    onSelectedCallback() {
        if (this.selectedCallback == null) return;
        this.selectedCallback();
    }


    resetSlot(): Promise<void> {
        this.toggle.node.off('toggle', this.onToggleChanged, this);
        this.selectedCallback = null;
        ObjectPoolManager.instance.returnToPool(this.node);
        return new Promise(resolve => {
            const check = () => {
                if (!this.node.active) {
                    resolve();
                } else {
                    setTimeout(check, 0);
                }
            };
            check();
        });
    }

    public playAnimBorder(animationName: string) {
        if (animationName != "") {
            this.animator.play(animationName);
        }
    }

    setBringPet(isBrought: boolean = true) {
        this.bringNode.active = isBrought;
    }

    setBattlePet(battle_slot: number = 0) {
        this.fightingNode.active = battle_slot > 0;
    }

    onToggleChanged(toggle: Toggle) {

        if (!toggle.isChecked) {
            this.node.setScale(Vec3.ONE);
            return;
        }
        this.node.setScale(new Vec3(1.25, 1.25, 1.25))
        this.onSelectedCallback();
    }
}


