import { _decorator, Node, Vec3, Layers, Prefab, ScrollView } from 'cc';
import { BasePopup } from './BasePopup';
import { UserMeManager } from '../core/UserMeManager';
import { AnimalRarity, MergePetRequestPayload, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { AnimalController } from '../animal/AnimalController';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { InteractSlot } from '../animal/ItemSlotSkill';
import { ItemSlotPet } from '../animal/ItemSlotpet';
import { ItemAnimalSlotDrag } from '../animal/ItemAnimalSlotDrag';
import { ItemPlacePetDrag } from '../animal/ItemPlacePetUpgrade';
import { ConfirmParam, ConfirmPopup } from './ConfirmPopup';
import { WebRequestManager } from '../network/WebRequestManager';
import { Toggle } from 'cc';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { UITransform } from 'cc';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupUpgradeStarPet')
export class PopupUpgradeStarPet extends BasePopup {
    @property({ type: Button }) mergeButton: Button = null;
    @property({ type: Toggle }) keepPetStatsToggle: Toggle = null;
    private _isKeepPetStats = false;
    private petMerge: PetDTO;
    @property({ type: ItemAnimalSlotDrag }) slotPet: ItemAnimalSlotDrag[] = [];
    @property({ type: SlotPetDetail }) slotPetDetail: SlotPetDetail[] = [];
    updateListPet: ((updatedPets: PetDTO[]) => void) | null = null;

    protected start(): void {
        this.mergeButton.addAsyncListener(async () => {
            this.mergeButton.interactable = false;
            this.merge();
            this.mergeButton.interactable = true;
        });
        this.keepPetStatsToggle.node.on(Toggle.EventType.TOGGLE, this.keepPetStats, this);

        this.slotPet.forEach(element => {
            element.onShowDetail = (slot, petData) => {
                this.showDetailPanel(slot, petData);
            };
            element.onHideDetail = (slot) => {
                this.hideDetailPanel(slot);
            };
        });
    }

    private keepPetStats(toggle: Toggle) {
        this._isKeepPetStats = toggle.isChecked;
        this.keepPetStatsToggle.isChecked = this._isKeepPetStats;
    }

    async merge() {
        const allPetIds = this.getAllPetIds();
        console.log("allPetIds: ", allPetIds);
        if (allPetIds.length === 0) return;
        const data: MergePetRequestPayload = {
            pet_ids: allPetIds,
            keep_highest_iv: this._isKeepPetStats,
        };
        console.log("Payload JSON:",);
        this.petMerge = await WebRequestManager.instance.postMergePetAsync(data);
        if (this.petMerge == null) {
            return;
        }
        else {
            console.log("merge thanh công ", this.petMerge);
            this.clearAllSlots();
            const myPets = await WebRequestManager.instance.getMyPetAsync();
            this.updateListPet?.(myPets);
        }
    }

    moveItemToSlot(itemNode: Node, targetSlot: Node, onComplete?: Function) {
        let worldPos = targetSlot.worldPosition;
        let localPos = itemNode.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);

        // Tween di chuyển
        tween(itemNode)
            .to(0.3, { position: new Vec3(localPos.x, localPos.y, 0) }, { easing: 'quadOut' })
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }

    private showConfirm(message: string) {
        const param: ConfirmParam = {
            message,
            title: "Chú ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    private getAllPetIds(): string[] {
        const pets = this.slotPet
            .map(slot => slot.itemPlacePetUpgrade?.currentPet)
            .filter((pet): pet is PetDTO => !!pet);

        if (pets.length < 3) {
            console.log("[getAllPetIds] Không đủ pet, pets:", pets);
            this.showConfirm("Cần 3 thú cưng để có thể hợp thể!!!");
            return [];
        }

        const species = pets[0].pet.species;
        const type = pets[0].pet.type;
        const rarity = pets[0].pet.rarity;
        const stars = pets[0].stars;

        const isValid = pets.every(p =>
            p.pet.species === species &&
            p.pet.type === type &&
            p.pet.rarity === rarity &&
            p.stars === stars
        );

        if (!isValid) {
            console.log("[getAllPetIds] Pet không hợp lệ:", pets.map(p => ({
                id: p.id,
                species: p.pet.species,
                stars: p.stars,
                type: p.pet.type,
                rarity: p.pet.rarity
            })));
            this.showConfirm("Các thú cưng được chọn phải cùng loài, cùng số sao, cùng hệ và độ hiếm!!!");
            return [];
        }
        const ids = pets.map(p => p.id);
        console.log("[getAllPetIds] Pet hợp lệ, ids:", ids);
        return ids;
    }

    private clearAllSlots() {
        this.slotPet.forEach(slot => {
            if (slot.itemPlacePetUpgrade) {
                slot.refeshSlot();
                slot.itemPlacePetUpgrade = null;
                this.hideDetailPanel(slot);
            }
        });
    }

    showDetailPanel(slot: ItemAnimalSlotDrag, pet: PetDTO) {
        const index = this.slotPet.findIndex(s => s === slot);
        if (index === -1) {
            return;
        }
        console.log("Hiển thị detail cho slot index:", index, "slot:", slot, "pet:", pet);
        const detail = this.slotPetDetail[index];
        if (!detail) {
            return;
        }

        detail.showDetailPanel(pet, index);
    }

    hideDetailPanel(slot: ItemAnimalSlotDrag) {
        const index = this.slotPet.findIndex(s => s === slot);
        if (index === -1) return;

        const detail = this.slotPetDetail[index];
        if (!detail) return;
        detail.clearPetDetail();
    }
}