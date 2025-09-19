import { _decorator, Component, Node, Animation, Color, Sprite, Vec3 } from 'cc';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { Prefab } from 'cc';
import { InteractSlot } from './ItemSlotSkill';
import { ItemSlotPet } from './ItemSlotpet';
import { Toggle } from 'cc';
import { ItemPlacePetDrag } from './ItemPlacePetUpgrade';
import { PetSlotUIHelper } from './PetSlotUIHelper';
const { ccclass, property } = _decorator;

@ccclass('ItemAnimalSlotDrag')
export class ItemAnimalSlotDrag extends Component {
    @property({ type: Prefab }) itemPetUpgradeDragPrefab: Prefab = null;
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Node }) slotNode: Node = null;
    @property(PetSlotUIHelper) petUIHelper: PetSlotUIHelper = null;
    @property({ type: Node }) node: Node = null;
    currentPet: PetDTO = null;
    itemPlacePetUpgrade: ItemPlacePetDrag = null;
    interactSlot: InteractSlot;
    onShowDetail: (slot: ItemAnimalSlotDrag, pet: PetDTO) => void = () => {};
    onHideDetail: (slot: ItemAnimalSlotDrag) => void = () => {};
    
    setDataSlot(petData: PetDTO, interactSlot: InteractSlot, slotPet: ItemAnimalSlotDrag[] = [], parentPetCanMove: Node = null) {
        if (petData == null) {
            this.refeshSlot();
            return;
        }
        this.node.setScale(Vec3.ONE);
        this.currentPet = petData;
        this.petUIHelper.setBorder(petData);
        this.interactSlot = interactSlot;
        if (interactSlot == InteractSlot.SHOW_UI) return; // chỉ show ui thì không cần set data
        this.setupPetPrefab(petData, slotPet,interactSlot,parentPetCanMove);
        this.petUIHelper.setStar(petData.stars);
    }

    private setupPetPrefab(petData: PetDTO, slotPlacePet: ItemAnimalSlotDrag[], interactSlot: InteractSlot, parentPetCanMove: Node = null) {
        let newItemSkill = ObjectPoolManager.instance.spawnFromPool(this.itemPetUpgradeDragPrefab.name);
        newItemSkill.setParent(this.slotNode);
        newItemSkill.position = Vec3.ZERO;

        this.itemPlacePetUpgrade = newItemSkill.getComponent(ItemPlacePetDrag);
        if (this.itemPlacePetUpgrade != null) {
            this.itemPlacePetUpgrade.setData(petData, interactSlot, slotPlacePet, parentPetCanMove);
        }
        this.petUIHelper.setStar(petData.stars);
    }
   
    UpdateSlotExistedPet(item: ItemPlacePetDrag | null, petData?: PetDTO) {
        if (petData) {
            this.itemPlacePetUpgrade.setData(petData, this.interactSlot, [], this.node.parent);
            this.petUIHelper.setStar(petData.stars);
        }
    }

    updateSlotPet(skillData: PetDTO, slotPet: ItemAnimalSlotDrag[] = [], interactSlot: InteractSlot, parentPetCanMove: Node = null) {
        this.setupPetPrefab(skillData, slotPet, interactSlot, parentPetCanMove);
    }

    refeshSlot() {
        this.slotNode.removeAllChildren();
        this.currentPet = null;
        this.itemPlacePetUpgrade = null;
        this.petUIHelper.setStar(0);
        this.onHideDetail(this);
    }
}