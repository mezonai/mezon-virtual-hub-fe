import { _decorator, Component, Layers, Node, Toggle, Vec3 } from 'cc';
import { AnimalController, AnimalMoveType } from './AnimalController';
import { PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlot')
export class ItemAnimalSlot extends Component {
    @property({ type: Node }) parentAnimal: Node = null;
    @property({ type: Toggle }) toggle: Toggle = null;
    @property isSelected: boolean = false;
    @property animalController: AnimalController = null;
    private animalObject: Node = null;
    private defaultLayer = Layers.Enum.NONE;
    private boundToggleCallback: () => void;
    setDataSlot(pet: PetDTO, onToggleClick: (toggleSelected: Toggle) => void) {
        this.animalObject = ObjectPoolManager.instance.spawnFromPool(pet.species);
        if (this.animalObject) {
            this.animalObject.setParent(this.parentAnimal);
            this.animalObject.setPosition(new Vec3(0, 0, 0));
            this.boundToggleCallback = () => {
                if (onToggleClick) {
                    onToggleClick(this.toggle);
                }
            };
            this.toggle.node.on(Node.EventType.TOUCH_END, this.boundToggleCallback, this);
            this.toggle.isChecked = this.isSelected;// this.isSelected sẽ được thay thế bằng trạng thái của Pet sau này
            if (this.toggle.isChecked && this.boundToggleCallback != null) this.boundToggleCallback();
            this.animalController = this.animalObject.getComponent(AnimalController);
            if (this.animalController == null) return;
            this.animalController.setDataPet(pet, AnimalMoveType.NoMove);
            this.defaultLayer = this.animalController.spriteNode.layer;
            this.setLayerAnimal(false);
        }
    }



    setLayerAnimal(isReturnPool: boolean) {
        this.animalController.spriteNode.layer = isReturnPool ? this.defaultLayer : Layers.Enum.UI_2D;
    }

    resetAnimal(): Promise<void> {
        this.toggle.node.off(Node.EventType.TOUCH_END, this.boundToggleCallback, this);
        this.boundToggleCallback = null;
        return new Promise((resolve) => {
            this.setLayerAnimal(true);
            ObjectPoolManager.instance.returnToPool(this.animalObject);
            resolve();
        });
    }
}


