import { _decorator, Collider2D, Color, Component, director, Label, Node, RichText, tween, Tween, Vec2, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { FollowTargetUser } from './FollowTargetUser';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { AnimalType } from './AnimalController';
import { ClanPetDTO } from '../Model/Item';
import { PetClanColysesusObjectData } from '../Model/Player';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;
@ccclass('AnimalClanController')
export class AnimalClanController extends Component {
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    @property(RichText) nameAnimal: RichText = null;
    @property(Node) spriteNode: Node = null!;
    @property(Collider2D) collider: Collider2D = null;
    @property({ type: RandomlyMover }) randomlyMover: RandomlyMover = null;
    @property maxSpeed: number = 100;
    @property minSpeed: number = 40;
    animalType = AnimalType.NoMove;
    animalPlayer: PlayerController = null;
    private pet: PetClanColysesusObjectData | null = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;
    private petTalkLines: Record<string, string[]> = {
        dog: [
            "Gâu gâu! Có trộm là biết liền",
            "Để em canh vườn cho",
            "Ai bén mảng là em sủa đó",
            "Vườn này có chó canh nha",
            "Ngủ ngon đi chủ, có em rồi",
        ],
        cat: [
            "Meo! hôm nay vàng nhiều lắm nè",
            "Em cảm nhận thấy tài lộc đó",
            "Cào nhẹ là có thêm vàng nha",
            "Vàng về vàng về",
            "Chủ ơi hôm nay hên lắm đó",
        ],
        bird: [
            "Chíp chíp! điểm sắp tăng rồi",
            "Em thấy điểm bay đầy trời nè",
            "Cố lên chủ ơi",
            "Chíp~ chơi nữa là lên điểm đó",
            "Điểm cao kìa, em thấy rồi",
        ],
    };

    setGuardFarm( pet: PetClanColysesusObjectData, areaRadius: number = 120
    ) {
        this.pet = pet;
        this.animalType = AnimalType.GuardFarm;
        this.collider.enabled = false;
        this.nameAnimal.node.active = true;
        this.nameAnimal.string =  `<outline color=#000 width=1>${pet.name}</outline>`;
        this.randomlyMover.setRandomMovePet(
            this.minSpeed,
            this.maxSpeed,
            new Vec2(areaRadius, areaRadius)
        );

        this.startGuardFarmBubble();
    }

    private getRandomPetLine(type: string): string {
        const key = type.trim().toLowerCase();
        const lines = this.petTalkLines[key];

        if (!lines || lines.length === 0) {
            return "Em đang ở đây trong nông trại nè!";
        }

        const index = Math.floor(Math.random() * lines.length);
        return lines[index];
    }

    private startGuardFarmBubble() {
        this.schedule(() => {
            if (this.animalType !== AnimalType.GuardFarm || !this.pet) return;

            const line = this.getRandomPetLine(this.pet.petCLanCode);
            this.showBubbleChat(line, 1500);

        }, 6 + Math.random() * 4);
    }

    setRandomMove(newArea: Vec2) {
        this.animalType = AnimalType.RandomMove;
        this.randomlyMover.setRandomMovePet(this.minSpeed, this.maxSpeed, newArea);
    }

    setDataSlot() {
        this.animalType = AnimalType.NoMove;
        this.collider.enabled = false;
        this.randomlyMover.stopMove();
        this.spriteNode.setScale(new Vec3(1, 1, 1));

    }

    public closeAnimal(moveType: AnimalType = AnimalType.NoMove) {
        this.unscheduleAllCallbacks();
        this.animalType = moveType;
        if (this.randomlyMover) {
            this.randomlyMover.stopMove();
        }


        if (this.node) {
            Tween.stopAllByTarget(this.node);
            this.pet = null;
            this.node.setPosition(Vec3.ZERO);
            ObjectPoolManager.instance.returnToPool(this.node);
        }
    }

    public get Pet(): PetClanColysesusObjectData | null {
        return this.pet;
    }

    canShowBubbleChat(): boolean {
        return this.bubbleChat.scale.x <= 0.95;
    }

    showBubbleChat(content: string, duration: number) {
        if (!this.canShowBubbleChat()) {
            return;
        }
        this.zoomBubbleChat(content, duration);
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
}



