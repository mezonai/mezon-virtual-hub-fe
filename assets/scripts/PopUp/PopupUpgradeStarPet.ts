import { _decorator, Button, Toggle, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { UserMeManager } from '../core/UserMeManager';
import { AnimalRarity, MergePetRequestPayload, PetDTO } from '../Model/PetDTO';
import { PopupManager } from './PopupManager';
import { ItemAnimalSlotDrag } from '../animal/ItemAnimalSlotDrag';
import { ConfirmParam, ConfirmPopup } from './ConfirmPopup';
import { WebRequestManager } from '../network/WebRequestManager';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { PopupCombiePet, PopupCombiePetParam } from './PopupCombiePet';
import { StatsConfigDTO } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PopupUpgradeStarPet')
export class PopupUpgradeStarPet extends BasePopup {
    @property({ type: Button }) mergeButton: Button = null;
    @property({ type: Toggle }) keepPetStatsToggle: Toggle = null;
    @property({ type: RichText }) mergePetDiamondText: RichText = null;
    @property({ type: RichText }) rateMergeText: RichText = null;
    private _isKeepPetStats = false;
    private petMerge: PetDTO;
    @property({ type: ItemAnimalSlotDrag }) slotPet: ItemAnimalSlotDrag[] = [];
    @property({ type: SlotPetDetail }) slotPetDetail: SlotPetDetail[] = [];
    updateListPet: ((updatedPets: PetDTO[]) => void) | null = null;
    getConfigRate: StatsConfigDTO;
    upgradeStarsDiamond: number;

    public init(param?: UpgradeStarPetInitParam): void {
        if (param?.onUpdate) {
            this.updateListPet = param.onUpdate;
        }
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
        this.getConfigRateAsync()
    }

    async getConfigRateAsync() {
        this.getConfigRate = await WebRequestManager.instance.getConfigRateAsync();
        this.getMoneyUpgrade();
    }

    async getMoneyUpgrade() {
        this.upgradeStarsDiamond = this.getConfigRate.costs.upgradeStarsDiamond;
        this.mergePetDiamondText.node.active = this.upgradeStarsDiamond > 0;
        this.mergePetDiamondText.string = this.upgradeStarsDiamond > 0 ? `-Tốn: ${this.upgradeStarsDiamond}` : "";
    }

    keepPetStats(toggle: Toggle) {
        if (!this.checkDiamondUser(this.upgradeStarsDiamond)) {
            this._isKeepPetStats = false;
            this.keepPetStatsToggle.isChecked = false;
            return;
        }

        this._isKeepPetStats = toggle.isChecked;
        this.keepPetStatsToggle.isChecked = this._isKeepPetStats;
    }

    checkDiamondUser(price: number): boolean {
        if (UserMeManager.playerDiamond < price) {
            const param: ConfirmParam = {
                message: "Không đủ kim cương để dùng",
                title: "Chú ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            return false;
        }
        return true;
    }

    async merge() {
        const allPetIds = this.getAllPetIds();
        if (allPetIds.length === 0) return;
        const data: MergePetRequestPayload = {
            pet_ids: allPetIds,
            keep_highest_iv: this._isKeepPetStats,
        };
        const dataPetMerge = await WebRequestManager.instance.postUpgradeStarPetAsync(data);
        this.petMerge = dataPetMerge.pet;
        if (this.petMerge == null) {
            return;
        }
        else {
            const pets = this.slotPet
                .map(slot => slot.itemPlacePetUpgrade?.currentPet)
                .filter((pet): pet is PetDTO => !!pet);
            this.clearAllSlots();
            PopupManager.getInstance().openPopup('PopupCombiePet', PopupCombiePet, {
                listPets: pets,
                petMerge: this.petMerge,
                isSuccess: dataPetMerge.success,
                onFinishAnim: async () => {
                    const myPets = await WebRequestManager.instance.getMyPetAsync();
                    this.updateListPet?.(myPets);
                    UserMeManager.playerDiamond = dataPetMerge.user_diamond;
                }
            } as PopupCombiePetParam);
        }
    }

    private showConfirm(message: string) {
        const param: ConfirmParam = {
            message,
            title: "Chú ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    private getAllPetIds(): string[] {
        const pets = this.getPetsForMerge();
        if (pets.some(p => p.stars >= 3)) {
            this.showConfirm("Thú cưng đã đạt sao cao nhất không thể nâng hơn nữa!!!");
            return [];
        }
        
        if (!this.hasEnoughPets(pets)) {
            this.showConfirm("Cần 3 thú cưng để có thể nâng sao!!!");
            return [];
        }

        if (!this.arePetsCompatible(pets)) {
            this.showConfirm("Các thú cưng được chọn phải cùng loài, cùng số sao, cùng hệ và độ hiếm!!!");
            return [];
        }

        const ids = pets.map(p => p.id);
        return ids;
    }

    public getPetsForMerge(): PetDTO[] {
        return this.slotPet
            .map(slot => slot.itemPlacePetUpgrade?.currentPet)
            .filter((pet): pet is PetDTO => !!pet);
    }

    private hasEnoughPets(pets: PetDTO[]): boolean {
        return pets.length >= 3;
    }

    private arePetsCompatible(pets: PetDTO[]): boolean {
        if (!pets.length) return false;

        const { species, type, rarity } = pets[0].pet;
        const stars = pets[0].stars;

        return pets.every(p =>
            p.pet.species === species &&
            p.pet.type === type &&
            p.pet.rarity === rarity &&
            p.stars === stars
        );
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

    private SetRateMerge(): void {
        const pets = this.getPetsForMerge();
        if (pets.length < 3) {
            this.updateRateUI(0);
            return;
        }

        const rarity = pets[0].pet.rarity;
        const rateMerge = this.getRateByRarity(rarity);

        this.updateRateUI(rateMerge);
    }

    private getRateByRarity(rarity: string): number {
        const configs = this.getConfigRate.percentConfig;
        return configs.upgradeStars[rarity] ?? 0;
    }

    private updateRateUI(rateMerge: number): void {
        this.rateMergeText.string = rateMerge > 0
            ? `<outline color=#222222 width=1> Tỷ lệ thành công: ${rateMerge} %</outline>`
            : "<outline color=#222222 width=1> Tỷ lệ thành công: --- %</outline>";
    }

    showDetailPanel(slot: ItemAnimalSlotDrag, pet: PetDTO) {
        const index = this.slotPet.findIndex(s => s === slot);
        if (index === -1) {
            return;
        }
        const detail = this.slotPetDetail[index];
        if (!detail) {
            return;
        }
        detail.showDetailPanel(pet);
        this.SetRateMerge();
    }

    hideDetailPanel(slot: ItemAnimalSlotDrag) {
        const index = this.slotPet.findIndex(s => s === slot);
        if (index === -1) return;

        const detail = this.slotPetDetail[index];
        if (!detail) return;
        detail.clearPetDetail();
        this.SetRateMerge();
    }
}

export interface UpgradeStarPetInitParam {
    onUpdate?: (updatedPets: PetDTO[]) => void;
}