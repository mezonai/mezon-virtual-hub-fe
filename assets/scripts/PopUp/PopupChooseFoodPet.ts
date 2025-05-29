import { _decorator, Button, Component, instantiate, Node, Prefab, ScrollView, Vec3 } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemChooseFood } from '../animal/ItemChooseFood';
import { ConfirmPopup } from './ConfirmPopup';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { UIManager } from '../core/UIManager';
import { Food } from '../Model/Item';
import { ResourceManager } from '../core/ResourceManager';
import { PlayerController } from '../gameplay/player/PlayerController';
import { UserManager } from '../core/UserManager';

const { ccclass, property } = _decorator;

@ccclass('PopupChooseFoodPet')
export class PopupChooseFoodPet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Button }) chooseButton: Button = null;
    @property({ type: Prefab }) iItemChooseFood: Prefab = null;
    @property({ type: ScrollView }) scrollView: ScrollView = null;
    private stopDistance = 10000;
    private checkCloseInterval: number;
    private foodChoosen: Food | null;
    private quantity: number = 0;
    public async init(param?) {
        if (!param || param.animal == null) {
            return;
        }
        this.showPopup(param);
    }

    showPopup(param?: any) {
        this.chooseButton.node.on(Button.EventType.CLICK, () => {
            (async () => {
                if (param.animal.animalMoveType == AnimalType.Caught) {
                    UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã bị bắt. Chúc bạn may mắn lần sau`);
                    this.closePopup();
                    return;
                }
                if (param.animal.animalMoveType == AnimalType.Disappeared) {
                    this.showUiPetDisappeared();
                    return;
                }
                if (this.quantity <= 0) {
                    PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, { message: `${this.foodChoosen.name} không còn để cho ăn` });
                    return;
                }
                if (param.onThrowFood) {
                    this.node.active = false;
                    await param.onThrowFood(this.foodChoosen.type);
                    const foodThrow = UserMeManager.GetFoods?.find(inv => inv.food.id === this.foodChoosen.id);
                    if (foodThrow && foodThrow.quantity > 0) {
                        foodThrow.quantity -= 1;
                    }
                    let data = {
                        player: UserMeManager.Get.user,
                        petId: param.animal.pet.id,
                        foodId: this.foodChoosen.id,
                    }
                    ServerManager.instance.sendCatchPet(data);
                }
                this.closePopup();
            })();
        }, this);

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            if (param.onCancelCatch) param.onCancelCatch();
            this.closePopup();
        }, this);
        this.checkCloseInterval = setInterval(() => {
            this.checkPetsDistance(param.animal);
        }, 5000);
        for (let i = 0; i < ResourceManager.instance.FoodData.data.length; i++) {
            let newitem = instantiate(this.iItemChooseFood);
            newitem.setParent(this.scrollView.content);
            let itemChooseFood = newitem.getComponent(ItemChooseFood);
            if (itemChooseFood == null) continue;
            itemChooseFood.setDataItem(ResourceManager.instance.FoodData.data[i], this.chooseFood.bind(this));
            if (i == 0) itemChooseFood.boundToggleCallback();// gọi item đầu để lấy food;
        }        
    }

    chooseFood(food: Food, quantity: number) {
        this.foodChoosen = food;
        this.quantity = quantity;
    }

    async closePopup() {
        if (this.checkCloseInterval) clearInterval(this.checkCloseInterval);
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }

    checkPetsDistance(target: AnimalController) {
        const playePos = UserManager.instance?.GetMyClientPlayer?.node.getWorldPosition();      
        if (!playePos || !target) return;
        if (target.animalType == AnimalType.Disappeared) {
            this.showUiPetDisappeared();
            return;
        }
        const targetPos = target.node?.getWorldPosition();
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, playePos);
        let distance = direction.length();
        if (distance < this.stopDistance) {
            return;
        }
        UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng xa quá rồi dí theo nào`);
        this.closePopup();
    }

    showUiPetDisappeared() {
        UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã đi rồi. Lần sau nhanh tay lên nhé`);
        this.closePopup();
    }
}


