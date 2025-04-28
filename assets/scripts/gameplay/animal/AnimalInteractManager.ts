import { _decorator, CCFloat, Component, Label, Node, Tween, tween, Vec3 } from 'cc';
import { UserManager } from '../../core/UserManager';
import { PlayerController } from '../player/PlayerController';
import { UserMeManager } from '../../core/UserMeManager';
import { ItemType } from '../../Model/Item';
import { UIManager } from '../../core/UIManager';
const { ccclass, property } = _decorator;

@ccclass('AnimalInteractManager')
export class AnimalInteractManager extends Component {
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: Node }) tameButton: Node = null;
    @property({ type: CCFloat }) interactDistance: number = 60;
    @property({ type: Node }) actionButtonParent: Node = null;
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;
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

    protected onBeingTamed() {
        this.toggleShowUI(false);
        let petFood = UserMeManager.Get.inventories.filter(x => x.item.type == ItemType.PET_FOOD);
        if (petFood.length == 0) {
            this.zoomBubbleChat("Vote cho game đi rồi cho bắt");
        }
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

    public shrinkBubbleChat(timeShrink: number) {
        if (this.tweenAction) {
            this.tweenAction.stop();
        }
    
        this.tweenAction = tween(this.bubbleChat)
            .to(timeShrink, { 
                scale: new Vec3(0, 1, 1),
            }, { easing: 'backIn' })
            .call(() => { 
                this.tweenAction = null; 
            })
            .start();
    }

    public zoomBubbleChat(contentChat: string) {
        if (this.tweenAction) {
            this.tweenAction.stop();
        }
    
        if (this.hideTimeout !== null) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    
        this.bubbleChat.setScale(0, 1, 1);
        this.contentBubbleChat.string = contentChat;
        this.tweenAction = tween(this.bubbleChat)
            .to(0.5, { 
                scale: new Vec3(1, 1, 1),
            }, { easing: 'backOut' })
            .start();
        this.hideTimeout = setTimeout(() => {
            this.shrinkBubbleChat(0.5);
        }, 4000);
    }
}


