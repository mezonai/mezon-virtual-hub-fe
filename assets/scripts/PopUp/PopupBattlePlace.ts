import { _decorator, Button } from 'cc';
import { BasePopup } from './BasePopup';
import { PetDTO } from '../Model/PetDTO';
import { PopupManager } from './PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from './PopupSelectionMini';
import { ItemSlotPet } from '../animal/ItemSlotpet';
import { InteractSlot } from '../animal/ItemSlotSkill';
const { ccclass, property } = _decorator;

@ccclass('PopupBattlePlace')
export class PopupBattlePlace extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Button }) confirmButton: Button = null;
    @property({ type: [ItemSlotPet] }) itemSlotPets: ItemSlotPet[] = [];
    private replacedPetIds: Set<string> = new Set<string>();
    private lastAssignedSlot: number | null = null;
    private param: PopupBattlePlaceParam;

    public init(param?: PopupBattlePlaceParam): void {
        this.closeButton.addAsyncListener(async () => { this.onClose(); });
        if (param == null) {
            this.onClose();
            return;
        }
        this.param = param;
        this.confirmButton.addAsyncListener(async () => { this.onClosePopupBattlePlace(); });
        this.setSlotPetFighting(param);
    }

    private setSlotPetFighting(param: PopupBattlePlaceParam) {
        const petMap = this.buildPetMapBySlot(param.pets);
        this.itemSlotPets.forEach((slot, index) => {
            slot.resetpet();
            const pet = petMap.get(index + 1) || null;
            if (param.isPetItemDrag)
                slot.initData(pet, InteractSlot.DRAG, this.itemSlotPets, null);
            else
                slot.initData(pet, InteractSlot.CLICK, this.itemSlotPets, () => {
                    this.handleSlotClick(param, index);
                });
        });
    }

    private buildPetMapBySlot(pets: PetDTO[] | null): Map<number, PetDTO> {
        const map = new Map<number, PetDTO>();
        if (!pets) return map;
        for (const pet of pets) {
            if (pet && typeof pet.battle_slot === 'number') {
                map.set(pet.battle_slot, pet);
            }
        }
        return map;
    }

    private async handleSlotClick(param: PopupBattlePlaceParam, slotIndex: number) {
        const selectedPet = param.petSelected;
        if (!selectedPet) return;
        const currentPetInSlot = param.pets.find(p => p.battle_slot === slotIndex + 1) || null;
        if (currentPetInSlot && currentPetInSlot.id === selectedPet.id) return;
        if (currentPetInSlot) {
            const content = `Vị trí <color=#ff4d4f>[${slotIndex + 1}]</color> đã có sẵn pet. Bạn có muốn thay thế bằng <color=#1890ff>" ${selectedPet.name} " </color>?`;
            const paramSelectionMini: SelectionMiniParam = {
                title: "Thông báo",
                content: content,
                textButtonLeft: "Có",
                textButtonRight: "Không",
                textButtonCenter: "",
                onActionButtonLeft: () => {
                    this.replacePetInSlot(param, slotIndex, selectedPet);
                },
                onActionButtonRight: () => {
                    if (panel?.node?.uuid) {
                        PopupManager.getInstance().closePopup(panel.node.uuid);
                    }
                }
            };
            const panel = await PopupManager.getInstance().openPopup<PopupSelectionMini>('PopupSelectionMini', PopupSelectionMini, paramSelectionMini);
        } else {
            this.replacePetInSlot(param, slotIndex, selectedPet);
        }
    }

    private replacePetInSlot(param: PopupBattlePlaceParam, slotIndex: number, newPet: PetDTO) {
        const battleSlot = slotIndex + 1;
        const oldPet = param.pets.find(p => p.battle_slot === battleSlot);
        if (oldPet && oldPet.id !== newPet.id) {
            this.replacedPetIds.add(oldPet.id);
        }
        const clonedPet: PetDTO = { ...newPet, battle_slot: battleSlot };
        param.pets = param.pets.filter(p => p.id !== newPet.id && p.battle_slot !== battleSlot);
        param.pets.push(clonedPet);
        param.pets.sort((a, b) => a.battle_slot - b.battle_slot);
        this.setSlotPetFighting(param);
        this.lastAssignedSlot = battleSlot;
        this.param = param;
    }

    confirmSort() {
        for (let i = 0; i < this.itemSlotPets.length; i++) {
            const pet = this.itemSlotPets[i].itemPlacePet?.currentpet;
            if (pet) pet.battle_slot = i + 1;
        }
        this.param.onFinishSort?.(this.param.pets);
    }

    onClosePopupBattlePlace() {
        if (this.param.isPetItemDrag) {
            this.ShowPopUpConfirm();
        } else {
            if (this.param?.onFinishSelect && this.lastAssignedSlot != null) {
                this.param.onFinishSelect(
                    this.lastAssignedSlot,
                    this.param.petSelected,
                    Array.from(this.replacedPetIds)
                );
            }
            this.onClose();
        }
    }

    onClose() {
        PopupManager.getInstance().closePopup(this.node.uuid);
    }

    async ShowPopUpConfirm() {
        const panel = await PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có chắc chắn muốn lưu thay đổi?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: () => {
                this.confirmSort();
                PopupManager.getInstance().closePopup(this.node.uuid);
            },
            onActionButtonRight: async () => {
                if (panel?.node?.uuid) {
                    await Promise.all([
                        PopupManager.getInstance().closePopup(panel.node.uuid),
                        PopupManager.getInstance().closePopup(this.node.uuid),
                    ]);
                }
            },
        });
    }

}

export interface PopupBattlePlaceParam {
    isPetItemDrag: boolean,
    pets: PetDTO[];
    petSelected?: PetDTO;
    onFinishSelect?: (isSelectBattle: number, pet: PetDTO, replacedSlots?: string[]) => void;
    onFinishSort?: (sortedPets: PetDTO[]) => void;
}

