import { _decorator, CCFloat, Component, Label, Node, Tween, tween, Vec3 } from 'cc';
import { UserManager } from '../../core/UserManager';
import { PlayerController } from '../player/PlayerController';
import { UserMeManager } from '../../core/UserMeManager';
import { ItemType } from '../../Model/Item';
import { UIManager } from '../../core/UIManager';
import { RandomlyMover } from '../../utilities/RandomlyMover';
import { ServerManager } from '../../core/ServerManager';
import { AnimalController } from '../../animal/AnimalController';
const { ccclass, property } = _decorator;

@ccclass('AnimalInteractManager')
export class AnimalInteractManager extends Component {
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: AnimalController }) animalController: AnimalController = null;
    @property({ type: Node }) tameButton: Node = null;
    @property({ type: CCFloat }) interactDistance: number = 60;
    @property({ type: Node }) actionButtonParent: Node = null;
    @property({ type: RandomlyMover }) randomlyMover: RandomlyMover = null;

    private lastActionTime: number = 0;
    private interactDelay: number = 1000;

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
        this.tameButton.on(Node.EventType.TOUCH_START, this.onBeingTamed, this);
    }

    protected async onBeingTamed() {
        this.toggleShowUI(false);
        let petFood = UserMeManager.Get.inventories.filter(x => x.item.type == ItemType.PET_FOOD);
        // if (petFood.length == 0) {
        //     this.animalController.zoomBubbleChat("Bạn Không có đủ thức ăn");
        // }
        // else {
        //     this.animalController.animalMover.randomlyMover.stopMove();
        //     let data = {
        //         player: UserMeManager.Get.user,
        //         petId: this.animalController.Pet.id
        //     }
        //     await this.InteractTarget.petCatching.throwFoodToPet(this.animalController.node);
        //     ServerManager.instance.sendCatchPet(data);
        // }
        this.animalController.animalMover.randomlyMover.stopMove();
            let data = {
                player: UserMeManager.Get.user,
                petId: this.animalController.Pet.id
            }
            await this.InteractTarget.petCatching.throwFoodToPet(this.animalController.node);
            ServerManager.instance.sendCatchPet(data);

    }

    protected onDisable() {
        if (this.targetClicker) {
            this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    onTouchStart(event) {
        if (this.CanShowUI) {
            if (Date.now() - this.lastActionTime > this.interactDelay) {
                this.lastActionTime = Date.now()
                this.toggleShowUI(!this.actionButtonParent.active);
            }
        }
        else {
            let content = "Lại gần hơn để tương tác với nó!";
            this.InteractTarget.zoomBubbleChat(content);
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

}


