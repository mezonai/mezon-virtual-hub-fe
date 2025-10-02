import { _decorator, Component, Node, Animation, Color, Sprite, Vec3 } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { Prefab } from 'cc';
import { InteractSlot } from './ItemSlotSkill';
import { Toggle } from 'cc';
import { ItemPlacePetDrag } from './ItemPlacePetUpgrade';
import { PetSlotUIHelper } from './PetSlotUIHelper';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlotDrag')
export class ItemAnimalSlotDrag extends Component {
    @property({ type: Prefab }) itemPetUpgradeDragPrefab: Prefab = null;
    @property({ type: Node }) slotNode: Node = null;
    @property(PetSlotUIHelper) petUIHelper: PetSlotUIHelper = null;
    @property({ type: Node }) selectedNode: Node = null;
    currentPet: PetDTO = null;
    itemPlacePetUpgrade: ItemPlacePetDrag = null;
    interactSlot: InteractSlot;
    onShowDetail: (slot: ItemAnimalSlotDrag, pet: PetDTO) => void = () => {};
    onHideDetail: (slot: ItemAnimalSlotDrag) => void = () => {};
    onSelectedPet: () => void = () => {};
    
    setDataSlot(petData: PetDTO, interactSlot: InteractSlot, slotPet: ItemAnimalSlotDrag[] = [], parentPetCanMove: Node = null, onSelectedPet: () => void = () => {}) {
        if (petData == null) {
            this.refeshSlot();
            return;
        }
        this.onSelectedPet = onSelectedPet;
        this.currentPet = petData;
        this.petUIHelper.setBorder(petData);
        this.interactSlot = interactSlot;
        if (interactSlot == InteractSlot.SHOW_UI) return; // chỉ show ui thì không cần set data
        this.setupPetPrefab(petData, slotPet,interactSlot,parentPetCanMove, onSelectedPet);
        this.petUIHelper.setStar(petData.stars);
    }

    private setupPetPrefab(petData: PetDTO, slotPlacePet: ItemAnimalSlotDrag[], interactSlot: InteractSlot, parentPetCanMove: Node = null, onSelectedPet: () => void = () => {}) {
        let newItemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemPetUpgradeDragPrefab.name);
        newItemSkill.setParent(this.slotNode);
        newItemSkill.position = Vec3.ZERO;

        this.itemPlacePetUpgrade = newItemSkill.getComponent(ItemPlacePetDrag);
        if (this.itemPlacePetUpgrade != null) {
            this.itemPlacePetUpgrade.setData(petData, interactSlot, slotPlacePet, parentPetCanMove, onSelectedPet);
        }
        this.petUIHelper.setStar(petData.stars);
    }
   
    UpdateSlotExistedPet(petData: PetDTO, interactSlot: InteractSlot) {
        if (petData) {
            this.itemPlacePetUpgrade.setData(petData, interactSlot, [], this.node.parent);
            this.petUIHelper.setStar(petData.stars);
        }
    }

    updateSlotPet(petData: PetDTO, slotPet: ItemAnimalSlotDrag[] = [], interactSlot: InteractSlot, parentPetCanMove: Node = null) {
        this.setupPetPrefab(petData, slotPet, interactSlot, parentPetCanMove);
    }

    refeshSlot() {
        this.slotNode.removeAllChildren();
        this.currentPet = null;
        this.itemPlacePetUpgrade = null;
        this.petUIHelper.setStar(0);
        this.onSelectedPet?.();
        this.onHideDetail(this);
    }
}