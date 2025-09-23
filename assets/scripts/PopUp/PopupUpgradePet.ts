import { _decorator, Node, Button, Prefab, Layers, Vec3, ScrollView } from "cc";
import { BasePopup } from "./BasePopup";
import { PopupManager } from "./PopupManager";
import { UserMeManager } from "../core/UserMeManager";
import { AnimalRarity, PetDTO } from "../Model/PetDTO";
import { PopupUpgradeStarPet } from "./PopupUpgradeStarPet";
import { PopupUpgradeRarityPet } from "./PopupUpgradeRarityPet";
import { ItemAnimalSlotDrag } from "../animal/ItemAnimalSlotDrag";
import { ObjectPoolManager } from "../pooling/ObjectPoolManager";
import { InteractSlot } from "../animal/ItemSlotSkill";

const { ccclass, property } = _decorator;

enum UpgradeTab {
    STAR = "STAR",
    RARITY = "RARITY",
}

@ccclass("PopupUpgradePet")
export class PopupUpgradePet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Node }) tabMerge: Node = null;
    @property({ type: Node }) tabUpgrade: Node = null;
    @property({ type: Node }) noPetPanel: Node = null;
    @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    @property({ type: Node }) parentPetCanMove: Node = null;
    @property({ type: PopupUpgradeStarPet }) popupStarUpgradePet: PopupUpgradeStarPet = null;
    @property({ type: PopupUpgradeRarityPet }) popupUpgradeRarityPet: PopupUpgradeRarityPet = null;
    @property({ type: ScrollView }) detailStar: ScrollView = null;
    @property({ type: ScrollView }) detailRarity: ScrollView = null;

    private animalSlotsStar: ItemAnimalSlotDrag[] = [];
    private animalSlotsRarity: ItemAnimalSlotDrag[] = [];
    private animalObject: Node = null;
    private currentTab: UpgradeTab = null;

    public init(): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.closePopup();
        });

        this.tabMerge.on(Node.EventType.TOUCH_END, () => this.switchTab(UpgradeTab.STAR));
        this.tabUpgrade.on(Node.EventType.TOUCH_END, () => this.switchTab(UpgradeTab.RARITY));
        this.switchTab(UpgradeTab.STAR);

        this.popupStarUpgradePet?.init({
            onUpdate: (pets) => this.onPetUpdate(pets, UpgradeTab.STAR),
            onSelectedPet: () => this.handleSlotSelected()
        });

        this.popupUpgradeRarityPet?.init({
            onUpdate: (pets) => this.onPetUpdate(pets, UpgradeTab.RARITY),
            onSelectedPet: () => this.handleSlotSelected()
        });
    }

    private switchTab(tab: UpgradeTab) {
        this.currentTab = tab;
        this.setActiveTabUI(tab);
        const myPets = UserMeManager.MyPets();
        this.renderPets(myPets, tab, { forceUpdate: false });
    }

    private onPetUpdate(myPets: PetDTO[], fromTab: UpgradeTab) {
        this.renderPets(myPets, fromTab, { forceUpdate: true });
    }

    private renderPets(pets: PetDTO[], tab: UpgradeTab, options: { forceUpdate: boolean }) {
        if (!this.hasPets(pets)) {
            this.noPetPanel.active = true;
            return;
        }
        this.noPetPanel.active = false;

        const sorted = this.groupPetsBySpecies(pets);

        if (options.forceUpdate) {
            this.clearStarSlots();
            this.clearRaritySlots();
        }

        if (tab === UpgradeTab.STAR) {
            if (options.forceUpdate || this.animalSlotsStar.length === 0) {
                this.updateStarPets(sorted);
            }
        } else if (tab === UpgradeTab.RARITY) {
            if (options.forceUpdate || this.animalSlotsRarity.length === 0) {
                this.updateRarityPets(sorted);
            }
        }
    }

    private setActiveTabUI(tab: UpgradeTab) {
        this.detailStar.node.active = tab === UpgradeTab.STAR;
        this.detailRarity.node.active = tab === UpgradeTab.RARITY;
        this.popupStarUpgradePet.node.active = tab === UpgradeTab.STAR;
        this.popupUpgradeRarityPet.node.active = tab === UpgradeTab.RARITY;
    }

    private hasPets(pets: PetDTO[] | null): boolean {
        return !!pets && pets.length > 0;
    }


    async closePopup() {
        if (this.animalObject) this.animalObject.active = false;
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    clearStarSlots() {
        this.detailStar.content.removeAllChildren();
        this.animalSlotsStar = [];
    }

    clearRaritySlots() {
        this.detailRarity.content.removeAllChildren();
        this.animalSlotsRarity = [];
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

    private updateStarPets(pets: PetDTO[]) {
        this.updatePetsSlot(pets, this.animalSlotsStar, this.detailStar.content, this.popupStarUpgradePet.slotPets);
    }

    private updateRarityPets(pets: PetDTO[]) {
        this.updatePetsSlot(pets, this.animalSlotsRarity, this.detailRarity.content, this.popupUpgradeRarityPet.slotPets);
    }

    private updatePetsSlot(pets: PetDTO[], slots: ItemAnimalSlotDrag[], parentNode: Node, slotPetList: ItemAnimalSlotDrag[]) {
        for (let i = 0; i < pets.length; i++) {
            let slot: ItemAnimalSlotDrag;
            if (i >= slots.length) {
                const node = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
                node.setParent(parentNode);
                slot = node.getComponent(ItemAnimalSlotDrag);
                slots.push(slot);
            } else {
                slot = slots[i];
            }
            slot.setDataSlot(pets[i], InteractSlot.DRAG, slotPetList, this.parentPetCanMove,
                () => {
                    this.handleSlotSelected();
                }
            );
            slot.node.active = true;
        }
    }

    async refreshSlot() {
        const tasksStar = this.animalSlotsStar.map(slot => slot.refeshSlot());
        const tasksRarity = this.animalSlotsRarity.map(slot => slot.refeshSlot());
        await Promise.all([Promise.all(tasksStar), Promise.all(tasksRarity)]);
    }
    
    handleSlotSelected() {
        if (this.currentTab === UpgradeTab.STAR) {
            const pets = this.popupStarUpgradePet.getPetsForMerge();
            const petIds = pets.map(p => p.id);
            this.updateSelectedSlots(this.animalSlotsStar, slotPet => petIds.includes(slotPet.id));
        }

        if (this.currentTab === UpgradeTab.RARITY) {
            const upgradePet = this.popupUpgradeRarityPet.getPetsForUpgrade();
            this.updateSelectedSlots(this.animalSlotsRarity, slotPet => slotPet.id === upgradePet?.id);
        }
    }

    private updateSelectedSlots( slots: { currentPet?: any; selectedNode: { active: boolean } }[], isSelected: (pet: any) => boolean) {
        slots.forEach(slot => {
            const slotPet = slot.currentPet;
            slot.selectedNode.active = slotPet ? isSelected(slotPet) : false;
        });
    }
}
