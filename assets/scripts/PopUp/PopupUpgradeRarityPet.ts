import { _decorator, Button, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { PopupManager } from './PopupManager';
import { ItemAnimalSlotDrag } from '../animal/ItemAnimalSlotDrag';
import { ConfirmParam, ConfirmPopup } from './ConfirmPopup';
import { WebRequestManager } from '../network/WebRequestManager';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { InventoryDTO, ItemCode, StatsConfigDTO } from '../Model/Item';
import { Constants } from '../utilities/Constants';
import { PopupResultUpgradeRarityPet, PopupUpgradeRarityPetParam } from './PopupResultUpgradeRarityPet';
import { ItemCardUpgradePet } from '../animal/ItemCardUpgradePet';
const { ccclass, property } = _decorator;

@ccclass('PopupUpgradeRarityPet')
export class PopupUpgradeRarityPet extends BasePopup {
    @property({ type: ItemAnimalSlotDrag }) slotPets: ItemAnimalSlotDrag[] = [];
    @property({ type: SlotPetDetail }) slotPetDetails: SlotPetDetail[] = [];
    @property({ type: ItemCardUpgradePet }) itemCardUpgradePet: ItemCardUpgradePet[] = [];
    @property({ type: Button }) upgradeButton: Button = null;
    @property({ type: RichText }) rateMergeText: RichText = null;
    updateListPet: ((updatedPets: PetDTO[]) => void) | null = null;
    private petUpgrade: PetDTO;
    getConfigRate: StatsConfigDTO;
    upgradeStarsDiamond: number;
    getItemCard: InventoryDTO[];

    public init(param?: UpgradeRarityPetInitParam): void {
        if (param?.onUpdate) {
            this.updateListPet = param.onUpdate;
        }
        this.upgradeButton.addAsyncListener(async () => {
            this.upgradeButton.interactable = false;
            this.UpgradeRarityPet();
            this.upgradeButton.interactable = true;
        });
        this.slotPets.forEach(element => {
            element.onShowDetail = (slot, petData) => {
                this.showDetailPanel(slot, petData);
            };
            element.onHideDetail = (slot) => {
                this.hideDetailPanel(slot);
            };
        });
        this.getConfigRateAsync();

    }

    async getConfigRateAsync() {
        this.getConfigRate = await WebRequestManager.instance.getConfigRateAsync();
        const inventoryList = await WebRequestManager.instance.getItemTypeAsync(8);
        const itemCardPet = inventoryList.filter(inv => inv.item?.type === 8);
        for (let i = 0; i < this.itemCardUpgradePet.length; i++) {
            const itemCard = this.itemCardUpgradePet[i];
            const inv = itemCardPet[i];
            if (inv && inv.item) {
                itemCard.setDataItem(inv)
            } else {
                itemCard.node.active = false;
            }
        }
    }

    private hasTicketForPet(pet: any): boolean {
        const ticketType = this.getRequiredTicketType(pet.pet.rarity);
        if (!ticketType) return false;
        const ticket = this.itemCardUpgradePet.find(
            item => item._item?.item?.item_code === ticketType
        );
        const qty = ticket?._item?.quantity ?? 0;
        return qty > 0;
    }

    private getRequiredTicketType(petRarity: string): ItemCode | null {
        switch (petRarity.toLowerCase()) {
            case 'common':
                return ItemCode.RARITY_CARD_RARE;
            case 'rare':
                return ItemCode.RARITY_CARD_EPIC;
            case 'epic':
                return ItemCode.RARITY_CARD_LEGENDARY;
            default:
                return null;
        }
    }

    async UpgradeRarityPet() {
        const pet = this.slotPets[0]?.itemPlacePetUpgrade?.currentPet;
        if (!pet) return;
        if (!this.CheckStarPets(pet)) {
            this.showConfirm("Pet chưa đạt 3 sao, không thể nâng cấp độ hiếm!!!");
            return;
        }
        const hasTicket = await this.hasTicketForPet(pet);
        if (!hasTicket) {
            this.showConfirm("Bạn cần thẻ nâng bậc để tiến hóa Pet!");
            return;
        }
        const dataPetMerge = await WebRequestManager.instance.postUpgradeRarityPetAsync(pet.id);
        this.petUpgrade = dataPetMerge.pet;
        if (this.petUpgrade == null) {
            return;
        } else {
            this.clearAllSlots();
            PopupManager.getInstance().openPopup('PopupResultUpgradeRarityPet', PopupResultUpgradeRarityPet, {
                petMerge: this.petUpgrade,
                isSuccess: dataPetMerge.success,
                onFinishAnim: async () => {
                    const myPets = await WebRequestManager.instance.getMyPetAsync();
                    this.updateListPet?.(myPets);
                    await this.getConfigRateAsync();
                }
            } as PopupUpgradeRarityPetParam);
        }
    }

    private CheckStarPets(pets: PetDTO): boolean {
        return pets.stars == 3;
    }

    private showConfirm(message: string) {
        const param: ConfirmParam = {
            message,
            title: "Chú ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    private clearAllSlots() {
        const slot = this.slotPets[0];
        if (slot) {
            slot.refeshSlot();
            slot.itemPlacePetUpgrade = null;
            this.hideDetailPanel(slot);
        }
    }

    private SetRateMerge(): void {
        const firstPet = this.slotPets[0]?.itemPlacePetUpgrade?.currentPet;
        if (!firstPet) {
            this.updateRateUI(0);
            return;
        }

        if (firstPet.pet.rarity === AnimalRarity.LEGENDARY) {
            this.updateRateUI(0);
            return;
        }
        const rateMerge = this.getRateByRarity(firstPet.pet.rarity);
        this.updateRateUI(rateMerge);
    }

    private getRateByRarity(rarity: string): number {
        const nextRarity = Constants.rarityUpgradeMap[rarity];
        if (!nextRarity) return 0;

        const configs = this.getConfigRate.percentConfig;
        return configs.upgradeRarity[nextRarity] ?? 0;
    }

    private updateRateUI(rateMerge: number): void {
        this.rateMergeText.string = rateMerge > 0
            ? `<outline color=#222222 width=1> Tỷ lệ thành công: ${rateMerge} %</outline>`
            : "<outline color=#222222 width=1> Tỷ lệ thành công: --- %</outline>";
    }

    showDetailPanel(slot: ItemAnimalSlotDrag, pet: PetDTO) {
        this.slotPetDetails[0].showDetailPanel(pet);
        this.SetRateMerge();
    }

    hideDetailPanel(slot: ItemAnimalSlotDrag) {
        this.slotPetDetails[0].clearPetDetail();
        this.SetRateMerge();
    }
}

export interface UpgradeRarityPetInitParam {
    onUpdate?: (updatedPets: PetDTO[]) => void;
}