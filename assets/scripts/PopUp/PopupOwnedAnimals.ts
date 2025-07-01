import { _decorator, Button, Component, Layers, Node, Prefab, RichText, ScrollView, Toggle, UITransform, Vec3 } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemAnimalSlot } from '../animal/ItemAnimalSlot';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { UIManager } from '../core/UIManager';
import { ConfirmPopup } from './ConfirmPopup';
import { ServerManager } from '../core/ServerManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { PopupSelection, SelectionParam } from './PopupSelection';
const { ccclass, property } = _decorator;

@ccclass('PopupOwnedAnimals')
export class PopupOwnedAnimals extends BasePopup {
    @property({ type: Button }) saveButton: Button = null;
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    @property({ type: ScrollView }) scrollView: ScrollView = null;
    @property({ type: Node }) noPetPanel: Node = null;
    //Pet Detail
    @property({ type: Node }) parentPet: Node = null;
    @property({ type: Node }) fightNode: Node = null;
    @property({ type: Node }) bringNode: Node = null;
    @property({ type: Button }) fightingButton: Button = null;
    @property({ type: Button }) bringButton: Button = null;
    @property({ type: RichText }) namePet: RichText = null;
    @property({ type: RichText }) currentExp: RichText = null;
    @property({ type: RichText }) hpValue: RichText = null;
    @property({ type: RichText }) attackValue: RichText = null;
    @property({ type: RichText }) denfenseValue: RichText = null;
    @property({ type: RichText }) speedValue: RichText = null;
    @property({ type: RichText }) typeValue: RichText = null;
    @property({ type: [Node] }) stars: Node[] = [];
    private animalObject: Node = null;
    private animalController: AnimalController = null;
    private defaultLayer = Layers.Enum.NONE;
    //Bring Pet
    @property({ type: Button }) summonButton: Button = null;
    private currentAnimalSlot: ItemAnimalSlot = null;
    private animalBrings: PetDTO[] = [];
    private bringPetIdsInit: string[] = [];
    private maxBringPets = 3;
    showPopup() {
        let animals = UserMeManager.Get.animals;
        if (animals == null || animals.length <= 0) {
            this.noPetPanel.active = true;
            return;
        }
        this.noPetPanel.active = false;
        const rarityOrder: Record<AnimalRarity, number> = {
            [AnimalRarity.COMMON]: 0,
            [AnimalRarity.RARE]: 1,
            [AnimalRarity.EPIC]: 2,
            [AnimalRarity.LEGENDARY]: 3,
        };
        const sortedPets = UserMeManager.Get.animals.sort((a, b) => {
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
        let totalPet = 0;
        for (let i = 0; i < sortedPets.length; i++) {
            if (sortedPets[i] == null) continue;
            totalPet++;
            let pet = sortedPets[i];
            let newitemAnimalSlot = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
            newitemAnimalSlot.setParent(this.scrollView.content);
            let itemPetSlot = newitemAnimalSlot.getComponent(ItemAnimalSlot);
            if (itemPetSlot == null) continue;
            itemPetSlot.setDataSlot(pet, this.showPetDetail.bind(this));
            if (this.currentAnimalSlot == null) this.currentAnimalSlot = itemPetSlot;
            if (pet.is_brought) {
                this.animalBrings.push(pet);
                this.bringPetIdsInit.push(pet.id);
            }
        }
        setTimeout(() => {
            if (this.scrollView.content.children.length === totalPet) {
                this.currentAnimalSlot?.onSelectedCallback();
            }
        }, 200);
    }

    async setDefaultSlot() {
        await new Promise(resolve => setTimeout(resolve, 5));
        this.currentAnimalSlot.onSelectedCallback();
    }

    async showPetDetail(itemAnimalSlot: ItemAnimalSlot) {
        if (itemAnimalSlot == null) return;
        if (this.currentAnimalSlot.node.uuid != itemAnimalSlot.node.uuid) {
            this.currentAnimalSlot.setSelectedSlot(false);
            this.currentAnimalSlot = itemAnimalSlot;
        }
        let pet = itemAnimalSlot.currentPet;
        if (this.animalObject != null) {
            if (pet?.id === this.animalController?.Pet?.id) return;
            if (pet?.species == this.animalController?.Pet?.species) {
                this.animalController.setDataPet(pet, AnimalType.NoMove);
                this.setDataDetail(pet);
                return;
            }
            await this.resePet();
        }
        this.animalObject = ObjectPoolManager.instance.spawnFromPool(pet.species);
        if (this.animalObject == null) return;
        this.animalObject.setParent(this.parentPet);
        this.animalObject.setPosition(new Vec3(0, 0, 0));
        this.setDataDetail(pet);
        this.animalController = this.animalObject.getComponent(AnimalController);
        if (this.animalController == null) return;
        this.animalObject.setScale(pet?.name == "DragonIce" || pet?.name == "PhoenixIce" ? new Vec3(0.3, 0.3, 0.3) : new Vec3(0.5, 0.5, 0.5));
        this.animalController.setDataPet(pet, AnimalType.NoMove);
        this.defaultLayer = this.animalController.spriteNode.layer;
        this.setLayerAnimal(false);
    }

    setLayerAnimal(isReturnPool: boolean) {
        this.animalController.spriteNode.layer = isReturnPool ? this.defaultLayer : Layers.Enum.UI_2D;
    }

    setDataDetail(pet: PetDTO) {
        this.namePet.string = `<outline color=#222222 width=1> ${pet.name} (${pet.rarity}) </outline>`;
        this.currentExp.string = `<outline color=#222222 width=1> ?/? </outline>`;
        this.hpValue.string = `<outline color=#222222 width=1> ? </outline>`;
        this.attackValue.string = `<outline color=#222222 width=1> ? </outline>`;
        this.denfenseValue.string = `<outline color=#222222 width=1> ? </outline>`;
        this.speedValue.string = `<outline color=#222222 width=1> ? </outline>`;
        this.typeValue.string = `<outline color=#222222 width=1> Normal </outline>`;
        this.setStar(pet.rarity == AnimalRarity.COMMON ? 0 : pet.rarity == AnimalRarity.RARE ? 1 : pet.rarity == AnimalRarity.EPIC ? 2 : 3)
        this.setActiveButton(pet.is_brought);
    }

    resePet(): Promise<void> {
        return new Promise((resolve) => {
            this.setLayerAnimal(true);
            this.animalObject.setScale(Vec3.ONE);
            ObjectPoolManager.instance.returnToPool(this.animalObject);
            resolve();
        });
    }

    setStar(valueStar: number) {
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].active = i < valueStar;
        }
    }

