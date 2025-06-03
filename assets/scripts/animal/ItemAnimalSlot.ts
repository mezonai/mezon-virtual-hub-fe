import { _decorator, Component, Layers, Node, Toggle, UITransform, Vec3, Animation, Color, Sprite } from 'cc';
import { AnimalController, AnimalType } from './AnimalController';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlot')
export class ItemAnimalSlot extends Component {
    @property({ type: Node }) parentAnimal: Node = null;
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Animation }) animator: Animation = null;
    @property({ type: [Color] }) colorBorder: Color[] = [];
    @property(Sprite) borderSprite: Sprite;
    @property animalController: AnimalController = null;
    private animalObject: Node = null;
    private defaultLayer = Layers.Enum.NONE;
    private boundToggleCallback: () => void;
    private limitSize: number = 80;
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
            this.toggle.isChecked = pet.is_brought;
            if (this.toggle.isChecked && this.boundToggleCallback != null) this.boundToggleCallback();
            this.animalController = this.animalObject.getComponent(AnimalController);
            if (this.animalController == null) return;
            const uiTransform = this.animalController.spriteNode.getComponent(UITransform);
            if (uiTransform) {
                const size = uiTransform.contentSize;
                if (size.width > this.limitSize && size.height > this.limitSize) {
                    this.animalObject.setScale(new Vec3(0.7, 0.7, 0.7));
                }
            }
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
            this.animalController.setDataPet(pet, AnimalType.NoMove);
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
            this.animalObject.setScale(Vec3.ONE);
            ObjectPoolManager.instance.returnToPool(this.animalObject);
            resolve();
        });
    }

    public playAnimBorder(animationName: string) {
        if (animationName != "") {
            this.animator.play(animationName);
        }
    }
}


