import { _decorator, Button, Layers, Node, Prefab, RichText, ScrollView, Vec3 } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemAnimalSlot } from '../animal/ItemAnimalSlot';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ConfirmParam, ConfirmPopup } from './ConfirmPopup';
import { ServerManager } from '../core/ServerManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { AnimalElement, AnimalRarity, PetBattlePayload, PetDTO, PetFollowPayload, SkillData, SkillSlot } from '../Model/PetDTO';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { PopupSelection, SelectionParam } from './PopupSelection';
import { ItemDisplayPetFighting } from '../animal/ItemDisplayPetFighting';
import { InteractSlot, ItemSlotSkill } from '../animal/ItemSlotSkill';
import { SkillDataInfor, SkillList } from '../animal/Skills';
import { UserManager } from '../core/UserManager';
import { PopupBattlePlace, PopupBattlePlaceParam } from './PopupBattlePlace';
const { ccclass, property } = _decorator;

enum PetActionType {
    BRING,
    REMOVE,
    FIGHT,
    SORTBATTLE
}

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
    @property({ type: Button }) sortPetBattleBtn: Button = null;
    private animalObject: Node = null;
    private animalController: AnimalController = null;
    private defaultLayer = Layers.Enum.NONE;
    //Bring Pet
    @property({ type: Button }) summonButton: Button = null;
    private animalSlots: ItemAnimalSlot[] = [];
    private animalBrings: PetDTO[] = [];
    private animalBattle: PetDTO[] = [];
    private bringPetIdsInit: string[] = [];
    private battlePetIdsInit: { id: string, battle_slot: number }[] = [];
    private maxBringPets = 3;
    private timeoutLoadSlot: number = 50;
    private listAllPetPlayer: PetDTO[] = [];
    private expMax: number = 1000;
    private skillPet: SkillDataInfor[];

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


    showPopup() {
        WebRequestManager.instance.getMyPetData((respone) => { this.onGetMyPet(respone) }, (error) => { this.onApiError(error); });
    }

    private onGetMyPet(respone) {
        this.listAllPetPlayer = respone.data;
        if (this.listAllPetPlayer == null || this.listAllPetPlayer.length <= 0) {
            this.noPetPanel.active = true;
            return;
        }
        this.noPetPanel.active = false;
        this.InitPet(this.groupPetsBySpecies(this.listAllPetPlayer));
    }

    private onApiError(error) {
        const param: ConfirmParam = {
            message: error.error_message,
            title: "Waning",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    setSlotPetFighting(pets: PetDTO[]) {
        for (let item of this.itemDisplayPetFightings) {
            item.resetData();
        }
        for (const pet of pets) {
            const slotIndex = pet.battle_slot - 1;
            const item = this.itemDisplayPetFightings[slotIndex];
            if (item) {
                item.setData(pet, slotIndex, this.showPetDetail.bind(this));
            }
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
            if (pet.battle_slot) {
                this.animalBattle.push(pet);
                this.battlePetIdsInit.push({ id: pet.id, battle_slot: pet.battle_slot });
            }
        }
        this.setSlotPetFighting(this.animalBattle);
        this.setDefaultDetailPet();
    }

    async showPetDetail(pet: PetDTO) {
        if (pet == null) return;
        if (this.animalObject != null) {
            if (pet?.id === this.animalController?.Pet?.id) return;
            if (pet?.pet?.species == this.animalController?.Pet?.pet.species) {
                this.animalController.setDataPet(pet, AnimalType.NoMove);
                this.setDataDetail(pet);
                return;
            }
            await this.resePet();
        }
        this.animalObject = ObjectPoolManager.instance.spawnFromPool(pet.pet.species);
        if (this.animalObject == null) return;
        this.animalObject.setParent(this.parentPet);
        this.animalObject.setPosition(new Vec3(0, 0, 0));
        this.setDataDetail(pet);
        this.animalController = this.animalObject.getComponent(AnimalController);
        if (this.animalController != null) {
            var isScale = pet?.name == "DragonIce" || pet?.name == "DragonFire" || pet?.name == "DragonNormal" || pet?.name == "PhoenixIce";
            this.animalObject.setScale(isScale ? new Vec3(0.2, 0.2, 0.2) : new Vec3(0.27, 0.27, 0.27));
            this.animalController.setDataPet(pet, AnimalType.NoMove);
            this.defaultLayer = this.animalController.spriteNode.layer;
            this.setLayerAnimal(false);
        }
        // Gán dữ liệu cho itemSlotSkills
        this.skillPet = [
            pet.skill_slot_1,
            pet.skill_slot_2,
            pet.skill_slot_3,
            pet.skill_slot_4,
        ].filter(Boolean)
            .map(this.convertSkillSlotToDataInfo);

        this.itemSlotSkills.forEach((slot, index) => {
            if (!slot) return;

            const skill = this.skillPet[index];

            if (skill) {
                slot.initData(skill, InteractSlot.DRAG, this.slotSkillFighting);
                if (slot.lockItem) slot.lockItem.active = false;
            } else {
                slot.resetSkill();
                if (slot.lockItem) slot.lockItem.active = true;
            }
        });

        // Gán dữ liệu cho tất cả slotSkillFighting dùng skill đầu tiên
        this.slotSkillFighting.forEach((slot, index) => {
            if (index == 0) slot.initData(null, InteractSlot.DOUBLE_CLICK, this.slotSkillFighting);
            else slot.initData(null, InteractSlot.DOUBLE_CLICK, this.slotSkillFighting);

        });
    }

    convertSkillSlotToDataInfo(slot: SkillSlot): SkillDataInfor {
        return {
            idSkill: slot.skill_code,
            name: slot.name,
            type: slot.type,
            attack: slot.attack,
            accuracy: slot.accuracy,
            powerPoints: slot.power_points,
            description: slot.description,
        };
    }

    setLayerAnimal(isReturnPool: boolean) {
        this.animalController.spriteNode.layer = isReturnPool ? this.defaultLayer : Layers.Enum.UI_2D;
    }

    setDataDetail(pet: PetDTO) {
        this.namePet.string = `<outline color=#222222 width=1> ${pet.name} (${pet.pet.rarity}) </outline>`;
        this.currentExp.string = `<outline color=#222222 width=1> ${pet.exp} / ${pet.max_exp} </outline>`;
        this.hpValue.string = `<outline color=#222222 width=1> ${pet.hp} </outline>`;
        this.attackValue.string = `<outline color=#222222 width=1> ${pet.attack} </outline>`;
        this.denfenseValue.string = `<outline color=#222222 width=1> ${pet.defense} </outline>`;
        this.speedValue.string = `<outline color=#222222 width=1> ${pet.speed} </outline>`;
        this.levelValue.string = `<outline color=#222222 width=1> ${pet.level} </outline>`;
        this.typeValue.string = `<outline color=#222222 width=1> ${pet.pet.type} </outline>`;
        this.setStar(pet.stars)
        this.updatePetActionButtons(pet);
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
        const battlePetIdsSlots: { id: string, battle_slot: number }[] = this.animalBattle.map(p => ({ id: p.id, battle_slot: p.battle_slot}));
        const isSameBring = this.bringPetIdsInit.length === bringPetIds.length && this.bringPetIdsInit.every(id => bringPetIds.includes(id));
        const isSameBattle = this.battlePetIdsInit.length === battlePetIdsSlots.length && !this.battlePetIdsInit.some(initPet => {
            const currentPet = battlePetIdsSlots.find(p => p.id === initPet.id);
            const isDifferent = !currentPet || currentPet.battle_slot !== initPet.battle_slot;
            return isDifferent;
        });

        if (isSameBring && isSameBattle) {
            this.closePopup();
            return;
        }

        const param: SelectionParam = {
            content: `Bạn có muốn lưu những thay đổi không?`,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: () => {
                const pets = this.listAllPetPlayer;
                if (!pets || pets.length === 0) return;

                const petData = this.buildPetFollowData(pets);
                const petDataBattle = this.buildPetBattleData(pets);

                const hasPetUpdate = petData.pets.length > 0;
                const hasBattleUpdate = petDataBattle.pets.length > 0;

                if (hasPetUpdate || hasBattleUpdate) {
                    this.sendUpdatePetDataAsync(petData, petDataBattle, hasPetUpdate, hasBattleUpdate);
                } else {
                    this.closePopup();
                }
            }
            ,
            onActionButtonLeft: () => {
                this.closePopup();
            }
        };
        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

    private buildPetFollowData(pets: PetDTO[]) {
        const petFollowUser = pets.filter(pet => {
            const shouldBring = this.animalBrings.some(p => p.id === pet.id);
            const wasBrought = this.bringPetIdsInit.includes(pet.id);
            pet.is_brought = shouldBring;
            return shouldBring || wasBrought;
        });

        return {
            pets: petFollowUser.map(pet => ({
                id: pet.id,
                is_brought: pet.is_brought,
                room_code: pet.room_code,
                species: pet.pet?.species ?? null,
                type: pet.pet?.type ?? null,
                rarity: pet.pet?.rarity ?? null
            }))
        };
    }

    private buildPetBattleData(pets: PetDTO[]) {
        const petBattleUser = pets.filter(pet => {
            const shouldBattle = this.animalBattle.some(p => p.id === pet.id);
            const wasBattle = this.battlePetIdsInit.some(p => p.id === pet.id && p.battle_slot === pet.battle_slot);
            return shouldBattle || wasBattle;
        });
        const result = petBattleUser.map(pet => {
            const foundInBattle = this.animalBattle.find(p => p.id === pet.id);
            const finalSlot = foundInBattle ? foundInBattle.battle_slot : 0;
            return {
                id: pet.id,
                battle_slot: finalSlot,
            };
        });
        return { pets: result };
    }

    private async sendUpdatePetDataAsync(petData: PetFollowPayload, petDataBattle: PetBattlePayload, hasPetUpdate: boolean,
        hasBattleUpdate: boolean
    ) {
        try {
            if (hasBattleUpdate) await this.updateListPetBattleUserAsync(petDataBattle);
            if (hasPetUpdate) await this.updateListPetFollowUserAsync(petData);
        } finally {
            this.closePopup();
        }
    }

    private updateListPetFollowUserAsync(petData: PetFollowPayload): Promise<void> {
        return new Promise<void>((resolve) => {
            WebRequestManager.instance.updateListPetFollowUser(
                petData,
                () => {
                    const data = {
                        pets: petData.pets
                    };
                    ServerManager.instance.sendPetFollowPlayer(data);
                    resolve();
                },
                (error) => {
                    this.onError(error);
                    resolve();
                }
            );
        });
    }

    private updateListPetBattleUserAsync(petDataBattle: PetBattlePayload): Promise<void> {
        return new Promise<void>((resolve) => {
            WebRequestManager.instance.updateListPetBattleUser(
                petDataBattle,
                () => resolve(),
                (error) => {
                    this.onError(error);
                    resolve();
                }
            );
        });
    }

    public async init() {
        this.closeButton.node.on(Button.EventType.CLICK, this.saveChange, this);
        this.bringButton.node.on(Button.EventType.CLICK, () => this.handlePetAction(PetActionType.BRING), this);
        this.fightingButton.addAsyncListener(async () => { this.handlePetAction(PetActionType.FIGHT); });
        this.summonButton.node.on(Button.EventType.CLICK, () => this.handlePetAction(PetActionType.REMOVE), this);
        this.sortPetBattleBtn.addAsyncListener(async () => { this.handlePetAction(PetActionType.SORTBATTLE); });
        this.showPopup();
    }

    private handlePetAction(actionType: PetActionType) {
        if (!this.animalController) return;
        const pet = this.animalController.Pet;
        const actions = {
            [PetActionType.BRING]: {
                content: `Bạn có muốn mang theo ${pet.name} bên mình?`,
                handler: () => this.onBringPet(true),
                deny: pet.battle_slot > 0
                    ? "Pet đang được chọn để thi đấu nên không thể mang theo."
                    : this.animalBrings.length >= this.maxBringPets
                        ? "Bạn chỉ được chọn 3 thú cưng mang theo"
                        : null
            },
            [PetActionType.FIGHT]: {
                content: `Bạn có muốn chọn ${pet.name} để thi đấu?`,
                handler: () => this.onSelectPetBattle(true),
                deny: pet.is_brought
                    ? "Pet đang được mang theo nên không thể chọn để thi đấu."
                    : this.animalBattle.length >= this.maxBringPets
                        ? "Bạn chỉ được chọn 3 thú cưng thi đấu"
                        : null
            },
            [PetActionType.REMOVE]: {
                content: pet.is_brought
                    ? `Bạn có muốn gỡ Pet này khỏi danh sách mang theo không?`
                    : `Bạn có muốn gỡ Pet này khỏi danh sách chiến đấu không?`,
                handler: () =>
                    pet.is_brought
                        ? this.onBringPet(false)
                        : this.onSelectPetBattle(false),
                deny: null
            },
            [PetActionType.SORTBATTLE]: {
                handler: () => this.onSortPetBattle(),
            },
        };

        const action = actions[actionType];
        if ('deny' in action && action.deny) {
            return this.showConfirm(action.deny);
        }
        if ('content' in action && action.content && action.handler) {
            return this.showSelection(action.content, action.handler);
        }
        action.handler?.();
    }

    private showConfirm(message: string) {
        const param: ConfirmParam = {
            message,
            title: "Thông báo",
        };
        PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, param);
    }

    private showSelection(content: string, onConfirm: () => void) {
        const param: SelectionParam = {
            content,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: onConfirm,
        };
        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

    async closePopup() {
        await this.resePet();
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
        this._onActionClose?.();
    }
    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }

    updatePetActionButtons(pet: PetDTO) {
        const isBrought = pet.is_brought;
        const isInBattle = pet.battle_slot > 0;
        this.bringButton.node.active = !isBrought;
        this.fightingButton.node.active = !isInBattle;
        this.summonButton.node.active = isBrought || isInBattle;
        this.bringNode.active = isBrought;
        this.fightNode.active = isInBattle;
    }

    onBringPet(isBring: boolean) {
        const pet = this.animalController?.Pet;
        if (!pet) return;
        pet.is_brought = isBring;
        this.updatePetActionButtons(pet);
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

    onSelectPetBattle(isSelectBattle: boolean) {
        const pet = this.animalController?.Pet;
        if (!pet) return;
        if (isSelectBattle) {
            this.showPopupBattlePlace(this.animalBattle, pet, isSelectBattle);
        } else {
            const index = this.animalBattle.findIndex(p => p.id === pet.id);
            if (index !== -1) {
                this.clearSlotByPetId(pet.id);
                this.animalBattle.splice(index, 1);
                this.updateAnimalSlotUI(pet, isSelectBattle);
            }
        }
    }

    onSortPetBattle() {
        const clonedPets = this.animalBattle.map(p => ({ ...p }));
        this.showPopupSortBattlePlace(clonedPets);
    }

    private async showPopupSortBattlePlace(pets: PetDTO[]) {
        const param: PopupBattlePlaceParam = {
            isPetItemDrag: true,
            pets: pets,
            onFinishSort: (sortedPets: PetDTO[]) => this.onFinishSortPetBattle(sortedPets)
        };
        await PopupManager.getInstance().openPopup('PopupBattlePlace', PopupBattlePlace, param);
    }

    private async showPopupBattlePlace(pets: PetDTO[], pet: PetDTO, isSelectBattle: boolean) {
        const param: PopupBattlePlaceParam = {
            isPetItemDrag: false,
            pets: pets,
            petSelected: pet,
            onFinishSelect: (slotIndex, pet, replacedSlot) => this.onFinishSelectPetBattlet(slotIndex, pet, replacedSlot, isSelectBattle)
        };
        await PopupManager.getInstance().openPopup('PopupBattlePlace', PopupBattlePlace, param);
    }

    private onFinishSortPetBattle(sortedPets: PetDTO[]) {
        this.animalBattle = sortedPets;
        this.itemDisplayPetFightings.forEach((item, index) => {
            item.clearPetInfoOnly();
        });
        for (const pet of sortedPets) {
            this.updateSlotPet(pet);
        }
    }

    private onFinishSelectPetBattlet(finalBattleSlot: number, selectedPet: PetDTO, replacedPetIds: string[], isSelectBattle: boolean = false) {
        const removedPets = this.animalBattle.filter(p => replacedPetIds.includes(p.id) && p.id !== selectedPet.id);
        for (const petInSlot of removedPets) {
            this.clearSlotByPetId(petInSlot.id);
        }
        this.animalBattle = this.animalBattle.filter(
            p => p.id !== selectedPet.id && !replacedPetIds.includes(p.id)
        );
        selectedPet.battle_slot = finalBattleSlot;
        this.animalBattle.push(selectedPet);
        this.updateSlotPet(selectedPet);
        this.updateAnimalSlotUI(selectedPet, isSelectBattle);
    }

    updateSlotPet(pet: PetDTO) {
        const slotIndex = pet.battle_slot - 1;
        const item = this.getFightingSlotItem(slotIndex);
        item?.setData(pet, slotIndex, this.showPetDetail.bind(this));
    }

    clearSlotByPetId(petId: string) {
        const pet = this.animalBattle.find(p => p.id === petId);
        if (!pet || pet.battle_slot <= 0) return;
        const item = this.getFightingSlotItem(pet.battle_slot - 1);
        item?.clearPetInfoOnly?.();
        const slotToReset = this.animalSlots.find(s => s.currentPet?.id === petId);
        if (slotToReset) slotToReset.setBattlePet(0);
        pet.battle_slot = 0;
    }

    getFightingSlotItem(slotIndex: number): ItemDisplayPetFighting | null {
        return (slotIndex >= 0 && slotIndex < this.itemDisplayPetFightings.length)
            ? this.itemDisplayPetFightings[slotIndex]
            : null;
    }

    updateAnimalSlotUI(pet: PetDTO, isSelectBattle: boolean) {
        const currentAnimalSlot = this.animalSlots.find(slot => slot.currentPet?.id === pet.id);
        if (currentAnimalSlot) {
            currentAnimalSlot.setBattlePet(isSelectBattle ? pet.battle_slot : 0);
        }
        this.updatePetActionButtons(pet);
    }
}