    saveChange() {
        const bringPetIds: string[] = this.animalBrings.map(pet => pet.id);
        if (
            this.bringPetIdsInit.length === bringPetIds.length &&
            this.bringPetIdsInit.every(id => bringPetIds.includes(id))
        ) {
            this.closePopup();
            return;
        }
        const param: SelectionParam = {
            content: `Bạn có muốn lưu những thay đổi không?`,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: () => {
                const pets = UserMeManager.Get.animals;
                console.log("Save", pets);
                if (!pets || pets.length === 0) return;

                // Cập nhật is_brought và tạo danh sách pet được chọn
                const petFollowUser = pets.filter(pet => {
                    pet.is_brought = bringPetIds.includes(pet.id);
                    return pet.is_brought;
                });
                const petData = { pets: pets };
                if (pets.length > 0) {
                    WebRequestManager.instance.updateListPetFollowUser(
                        petData,
                        (response) => {
                            const data = {
                                pets: JSON.stringify(petFollowUser)
                            };
                            ServerManager.instance.sendPetFollowPlayer(data);
                            this.closePopup();
                        },
                        (error) => this.onError(error)
                    );
                } else this.closePopup();
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }
    public async init(param?) {
        this.showPopup();
    }

    protected onLoad(): void {
        this.closeButton.node.on(Button.EventType.CLICK, this.saveChange, this);
        this.bringButton.node.on(Button.EventType.CLICK, this.onButtonBringPetClick, this);
        this.summonButton.node.on(Button.EventType.CLICK, this.onSummonPetPetClick, this);
    }

    onButtonBringPetClick() {
        if (this.animalController == null) return;
        if (this.animalBrings.length >= this.maxBringPets) {
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, { message: "Bạn chỉ được chọn 3 thú cưng mang theo" });
            return;
        }
        const param: SelectionParam = {
            content: `Bạn có muốn mang theo ${this.animalController.Pet.name} bên mình?`,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: () => {
                this.onBringPet(true);
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

    onSummonPetPetClick() {
        if (this.animalController == null) return;
        const param: SelectionParam = {
            content: this.animalController.Pet.is_brought ? `Bạn có muốn gỡ Pet này khỏi danh sách mang theo không?` : `Bạn có muốn gỡ Pet này khỏi danh sách chiến đấu không??`,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: () => {
                this.onBringPet(false);
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

    async closePopup() {
        await this.resePet();
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }
    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }

    setActiveButton(isBrought: boolean) {
        this.summonButton.node.active = isBrought;
        this.bringButton.node.active = !isBrought;
        this.bringNode.active = isBrought;
    }
    onBringPet(isBring: boolean) {
        const pet = this.animalController?.Pet;
        if (!pet) return;

        pet.is_brought = isBring;
        this.setActiveButton(isBring);

        if (isBring) {
            this.animalBrings.push(pet);
        } else {
            const index = this.animalBrings.findIndex(p => p.id === pet.id);
            if (index !== -1) {
                this.animalBrings.splice(index, 1);
            }
        }

        if (this.currentAnimalSlot) {
            this.currentAnimalSlot.setBringPet(isBring);
        }
    }
}


