import { _decorator, Button, Component, director, Label, Node, Sprite, SpriteFrame, Toggle, Vec3 } from 'cc';
import { Food, FoodType, InventoryDTO } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { AnimalController, AnimalType } from './AnimalController';
import { UIManager } from '../core/UIManager';
import { PopupManager } from '../PopUp/PopupManager';
import { ConfirmPopup } from '../PopUp/ConfirmPopup';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { PopupChooseFoodPet } from '../PopUp/PopupChooseFoodPet';
import { EVENT_NAME } from '../network/APIConstant';
import Utilities from '../utilities/Utilities';
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
    protected start(): void {
        director.on(EVENT_NAME.ON_UPDATE_FOOD_PET, this.updateQuantityFood, this);
    }
    setDataItem(food: Food, foodDTO: InventoryDTO, animalController: AnimalController, onThrowFood: (foodType: FoodType) => void) {
        const typeToIndexMap: Record<FoodType, number> = {
            [FoodType.NORMAL]: 0,
            [FoodType.PREMIUM]: 1,
            [FoodType.ULTRA_PREMIUM]: 2
        };
        this.spriteicon.spriteFrame = this.spriteFramesFood[typeToIndexMap[food.type]];
        this.foodDTO = foodDTO;
        let quantity = foodDTO?.quantity ?? 0;
        this.quantity.string = Utilities.convertBigNumberToStr(quantity.toString());
        this.buttonChooseFood.node.off(Button.EventType.CLICK, () => this.catchPet(food, animalController, onThrowFood), this);
        this.buttonChooseFood.node.on(Button.EventType.CLICK, () => this.catchPet(food, animalController, onThrowFood), this);
    }

    updateQuantityFood(id: string, quantity: number) {        
        if (!this.foodDTO || this.foodDTO.id != id) return;
        this.quantity.string = Utilities.convertBigNumberToStr(quantity.toString());
    }

    catchPet(food: Food, animalController: AnimalController, onThrowFood: (foodType: FoodType) => void) {
        if (this.isCooldown) return;
        this.isCooldown = true;
        setTimeout(() => {
            this.isCooldown = false;
        }, 500);
        (async () => {
            if (!this.canCacthPet(animalController)) return;
            if (animalController.animalType == AnimalType.Caught) {             
                UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã bị bắt. Chúc bạn may mắn lần sau`);
                return;
            }
            if (animalController.animalType == AnimalType.Disappeared) {
                this.showUiPetDisappeared();
                return;
            }
            const foodThrow = UserMeManager.GetFoods?.find(inv => inv.food.id === food.id);
            if (foodThrow.quantity <= 0) {
                PopupManager.getInstance().openAnimPopup('PopupChooseFoodPet', PopupChooseFoodPet, { message: "No food" });
                return;
            }
            if (onThrowFood) {
                const foodThrow = UserMeManager.GetFoods?.find(inv => inv.food.id === food.id);
                if (foodThrow && foodThrow.quantity > 0) {
                    foodThrow.quantity -= 1;
                    console.log('Emit:', foodThrow.id, foodThrow.quantity);
                    director.emit(EVENT_NAME.ON_UPDATE_FOOD_PET, foodThrow.id, foodThrow.quantity);
                    await onThrowFood(food.type);
                    let data = {
                        player: UserMeManager.Get.user,
                        petId: animalController.Pet.id,
                        foodId: food.id,
                    }
                    ServerManager.instance.sendCatchPet(data);
                }

            }
        })();
    }

    showUiPetDisappeared() {
        UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã đi rồi. Lần sau nhanh tay lên nhé`);
    }

    canCacthPet(target: AnimalController): boolean {
        const playePos = UserManager.instance?.GetMyClientPlayer?.node.getWorldPosition();
        if (!playePos || !target) return;
        if (target.animalType == AnimalType.Disappeared) {
            UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã đi rồi. Lần sau nhanh tay lên nhé`);
            return false;
        }
        const targetPos = target.node?.getWorldPosition();
        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, playePos);
        let distance = direction.length();
        if (distance < this.stopDistance) {
            return true;
        }
        UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng xa quá rồi dí theo nào`);
        return false;
    }
    protected onDestroy(): void {

    }
}


