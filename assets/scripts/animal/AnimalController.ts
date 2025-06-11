import { _decorator, Collider2D, Color, Component, director, Label, Node, RichText, tween, Tween, Vec2, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { PetDTO } from '../Model/PetDTO';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { FollowTargetUser } from './FollowTargetUser';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { PetColysesusObjectData } from '../Model/Player';
import { EVENT_NAME } from '../network/APIConstant';
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
    animalPlayer: PlayerController = null;
    private pet: PetDTO | null = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;
    petCompliments: string[] = [
        "Em chỉ cần [username] thôi!",
        "Được ở bên [username] là nhất!",
        "Không ai bằng [username] cả!",
        "Em yêu [username] nhiều lắm!",
        "Chủ ơi, cưng em nữa nha!",
        "Không có [username], em buồn lắm!",
        "[username] là cả thế giới của em.",
        "Em thích được vuốt ve bởi [username].",
        "Em sinh ra để theo [username].",
        "[username] là số 1 trong tim em!",
        "Một ngày không thấy [username] là nhớ lắm!",
        "Em mê [username] hơn đồ ăn luôn!",
        "Chủ mà cười, em cũng vui theo.",
        "[username] là ánh sáng của đời em.",
        "Trái tim em thuộc về [username].",
        "Em sẽ không rời xa [username].",
        "Chủ ơi, nay đẹp ghê á!",
        "Em quấn [username] suốt ngày luôn!",
        "Em tự hào khi có [username].",
        "Không ai thương em bằng [username].",
        "Em trung thành với [username] mãi!",
        "Em nhớ [username] quá trời!",
        "Bên [username] là hạnh phúc nhất!",
        "Em yêu [username] vô điều kiện.",
        "Chỉ cần [username] là đủ rồi.",
        "[username] làm em thấy ấm lòng.",
        "Em sống vì [username] đó!",
        "Em muốn ôm chân [username] hoài!",
        "Chủ là ngôi sao của em!",
        "[username] là lý do em tỉnh dậy.",
        "Thưởng em đi, em ngoan nè!",
        "Dù bị mắng, em vẫn yêu chủ!",
        "Cả vũ trụ này, em chỉ cần [username].",
        "Thế giới quay cuồng, em vẫn bên [username].",
        "Em là fan cứng của [username] luôn!",
        "Yêu [username] còn hơn oxi á!",
        "Em sống là vì [username] đó nha!",
        "[username] là lý do em tồn tại.",
        "Em chỉ yêu mỗi [username] thôi!",
        "Không ai thay thế được [username].",
        "[username] là tất cả với em.",
        "Em chỉ cần được cưng bởi [username].",
        "Dù ai nói gì, em vẫn chọn [username].",
        "Chủ là người tuyệt vời nhất.",
        "[username] ơi, cưng em đi!",
        "Chủ vui là em vui theo liền!",
        "Không ai làm em thấy an toàn như [username].",
        "Em yêu chủ nhiều lắm luôn á!",
        "Chủ là nguồn sống của em.",
        "Em luôn bên cạnh [username]."
    ];
    provokeLines: string[] = [
        "Tay gì kỳ vậy? Tránh ra!",
        "Ai cho sờ vô lông quý vậy?",
        "Bẩn lắm, né ra coi!",
        "Nghèo mà cũng ham!",
        "Chủ sờ thì thơm, bạn sờ thì thúi!",
        "Pet tui, không phải của bạn!",
        "Vui thôi, đừng chạm nha!",
        "Tui có chủ rồi, bye bạn!",
        "Nhìn mặt bạn là muốn cào!",
        "Tay kia rửa chưa đó?",
        "Bạn là ai mà dám sờ tui?",
        "Chủ VIP, bạn thì không!",
        "Không chơi với tầng lớp này!",
        "Cào rách lông đền nổi không?",
        "Lần cuối: ĐỪNG ĐỤNG!",
        "Pet tui không cho sờ đại!",
        "Làm thân chi? Không thân đâu!",
        "Mùi bạn… mất hứng ăn luôn!",
        "Gạ pet người ta hoài!",
        "Mặt đó không có phúc sờ!",
        "Chạm nữa là tui phun lửa!",
        "Thêm phát nữa là mất tay!",
        "Pet [username] không tiếp khách!",
        "Lông tui không dành cho bạn!",
        "Lại gặp người mơ mộng nữa…",
        "Vuốt mà không xin phép à?",
        "Không cần lịch sự với người lạ!",
        "Đi chỗ khác chơi giùm!",
        "Tui đẹp nên bạn mới ham!",
        "Tay đó móc mũi hồi nãy hả?",
        "Chạm nữa là tui chửi à!",
        "Không cho phép mà dám sờ?",
        "Muốn gì? Làm chủ tui à?",
        "Không thân mà sáp vô hoài!",
        "Gan lắm ha, dám đụng!",
        "Tui nhìn hiền thôi, không hiền đâu!",
        "Ai cho sờ pet nhà [username]?",
        "Bạn nghèo quá, tui biết luôn!",
        "Dân thường, lùi ra!",
        "Tui ré lên giờ á!",
        "Đừng dụ bằng mắt mơ màng đó!",
        "Cắn thiệt chứ không đùa đâu!",
        "Tui xịn, không ai cũng sờ được!",
        "Người lạ, tránh xa ra!",
        "Muốn sờ? Đầu thai làm [username] đi!",
        "Số tui khổ, ai cũng đụng!",
        "Nhìn bạn là muốn đi spa gấp!",
        "Dám sờ nhưng không được sờ!",
        "Đồ phèn cũng ham pet xịn!",
        "Nói thiệt: chạm nữa ăn đấm!"
    ];
    setDataPet(pet: PetDTO, moveType: AnimalType, owner: PlayerController = null, newArea: Vec2 = new Vec2(0, 0), parentPetFollowUser: Node = null) {//Dùng cho Pet di chuyển
        this.pet = pet;
        this.nameAnimal.node.active = moveType == AnimalType.FollowTarget;
        this.animalPlayer = owner;
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
        if (owner.isMyClient) {
            director.off(EVENT_NAME.UPDATE_INFO_PROFILE, this.updateNameOwnedUser, this);
            director.on(EVENT_NAME.UPDATE_INFO_PROFILE, this.updateNameOwnedUser, this);
        }
        this.collider.enabled = false;
        this.nameAnimal.fontColor = owner.isMyClient ? this.nameColor[0] : this.nameColor[1];
        this.nameAnimal.string = `<outline color=#000000 width=1> ${this.pet.name} (${this.capitalizeFirstLetter(this.pet.rarity)}) [${owner.userName}]</outline>`;
        this.animalPlayer = owner;
        this.animalType = AnimalType.FollowTarget;
        this.followTargetUser.playFollowTarget(owner.node, this.spriteNode, parentPetFollowUser);
    }

    updateNameOwnedUser(data: any) {
        if (!data || !data.fullname) return;
        this.nameAnimal.string = `<outline color=#000000 width=1> ${this.pet.name} (${this.capitalizeFirstLetter(this.pet.rarity)}) [${data.fullname}]</outline>`;
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
    }


    public get Pet(): PetDTO | null {
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

    syncPositionServer(petData: PetColysesusObjectData) {
        this.node.setPosition(new Vec3(petData.x, petData.y, 0));
        this.spriteNode.scale = new Vec3(petData.angle.x > 0 ? 1 : -1, 1);
    }

    getRandomCompliment(username: string, randomIndex: number) {
        let compliment = this.petCompliments[randomIndex];
        if (compliment.includes("[username]")) {
            compliment = compliment.replace("[username]", username);
        }
        this.showBubbleChat?.(compliment, 2000)
    }

    getRandomProvokeLine(username: string, randomIndex: number) {
        let provokeLine = this.provokeLines[randomIndex];
        if (provokeLine.includes("[username]")) {
            provokeLine = provokeLine.replace("[username]", username);
        }
        this.showBubbleChat?.(provokeLine, 2000)
    }

    capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}



