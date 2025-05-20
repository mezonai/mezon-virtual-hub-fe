import { _decorator, Button, Component, Layers, Node, Prefab, RichText, ScrollView, Toggle } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { ItemAnimalSlot } from '../animal/ItemAnimalSlot';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { UIManager } from '../core/UIManager';
import { ConfirmPopup } from './ConfirmPopup';
import { ServerManager } from '../core/ServerManager';
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
    }

    onToggleChanged(toggled: Toggle) {
       console.log(this.selectedToggles)
        
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
        const selectedAnimals = this.itemAnimalSlots
            .filter(slot => slot.toggle?.isChecked)
            .map(slot => slot.animalController.Pet);
        const petString: string = JSON.stringify(selectedAnimals);
        let data = {
            pets: petString
        }
        ServerManager.instance.sendPetFollowPlayer(data);
       this.closePopup();
    }

    public async init(param?) {
        super.init(param);
        this.showPopup();

    }

    protected onLoad(): void {
        this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        this.saveButton.node.on(Button.EventType.CLICK, this.saveChange, this);
    }

    async closePopup(){
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
}


