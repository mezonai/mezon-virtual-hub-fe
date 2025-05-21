import { _decorator, Button, Component, Layers, Node, Prefab, RichText, ScrollView, Toggle } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemAnimalSlot } from '../animal/ItemAnimalSlot';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { UIManager } from '../core/UIManager';
import { ConfirmPopup } from './ConfirmPopup';
import { ServerManager } from '../core/ServerManager';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('PopupOwnedAnimals')
export class PopupOwnedAnimals extends BasePopup {
    @property({ type: RichText }) descriptionText: RichText = null;
    @property({ type: Button }) saveButton: Button = null;
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Prefab }) itemAnimalSlotPrefab: Prefab = null;
    @property({ type: ScrollView }) scrollView: ScrollView = null;
    private itemAnimalSlots: ItemAnimalSlot[] = [];
    private selectedToggles: Toggle[] = [];
    private selectedPetInit: string[] = [];
    private maxSelected = 3;
    showDecription() {
        this.descriptionText.string = "Bạn Có thể chọn 3 thú cưng để dắt theo bên mình";
    }

    showPopup() {
        this.showDecription();
        let animals = UserMeManager.Get.animals;
        if (animals == null || animals.length <= 0) return;
        for (let i = 0; i < animals.length; i++) {
            let newitemAnimalSlot = ObjectPoolManager.instance.spawnFromPool(this.itemAnimalSlotPrefab.name);
            newitemAnimalSlot.setParent(this.scrollView.content);
            let itemPetSlot = newitemAnimalSlot.getComponent(ItemAnimalSlot);
            if (itemPetSlot == null) continue;
            itemPetSlot.setDataSlot(animals[i], this.onToggleChanged.bind(this));
            this.itemAnimalSlots.push(itemPetSlot);
        }
        this.selectedPetInit = this.itemAnimalSlots
            .filter(slot => slot.toggle?.isChecked)
            .map(slot => slot.animalController.Pet.id);
    }

    onToggleChanged(toggled: Toggle) {
        if (toggled.isChecked) {
            if (this.selectedToggles.length >= this.maxSelected) {
                toggled.isChecked = false;
                PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, { message: "Bạn chỉ được chọn 3 thú cưng mang theo" });
                return;
            }
            // Nếu dưới this.maxSelected, cho chọn và thêm vào danh sách
            this.selectedToggles.push(toggled);
        } else {
            // Bỏ chọn toggle → xóa khỏi danh sách
            const index = this.selectedToggles.indexOf(toggled);
            if (index !== -1) {
                this.selectedToggles.splice(index, 1);
            }
        }

    }

    saveChange() {
        const selectedAnimalsId = this.itemAnimalSlots
            .filter(slot => slot.toggle?.isChecked)
            .map(slot => slot.animalController.Pet.id);
        if (
            this.selectedPetInit.length === selectedAnimalsId.length &&
            this.selectedPetInit.every(id => selectedAnimalsId.includes(id))
        ) {
            this.closePopup();
            return;
        }
        const pets = UserMeManager.Get.animals;
        if (!pets || pets.length === 0) return;

        // Cập nhật is_brought và tạo danh sách pet được chọn
        const petFollowUser = pets.filter(pet => {
            pet.is_brought = selectedAnimalsId.includes(pet.id);
            return pet.is_brought;
        });
        console.log("petFollowUser", petFollowUser);
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
    }
    public async init(param?) {
        super.init(param);
        this.showPopup();

    }

    protected onLoad(): void {
        this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        this.saveButton.node.on(Button.EventType.CLICK, this.saveChange, this);
    }

    async closePopup() {
        for (let i = 0; i < this.itemAnimalSlots.length; i++) {
            const item = this.itemAnimalSlots[i];
            await item.resetAnimal();
            ObjectPoolManager.instance.returnToPool(item.node);
        }
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }

    onUpdateSuccess(respone) {

    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


