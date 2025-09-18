import { _decorator, Component, Node, Button } from "cc";
import { BasePopup } from "./BasePopup";
import { PopupManager } from "./PopupManager";
import { UserMeManager } from "../core/UserMeManager";
import { AnimalRarity, PetDTO } from "../Model/PetDTO";
import { PopupUpgradeStarPet } from "./PopupUpgradeStarPet";
import { Prefab } from "cc";
import { ItemAnimalSlotDrag } from "../animal/ItemAnimalSlotDrag";
import { AnimalController } from "../animal/AnimalController";
import { Layers } from "cc";
import { ObjectPoolManager } from "../pooling/ObjectPoolManager";
import { Vec3 } from "cc";
import { InteractSlot } from "../animal/ItemSlotSkill";
import { ScrollView } from "cc";
// import { PopupMergePet } from "./PopupMergePet"; // nếu bạn có file riêng cho merge

const { ccclass, property } = _decorator;

@ccclass("PopupUpgradePet")
export class PopupUpgradePet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;

    @property({ type: Node }) tabMerge: Node = null;
    @property({ type: Node }) tabUpgrade: Node = null;
    @property({ type: Node }) noPetPanel: Node = null;
    @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    animalSlots: ItemAnimalSlotDrag[] = [];
    private listAllPetPlayer: PetDTO[] = [];
    private animalObject: Node = null;
    private animalController: AnimalController = null;
    private defaultLayer = Layers.Enum.NONE;
    @property({ type: Node }) parentPetCanMove: Node = null;

    // nếu bạn có popup merge riêng thì thay bằng PopupMergePet
    @property({ type: PopupUpgradeStarPet }) popupMergePet: PopupUpgradeStarPet = null;
    @property({ type: PopupUpgradeStarPet }) popupStarUpgradePet: PopupUpgradeStarPet = null;
    @property({ type: ScrollView }) DetailBySpecies: ScrollView = null;
    private currentTab: "merge" | "upgrade" = "merge";

    public init(): void {
        this.closeButton.addAsyncListener(async () => {
            this.closePopup();
        });

        // load danh sách pet 1 lần
        const myPets = UserMeManager.MyPets();

        // init cho cả 2 panel con
        this.popupMergePet?.init({ pets: myPets });
        this.popupStarUpgradePet?.init({ pets: myPets });

        this.showTab("merge");
        this.onGetMyPet(UserMeManager.MyPets());
    }

    async closePopup() {
        await this.resePet();
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }


    public showTab(tab: "merge" | "upgrade") {
        this.currentTab = tab;
        this.tabMerge.active = (tab === "merge");
        this.tabUpgrade.active = (tab === "upgrade");
     
        this.popupStarUpgradePet.updateListPet = (myPets) => {
            this.onGetMyPet(myPets);
        };
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

    async refreshSlot() {
        const tasks = this.animalSlots.map(slot => slot.refeshSlot());
        const tasksAndReset = [
            Promise.all(tasks),
            this.resePet()
        ];
        await Promise.all(tasksAndReset);
        this.animalSlots = [];
    }

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
        //await this.refreshSlot();
        this.DetailBySpecies.content.removeAllChildren();
        for (let i = 0; i < pets.length; i++) {
            if (pets[i] == null) continue;
            let pet = pets[i];
            let newitemAnimalSlot = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
            newitemAnimalSlot.setParent(this.DetailBySpecies.content);
            let itemPetSlot = newitemAnimalSlot.getComponent(ItemAnimalSlotDrag);
            if (itemPetSlot == null) continue;
            itemPetSlot.setDataSlot(pet, InteractSlot.DRAG, this.popupStarUpgradePet.slotPet, this.parentPetCanMove);
            this.animalSlots.push(itemPetSlot);
        }
    }
}
