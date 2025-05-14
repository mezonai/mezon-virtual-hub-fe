import { _decorator, Component, Label, Node, tween, Tween, Vec2, Vec3 } from 'cc';
import { AnimalMover, AnimalMoveType } from './AnimalMover';
import { PlayerController } from '../gameplay/player/PlayerController';
import { PetDTO } from '../Model/PetDTO';
import { AnimalInteractManager } from '../gameplay/animal/AnimalInteractManager';
const { ccclass, property } = _decorator;

@ccclass('AnimalController')
export class AnimalController extends Component {
    @property({ type: AnimalMover }) animalMover: AnimalMover | null = null;
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private animalPlayer: PlayerController = null;
    private pet: PetDTO;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    setDataPet(pet: PetDTO, owner: PlayerController = null, newArea: Vec2 = new Vec2(0, 0)) {
        this.animalPlayer = owner;
        this.pet = pet;
       
        if (owner == null) {
            this.animalMover.setRandomMove(newArea);
        }
        else {          
            this.animalMover.setFollowOwnedUser(owner.node);
        }
    }

    catchFail(content: string) {
        this.showBubbleChat(content);
       setTimeout(() => {
        this.animalMover.randomlyMover.move();
    }, 500);
    }

    showBubbleChat(content: string) {
        this.zoomBubbleChat(content);
    }

    public get Pet(): PetDTO | null {
        return this.pet;
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

}



