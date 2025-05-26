import { _decorator, Button, Component, instantiate, Node, Prefab, ScrollView } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemChooseFood } from '../animal/ItemChooseFood';
import { ConfirmPopup } from './ConfirmPopup';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { AnimalType } from '../animal/AnimalController';
import { UIManager } from '../core/UIManager';
import { Food } from '../Model/Item';
import { ResourceManager } from '../core/ResourceManager';

const { ccclass, property } = _decorator;

@ccclass('PopupChooseFoodPet')
export class PopupChooseFoodPet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Button }) chooseButton: Button = null;
    @property({ type: Prefab }) iItemChooseFood: Prefab = null;
    @property({ type: ScrollView }) scrollView: ScrollView = null;
    private foodChoosen: Food | null;
    private quantity: number = 0;
    public async init(param?) {
        if (!param || param.animal == null) {
            return;
        }
        this.showPopup(param);
    }

    showPopup(param?: any) {
        for (let i = 0; i < ResourceManager.instance.FoodData.data.length; i++) {
            let newitem = instantiate(this.iItemChooseFood);
            newitem.setParent(this.scrollView.content);
            let itemChooseFood = newitem.getComponent(ItemChooseFood);
            if (itemChooseFood == null) continue;
            itemChooseFood.setDataItem(ResourceManager.instance.FoodData.data[i], this.chooseFood.bind(this));
            if (i == 0) itemChooseFood.boundToggleCallback();// gọi item đầu để lấy food;
        }
        this.chooseButton.node.on(Button.EventType.CLICK, () => {
            (async () => {
                if (param.animal.animalMoveType == AnimalType.Caught) {
                    UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã bị bắt. Chúc bạn may mắn lần sau`);
                    this.closePopup();
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
                        console.log("UserMeManager.GetFoods", UserMeManager.GetFoods);
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
    }

    chooseFood(food: Food, quantity: number) {
        this.foodChoosen = food;
        this.quantity = quantity;
    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }
}


