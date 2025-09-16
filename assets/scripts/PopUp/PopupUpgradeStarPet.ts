import { _decorator, Node, Vec3, Layers, Prefab, ScrollView } from 'cc';
import { BasePopup } from './BasePopup';
import { UserMeManager } from '../core/UserMeManager';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { AnimalController } from '../animal/AnimalController';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { InteractSlot } from '../animal/ItemSlotSkill';
const { ccclass, property } = _decorator;

export enum PetViewType {
    PETDRAG,
    PETCHOOSEMERGE
}

@ccclass('PopupUpgradeStarPet')
export class PopupUpgradeStarPet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Node }) noPetPanel: Node = null;
   // @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    @property({ type: ScrollView }) scrollViewDetailPet: ScrollView = null;
    //animalSlots: ItemAnimalSlotDrag[] = [];
    private listAllPetPlayer: PetDTO[] = [];
    private animalObject: Node = null;
    private animalController: AnimalController = null;
    private defaultLayer = Layers.Enum.NONE;

    public init(param?: any): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.closePopup();
        });
        this.onGetMyPet(UserMeManager.MyPets());
    }

    async closePopup() {
        await this.resePet();
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    private onGetMyPet(myPets: PetDTO[]) {
        this.listAllPetPlayer = myPets;
        if (this.listAllPetPlayer == null || this.listAllPetPlayer.length <= 0) {
            this.noPetPanel.active = true;
            return;
        }
        this.noPetPanel.active = false;
        this.InitPet(this.groupPetsBySpecies(this.listAllPetPlayer));
    }

    groupPetsBySpecies(pets: PetDTO[]): PetDTO[] {
        return this.sortPetsBySpeciesAndRarity(pets);
    }

    private sortPetsBySpeciesAndRarity(pets: PetDTO[]): PetDTO[] {
        const rarityOrder: Record<AnimalRarity, number> = {
            [AnimalRarity.COMMON]: 0,
            [AnimalRarity.RARE]: 1,
            [AnimalRarity.EPIC]: 2,
            [AnimalRarity.LEGENDARY]: 3,
        };

        return pets.slice().sort((a, b) => {
            if (a.pet.species < b.pet.species) return -1;
            if (a.pet.species > b.pet.species) return 1;
            return rarityOrder[a.pet.rarity] - rarityOrder[b.pet.rarity];
        });
    }

    // async refreshSlot() {
    //     const tasks = this.animalSlots.map(slot => slot.resetSlot());
    //     const tasksAndReset = [
    //         Promise.all(tasks),
    //         this.resePet()
    //     ];
    //     await Promise.all(tasksAndReset);
    //     this.animalSlots = [];
    // }

    resePet(): Promise<void> {
        if (this.animalObject == null) return;
        return new Promise((resolve) => {
            this.setLayerAnimal(true);
            this.animalObject.setScale(Vec3.ONE);
            ObjectPoolManager.instance.returnToPool(this.animalObject);
            resolve();
        });
    }

    setLayerAnimal(isReturnPool: boolean) {
        this.animalController.spriteNode.layer = isReturnPool ? this.defaultLayer : Layers.Enum.UI_2D;
    }

    async InitPet(pets: PetDTO[]) {
       // await this.refreshSlot();
        for (let i = 0; i < pets.length; i++) {
            if (pets[i] == null) continue;
            let pet = pets[i];
            // let newitemAnimalSlot = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
            // newitemAnimalSlot.setParent(this.scrollViewDetailPet.content);
            // let itemPetSlot = newitemAnimalSlot.getComponent(ItemAnimalSlotDrag);
            // if (itemPetSlot == null) continue;
            // itemPetSlot.initData(pet, InteractSlot.DRAG, this.scrollViewDetailPet.node);
            // this.animalSlots.push(itemPetSlot);
        }
    }
}