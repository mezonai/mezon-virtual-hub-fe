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
import { AnimalElement, AnimalRarity, PetDTO } from '../Model/PetDTO';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { PopupSelection, SelectionParam } from './PopupSelection';
import { ItemDisplayPetFighting } from '../animal/ItemDisplayPetFighting';
import { InteractSlot, ItemSlotSkill } from '../animal/ItemSlotSkill';
const { ccclass, property } = _decorator;

@ccclass('PopupOwnedAnimals')
export class PopupOwnedAnimals extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    @property({ type: ScrollView }) scrollViewDetailPet: ScrollView = null;
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
    @property({ type: RichText }) levelValue: RichText = null;
    @property({ type: [Node] }) stars: Node[] = [];
    @property({ type: [ItemSlotSkill] }) slotSkillFighting: ItemSlotSkill[] = [];
    @property({ type: [ItemSlotSkill] }) itemSlotSkills: ItemSlotSkill[] = [];
    @property({ type: [ItemDisplayPetFighting] }) itemDisplayPetFightings: ItemDisplayPetFighting[] = [];
    private animalObject: Node = null;
    private animalController: AnimalController = null;
    private defaultLayer = Layers.Enum.NONE;
    //Bring Pet
    @property({ type: Button }) summonButton: Button = null;
    private animalSlots: ItemAnimalSlot[] = [];
    private animalBrings: PetDTO[] = [];
    private bringPetIdsInit: string[] = [];
    private maxBringPets = 3;
    private timeoutLoadSlot: number = 50;
    //
    species: string[] = ["Bird", "Cat", "Dog", "Rabit", "Sika", "Pokemon", "Dragon", "PhoenixIce", "DragonIce"]
    skillTest: [string, AnimalElement][] = [
        ["NOR01", AnimalElement.Normal],
        ["GRASS01", AnimalElement.Grass],
        ["ICE01", AnimalElement.Ice],
        ["FIRE01", AnimalElement.Fire]
    ];
    groupPetsBySpecies(pets: PetDTO[]): PetDTO[] {
        const rarityOrder: Record<AnimalRarity, number> = {
            [AnimalRarity.COMMON]: 0,
            [AnimalRarity.RARE]: 1,
            [AnimalRarity.EPIC]: 2,
            [AnimalRarity.LEGENDARY]: 3,
        };

        return pets.slice().sort((a, b) => {
            // So sánh species trước
            if (a.species < b.species) return -1;
            if (a.species > b.species) return 1;

            // Nếu species giống nhau, so sánh rarity
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });
    }
    getTop3LegendaryPets(pets: PetDTO[]): PetDTO[] {// data test sau nãy sẽ xóa
        const rarityOrder: Record<AnimalRarity, number> = {
            [AnimalRarity.COMMON]: 0,
            [AnimalRarity.RARE]: 1,
            [AnimalRarity.EPIC]: 2,
            [AnimalRarity.LEGENDARY]: 3,
        };

        const sortedPets = pets.slice().sort((a, b) => {
            if (a.species < b.species) return -1;
            if (a.species > b.species) return 1;
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        });

        // Lọc ra 3 pet LEGENDARY đầu tiên trong danh sách đã sort
        return sortedPets.filter(pet => pet.rarity === AnimalRarity.LEGENDARY).slice(0, 3);
    }
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
        this.setSlotPetFighting(animals);
        this.InitPet(this.groupPetsBySpecies(animals));
    }

    setSlotPetFighting(pets: PetDTO[]) {
        let pets3 = this.getTop3LegendaryPets(pets);
        for (let i = 0; i < this.itemDisplayPetFightings.length; i++) {
            this.itemDisplayPetFightings[i].setData(pets3[i], i, this.showPetDetail.bind(this));
        }
    }

    setDefaultDetailPet() {
        setTimeout(() => {
            this.animalSlots[0].toggle.isChecked = true;
            this.animalSlots[0].onToggleChanged(this.animalSlots[0].toggle);
        }, this.timeoutLoadSlot);

    }

    async refreshSlot() {
        const tasks = this.animalSlots.map(slot => slot.resetSlot());
        const tasksAndReset = [
            Promise.all(tasks),
            this.resePet()
        ];
        await Promise.all(tasksAndReset);
        this.animalSlots = [];
    }

    async InitPet(pets: PetDTO[]) {
        await this.refreshSlot();
        for (let i = 0; i < pets.length; i++) {
            if (pets[i] == null) continue;
            let pet = pets[i];
            let newitemAnimalSlot = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
            newitemAnimalSlot.setParent(this.scrollViewDetailPet.content);
            let itemPetSlot = newitemAnimalSlot.getComponent(ItemAnimalSlot);
            if (itemPetSlot == null) continue;
            itemPetSlot.setDataSlot(pet, this.showPetDetail.bind(this));
            this.animalSlots.push(itemPetSlot);
            if (pet.is_brought) {
                this.animalBrings.push(pet);
                this.bringPetIdsInit.push(pet.id);
            }
        }
        this.setDefaultDetailPet();
    }

    async showPetDetail(pet: PetDTO) {
        if (pet == null) return;
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
        if (this.animalController != null) {
            this.animalObject.setScale(pet?.name == "DragonIce" || pet?.name == "PhoenixIce" ? new Vec3(0.2, 0.2, 0.2) : new Vec3(0.27, 0.27, 0.27));
            this.animalController.setDataPet(pet, AnimalType.NoMove);
            this.defaultLayer = this.animalController.spriteNode.layer;
            this.setLayerAnimal(false);
        }
        // Gán dữ liệu cho itemSlotSkills
        this.skillTest.forEach(([id, name], index) => {
            if (this.itemSlotSkills[index]) {
                this.itemSlotSkills[index].initData(id, name, InteractSlot.DRAG, this.slotSkillFighting);
            }
        });

        // Gán dữ liệu cho tất cả slotSkillFighting dùng skill đầu tiên
        const [defaultId, defaultName] = this.skillTest[0];
        this.slotSkillFighting.forEach((slot, index) => {
            if (index == 0) slot.initData(defaultId, defaultName, InteractSlot.DOUBLE_CLICK, this.slotSkillFighting);
            else slot.initData("", defaultName, InteractSlot.DOUBLE_CLICK, this.slotSkillFighting);

        });
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
        this.levelValue.string = `<outline color=#222222 width=1> ? </outline>`;
        this.typeValue.string = `<outline color=#222222 width=1> Normal </outline>`;
        this.setStar(pet.rarity == AnimalRarity.COMMON ? 0 : pet.rarity == AnimalRarity.RARE ? 1 : pet.rarity == AnimalRarity.EPIC ? 2 : 3)
        this.setActiveButton(pet.is_brought);
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

        const currentAnimalSlot = this.animalSlots.find(slot => slot.currentPet.id === pet?.id);
        if (currentAnimalSlot) {
            currentAnimalSlot.setBringPet(isBring);
        }
    }
}


