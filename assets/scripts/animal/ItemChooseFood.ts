import { _decorator, Button, Component, director, Label, Node, Sprite, SpriteFrame, Toggle, Vec3 } from 'cc';
import { Food, FoodType, InventoryDTO } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { AnimalController, AnimalType } from './AnimalController';
import { UIManager } from '../core/UIManager';
import { PopupManager } from '../PopUp/PopupManager';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { PopupChooseFoodPet } from '../PopUp/PopupChooseFoodPet';
import Utilities from '../utilities/Utilities';
import { ConfirmParam, ConfirmPopup } from '../PopUp/ConfirmPopup';
const { ccclass, property } = _decorator;

@ccclass('ItemChooseFood')
export class ItemChooseFood extends Component {
    @property({ type: Button }) buttonChooseFood: Button = null;
    @property({ type: Sprite }) spriteicon: Sprite = null;
    @property({ type: Label }) quantity: Label = null;
    @property({ type: [SpriteFrame] }) spriteFramesFood: SpriteFrame[] = [];
    private foodDTO: InventoryDTO = null;
    private stopDistance = 250;
    private isCooldown = false;
    setDataItem(food: Food, foodDTO: InventoryDTO, animalController: AnimalController, OnCloseCatch: () => void, onThrowFood: (foodType: FoodType) => void) {
        const typeToIndexMap: Record<FoodType, number> = {
            [FoodType.NORMAL]: 0,
            [FoodType.PREMIUM]: 1,
            [FoodType.ULTRA_PREMIUM]: 2
        };
        this.spriteicon.spriteFrame = this.spriteFramesFood[typeToIndexMap[food.type]];
        this.foodDTO = foodDTO;
        let quantity = foodDTO?.quantity ?? 0;
        this.quantity.string = Utilities.convertBigNumberToStr(quantity.toString());
        this.buttonChooseFood.node.off(Button.EventType.CLICK, () => this.catchPet(food, animalController, onThrowFood, OnCloseCatch), this);
        this.buttonChooseFood.node.on(Button.EventType.CLICK, () => this.catchPet(food, animalController, onThrowFood, OnCloseCatch), this);
    }

    updateQuantityFood(id: string, quantity: number) {
        if (!this.foodDTO || this.foodDTO.id != id) return;
        this.quantity.string = Utilities.convertBigNumberToStr(quantity.toString());
    }

    catchPet(food: Food, animalController: AnimalController, onThrowFood: (foodType: FoodType) => void, OnCloseCatch: () => void) {
        if (this.isCooldown) return;
        this.isCooldown = true;
        OnCloseCatch();
        setTimeout(() => {
            this.isCooldown = false;
        }, 500);
        (async () => {
            if (!this.canCacthPet(animalController)) return;
            if (animalController.animalType == AnimalType.Caught) {
                const param: ConfirmParam = {
                    message: "Thú cưng đã bị bắt. Chúc bạn may mắn lần sau",
                    title: "Thông báo",
                };
                PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
                return;
            }
            if (animalController.animalType == AnimalType.Disappeared) {
                this.showUiPetDisappeared();
                return;
            }
            const foodThrow = UserMeManager.GetFoods?.find(inv => inv.food.id === food.id);
            let quantity = foodThrow?.quantity ?? 0;
            if (quantity <= 0) {
                PopupManager.getInstance().openAnimPopup('PopupChooseFoodPet', PopupChooseFoodPet, { message: "No food" });
                return;
            }
            if (onThrowFood) {
                const foodThrow = UserMeManager.GetFoods?.find(inv => inv.food.id === food.id);
                if (foodThrow && foodThrow.quantity > 0) {
                    await onThrowFood(food.type);
                    if (animalController?.Pet == null) {
                        this.showUiPetDisappeared();
                        return;
                    }
                    foodThrow.quantity -= 1;
                    let data = {
                        player: UserMeManager.Get.user,
                        petId: animalController.Pet?.id ?? "0",
                        foodId: food.id,
                    }
                    ServerManager.instance.sendCatchPet(data);

                }

            }
        })();
    }

    showUiPetDisappeared() {
        const param: ConfirmParam = {
            message: "Thú cưng đã đi rồi. Lần sau nhanh tay lên nhé",
            title: "Thông báo",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    canCacthPet(target: AnimalController): boolean {
        const playePos = UserManager.instance?.GetMyClientPlayer?.node.getWorldPosition();
        if (!playePos || !target) return;
        if (target.animalType == AnimalType.Disappeared) {
            const param: ConfirmParam = {
                message: "Thú cưng đã đi rồi. Lần sau nhanh tay lên nhé",
                title: "Thông báo",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            return false;
        }
        const targetPos = target.node?.getWorldPosition();
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, playePos);
        let distance = direction.length();
        if (distance < this.stopDistance) {
            return true;
        }
        const param: ConfirmParam = {
            message: "Thú cưng xa quá rồi dí theo nào",
            title: "Thông báo",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
        return false;
    }

    setDataItemTutorial(food: Food) {
        const typeToIndexMap: Record<FoodType, number> = {
            [FoodType.NORMAL]: 0,
            [FoodType.PREMIUM]: 1,
            [FoodType.ULTRA_PREMIUM]: 2
        };
        this.spriteicon.spriteFrame = this.spriteFramesFood[typeToIndexMap[food.type]];
        let quantity = food.type == FoodType.NORMAL ? 1 : 0;
        this.quantity.string = quantity.toString();
    }
}


