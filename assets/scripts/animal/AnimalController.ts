import { _decorator, Component, Label, Node, tween, Tween, Vec2, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { PetDTO } from '../Model/PetDTO';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { FollowTargetUser } from './FollowTargetUser';
const { ccclass, property } = _decorator;
export enum AnimalMoveType {
    RandomMove = 1,
    FollowTarget = 2,
    NoMove = 3,
}
@ccclass('AnimalController')
export class AnimalController extends Component {
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    @property(Node) spriteNode: Node = null!;
    @property({ type: RandomlyMover }) randomlyMover: RandomlyMover = null;
    @property(FollowTargetUser) followTargetUser: FollowTargetUser = null!;
    private animalMoveType = AnimalMoveType.NoMove;
    private animalPlayer: PlayerController = null;
    private pet: PetDTO;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    setDataPet(pet: PetDTO, moveType: AnimalMoveType, owner: PlayerController = null, newArea: Vec2 = new Vec2(0, 0)) {//Dùng cho Pet di chuyển

        
        this.pet = pet;
        if (moveType == AnimalMoveType.NoMove) {
            this. setDataSlot();
            return;
        }
        if (moveType == AnimalMoveType.RandomMove) {
            this.setRandomMove(newArea);
            return;
        }
        this.setFollowTarget(owner);
    }

    setRandomMove(newArea: Vec2) {
        this.animalMoveType = AnimalMoveType.RandomMove;
        this.randomlyMover.areaSize = newArea;
        this.randomlyMover.move();
    }

    setFollowTarget(owner: PlayerController) {
        this.animalPlayer = owner;
        this.animalMoveType = AnimalMoveType.FollowTarget;
        this.followTargetUser.playFollowTarget(owner.node, this.spriteNode);
    }

    setDataSlot() {
        this.animalMoveType = AnimalMoveType.NoMove;
        this.randomlyMover.stopMove();
        this.spriteNode.setScale(new Vec3(1, 1, 1));

    }

    catchFail(content: string) {
        this.showBubbleChat(content);
        setTimeout(() => {
            this.randomlyMover.move();
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



