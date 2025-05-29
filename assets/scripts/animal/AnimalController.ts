import { _decorator, Collider2D, Color, Component, Label, Node, RichText, tween, Tween, Vec2, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { PetDTO } from '../Model/PetDTO';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { FollowTargetUser } from './FollowTargetUser';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { PetColysesusObjectData } from '../Model/Player';
const { ccclass, property } = _decorator;
export enum AnimalType {
    RandomMove = 1,
    FollowTarget = 2,
    NoMove = 3,
    Caught = 4,
    RandomMoveOnServer = 5,
    Disappeared = 6,
}
@ccclass('AnimalController')
export class AnimalController extends Component {
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    @property(RichText) nameAnimal: RichText = null;
    @property(Node) spriteNode: Node = null!;
    @property(Collider2D) collider: Collider2D = null;
    @property({ type: RandomlyMover }) randomlyMover: RandomlyMover = null;
    @property(FollowTargetUser) followTargetUser: FollowTargetUser = null!;
    @property({ type: [Color] }) nameColor: Color[] = [];
    animalType = AnimalType.NoMove;
    private animalPlayer: PlayerController = null;
    private pet: PetDTO;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    setDataPet(pet: PetDTO, moveType: AnimalType, owner: PlayerController = null, newArea: Vec2 = new Vec2(0, 0), parentPetFollowUser: Node = null) {//Dùng cho Pet di chuyển
        this.pet = pet;
        this.nameAnimal.node.active = moveType == AnimalType.FollowTarget;
        this.collider.enabled = true;
        if (moveType == AnimalType.RandomMoveOnServer) {
            this.animalType = AnimalType.RandomMoveOnServer;
            return;
        }
        if (moveType == AnimalType.NoMove) {
            this.setDataSlot();
            return;
        }
        if (moveType == AnimalType.RandomMove) {
            this.setRandomMove(newArea);
            return;
        }
        this.setFollowTarget(owner, parentPetFollowUser);
    }

    setRandomMove(newArea: Vec2) {
        this.animalType = AnimalType.RandomMove;
        this.randomlyMover.areaSize = newArea;
        this.randomlyMover.move();
    }

    setFollowTarget(owner: PlayerController, parentPetFollowUser: Node) {
        this.collider.enabled = false;
        this.nameAnimal.fontColor = owner.isMyClient ? this.nameColor[0] : this.nameColor[1];
        this.nameAnimal.string = `<outline color=#000000 width=1>${this.pet.name} [${owner.userName}]</outline>`;
        this.animalPlayer = owner;
        this.animalType = AnimalType.FollowTarget;
        this.followTargetUser.playFollowTarget(owner.node, this.spriteNode, parentPetFollowUser);
    }

    setDataSlot() {
        this.animalType = AnimalType.NoMove;
        this.collider.enabled = false;
        this.randomlyMover.stopMove();
        this.spriteNode.setScale(new Vec3(1, 1, 1));

    }

    public closeAnimal(moveType: AnimalType = AnimalType.NoMove) {
        this.animalType = moveType;
        if (this.followTargetUser) {
            this.followTargetUser.stopMove();
        }

        if (this.randomlyMover) {
            this.randomlyMover.stopMove();
        }


        if (this.node) {
            Tween.stopAllByTarget(this.node);
            this.node.setPosition(Vec3.ZERO);
            ObjectPoolManager.instance.returnToPool(this.node);
        }
    }

    catchFail(content: string) {
        this.showBubbleChat(content, 1000);
        if (this.animalType == AnimalType.RandomMoveOnServer) return;
        setTimeout(() => {
            this.randomlyMover.move();
        }, 500);
    }

    showBubbleChat(content: string, duration: number) {
        this.zoomBubbleChat(content, duration);
    }

    public get Pet(): PetDTO | null {
        return this.pet;
    }

    public zoomBubbleChat(contentChat: string, duration: number) {
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
        }, duration);
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

    syncPositionServer(petData: PetColysesusObjectData) {
        this.node.setPosition(new Vec3(petData.x, petData.y, 0));
        this.spriteNode.scale = new Vec3(petData.angle.x > 0 ? 1 : -1, 1);
    }
}



