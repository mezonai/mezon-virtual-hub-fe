import { _decorator, CCFloat, Component, director, Label, Node, Tween, tween, Vec3 } from 'cc';
import { UserManager } from '../../core/UserManager';
import { PlayerController } from '../player/PlayerController';
import { UserMeManager } from '../../core/UserMeManager';
import { AnimalController, AnimalType } from '../../animal/AnimalController';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupChooseFoodPet } from '../../PopUp/PopupChooseFoodPet';
import { FoodType } from '../../Model/Item';
import { ServerManager } from '../../core/ServerManager';
import { ItemChooseFood } from '../../animal/ItemChooseFood';
import { UIManager } from '../../core/UIManager';
import { ResourceManager } from '../../core/ResourceManager';
import { EVENT_NAME } from '../../network/APIConstant';
const { ccclass, property } = _decorator;

@ccclass('AnimalInteractManager')
export class AnimalInteractManager extends Component {
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: AnimalController }) animalController: AnimalController = null;
    @property({ type: ItemChooseFood }) normalFood: ItemChooseFood = null;
    @property({ type: ItemChooseFood }) superFood: ItemChooseFood = null;
    @property({ type: ItemChooseFood }) rareFood: ItemChooseFood = null;
    @property({ type: CCFloat }) interactDistance: number = 60;
    @property({ type: Node }) actionButtonParent: Node = null;
    private lastActionTime: number = 0;
    private interactDelay: number = 1000;

    protected start(): void {
        if (this.animalController.animalType === AnimalType.RandomMove || this.animalController.animalType === AnimalType.RandomMoveOnServer) {
            director.on(EVENT_NAME.ON_TOUCH_PET, this.updateCloseToggleUI, this);
        }

    }

    protected get InteractTarget(): PlayerController {
        if (UserManager.instance?.GetMyClientPlayer != null) {
            return UserManager.instance.GetMyClientPlayer;
        }

        return null;
    }

    protected onEnable(): void {
        this.init();
    }

    private get CanShowUI(): boolean {
        if (this.InteractTarget != null) {
            return Math.abs(Vec3.distance(this.InteractTarget.node.worldPosition, this.node.worldPosition)) <= this.interactDistance;
        }

        return false;
    }

    public init() {
        if (this.targetClicker == null) {
            this.targetClicker = this.node.parent;
        }
        this.targetClicker.on(Node.EventType.TOUCH_START, this.onTouchStart, this);

        this.toggleShowUI(false);
    }

    protected onDisable() {
        if (this.targetClicker) {
            this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    updateCloseToggleUI(petId: string) {
        if (!this.animalController?.Pet) return;
        if (this.animalController.Pet.id !== petId && this.actionButtonParent.active) {
            this.toggleShowUI(false);
        }
    }

    onTouchStart(event) {
        if (this.animalController.animalType === AnimalType.RandomMove || this.animalController.animalType === AnimalType.RandomMoveOnServer) {
            director.emit(EVENT_NAME.ON_TOUCH_PET, this.animalController.Pet.id);
        }

        if (this.CanShowUI) {
            if (this.animalController?.Pet.is_caught) {
                if (!this.animalController.canShowBubbleChat()) return;
                this.touchPetAlreadyOwner();
                return;
            }
            if (Date.now() - this.lastActionTime > this.interactDelay) {
                this.lastActionTime = Date.now()
                this.toggleShowUI(!this.actionButtonParent.active);
                this.setDataFood();
            }
        }
        else {
            if (this.animalController.animalType === AnimalType.RandomMove || this.animalController.animalType === AnimalType.RandomMoveOnServer
                || this.animalController.animalType === AnimalType.FollowTarget) {
                let content = "Lại gần hơn để tương tác với nó!";
                this.InteractTarget.zoomBubbleChat(content);
            }

        }
    }

    public toggleShowUI(show: boolean) {
        if (this.animalController == null || this.animalController?.Pet == null || this.animalController?.Pet.is_caught) return;
        this.lastActionTime = Date.now()
        this.actionButtonParent.active = show;
        if (show) {
            this.actionButtonParent.scale = Vec3.ZERO;
            tween(this.actionButtonParent)
                .to(0.2, { scale: Vec3.ONE })
                .start();
        }
    }

    protected update(dt: number): void {
        if (this.actionButtonParent.active) {
            if (!this.CanShowUI) {
                this.toggleShowUI(false);
            }
        }
    }

    touchPetAlreadyOwner() {
        const player = this.animalController?.animalPlayer;
        const data = {
            touchPlayerId: player?.myID ?? 0,// ID của người đang chạm vào pet
            targetPetId: this.animalController.Pet.id,// ID của pet bị chạm
            lengthCompliment: this.animalController.petCompliments.length,
            lengthProvokeLine: this.animalController.provokeLines.length,
        };
        ServerManager.instance.sendTouchPet(data);
    }

    setDataFood() {
        const foodDataList = ResourceManager.instance.FoodData.data;
        const foodTargets = [this.normalFood, this.superFood, this.rareFood]; // Đổi rardFood -> rareFood nếu là typo

        for (let i = 0; i < foodDataList.length; i++) {
            if (i >= foodTargets.length) continue;
            const food = foodDataList[i];
            const target = foodTargets[i];
            if (!food || !target) continue;
            const foodDTO = UserMeManager.GetFoods?.find(inv => inv.food?.id === food.id);
            target.setDataItem(
                food,
                foodDTO,
                this.animalController,
                () => this.toggleShowUI(false),
                async (foodType: FoodType) => {
                    return await this.InteractTarget.petCatching.throwFoodToPet(
                        this.animalController.node,
                        foodType
                    );
                },
            );
        }
    }

    public showUITutorial(show: boolean) {
        const foodDataList = ResourceManager.instance.FoodData.data;
        const foodTargets = [this.normalFood, this.superFood, this.rareFood]; // Đổi rardFood -> rareFood nếu là typo
        for (let i = 0; i < foodDataList.length; i++) {
            if (i >= foodTargets.length) continue;
            const food = foodDataList[i];
            const target = foodTargets[i];
            if (!food || !target) continue;
            target.setDataItemTutorial(food);
        }
        this.actionButtonParent.active = show;
        if (show) {
            this.actionButtonParent.scale = Vec3.ZERO;
            tween(this.actionButtonParent)
                .to(0.2, { scale: Vec3.ONE })
                .start();
        }
    }

}


