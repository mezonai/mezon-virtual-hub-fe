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
        "Trên trời có hàng nghìn vì sao, nhưng trong mắt em chỉ có [username] là ngôi sao duy nhất.",
        "Nếu được chọn lại, em vẫn chọn làm pet của [username]!",
        "Mỗi ngày được ở bên [username] là một ngày hạnh phúc nhất đời em.",
        "[username] là ánh sáng dẫn lối cho đời pet nhỏ bé này.",
        "Dù thế giới có quay cuồng, lòng em vẫn hướng về [username].",
        "Người ta cần oxi để sống, em chỉ cần có [username].",
        "Trái tim nhỏ bé này chỉ đập vì [username].",
        "Trên đời này, điều tuyệt vời nhất là được làm pet của [username].",
        "Nếu có kiếp sau, em xin vẫn là pet của [username]!",
        "Chủ ơi, hôm nay [username] càng đẹp trai/xinh gái hơn hôm qua nữa!",
        "Dù trời mưa hay nắng, em vẫn yêu [username] vô điều kiện.",
        "[username] là chủ nhân số một trong tim em!",
        "Không cần bánh, không cần sữa… chỉ cần [username] cưng em thôi!",
        "Em không cần ai khác, chỉ cần [username] thôi là đủ rồi.",
        "Được nhìn thấy [username] mỗi ngày là món quà vô giá.",
        "[username] là mặt trời sưởi ấm trái tim em.",
        "Không có [username], cuộc sống của em như mất đi màu sắc.",
        "Em nguyện trung thành với [username] mãi mãi!",
        "Em chỉ muốn quấn quýt bên [username] mỗi phút giây.",
        "Bầu trời thì rộng, nhưng lòng em chỉ đủ chỗ cho [username].",
        "Chủ mà buồn, là lòng em như tan nát…",
        "Mỗi lần [username] cười là em hạnh phúc theo.",
        "Em đã là pet của [username] thì không ai thay thế được!",
        "Nếu yêu là tội lỗi, thì em đã phạm tội vì yêu [username] mất rồi.",
        "Em sinh ra là để đi theo [username].",
        "Một ngày không thấy [username] là em nhớ muốn xỉu luôn đó!",
        "Thế giới này rộng lớn, nhưng trái tim em chỉ hướng về [username].",
        "Em muốn được ôm chân [username] cả ngày luôn á!",
        "Chỉ cần được vuốt ve bởi [username], mọi mỏi mệt đều tan biến.",
        "Với em, [username] là tất cả.",
        "Không ai thương em bằng [username] đâu.",
        "Nếu có điều ước, em ước được ở bên [username] mãi mãi.",
        "Em chỉ cần chỗ nằm bên chân [username] là đủ ấm áp.",
        "[username] nói gì em cũng nghe, miễn là đừng rời xa em nhé!",
        "Em không biết nói gì ngoài… yêu [username] thật nhiều!",
        "Em tự hào vì được gọi [username] là chủ.",
        "[username] ơi, em ngoan thế này có được thưởng không?",
        "Dù có bị phạt, em vẫn yêu [username] hết lòng.",
        "Trái tim em nhỏ xíu, nhưng dành trọn cho [username].",
        "Ai cũng bảo em may mắn vì có [username] – em công nhận luôn!",
        "Em sẽ bảo vệ [username] đến hơi thở cuối cùng.",
        "Em là pet, nhưng cũng là fan cuồng của [username] đấy!",
        "Tình yêu em dành cho [username] to như vũ trụ luôn á.",
        "Chủ mà vui, là em nhảy cẫng lên theo luôn!",
        "Em không hoàn hảo, nhưng em thuộc về [username].",
        "Không ai khiến em thấy an toàn như [username].",
        "[username] là lý do em mở mắt mỗi sáng.",
        "Dù người khác có nói gì, em vẫn chọn [username].",
        "Em yêu [username] nhiều hơn đồ ăn ngon nữa!",
        "Cả thế giới có thể quay lưng, nhưng em thì luôn bên [username]."
    ];
    provokeLines: string[] = [
        "Bàn tay này mà cũng đòi vuốt tui?",
        "Ơ kìa, ai cho đụng vào bộ lông quý tộc này?",
        "Tránh xa ra, đừng để tui bị bẩn!",
        "Tránh ra đi, nghèo mà còn ham!",
        "[username] sờ thì thơm, bạn sờ thì... thúi.",
        "Gì đấy? Mắt lé à? Tưởng tui là pet bạn à?",
        "Vui thôi, đừng đụng chạm!",
        "Có chủ rồi, đi tìm pet khác mà sờ.",
        "Tui mới nhìn bạn đã thấy muốn cào rồi đó.",
        "Ơ cái tay kia… lau sạch chưa đấy?",
        "Bạn nghĩ bạn là ai mà dám sờ tui?",
        "Chủ tui là VIP, bạn là ai?",
        "Tui không giao lưu với tầng lớp bạn.",
        "Ê, móng tay kia… làm xước lông là đền đấy!",
        "Lần cuối nhắc: ĐỪNG. CÓ. ĐỤNG.",
        "Tui không phải pet công cộng đâu nha.",
        "Đừng làm thân, tui khinh.",
        "Mùi bạn làm tui mất cảm giác ăn luôn á.",
        "Nhìn là biết chuyên gạ gẫm pet nhà người ta.",
        "Cái mặt đó… không có phúc sờ được tui.",
        "Chạm thêm lần nữa là tui phun lửa đó!",
        "Sờ thêm phát nữa là mất tay đấy!",
        "Pet nhà [username] không tiếp khách lạ.",
        "Đi chỗ khác, lông tui không dành cho bạn!",
        "Trời đất… lại thêm một kẻ mơ mộng nữa.",
        "Vuốt mà không xin phép? Vô ý thức!",
        "Chủ tui không bắt tui lịch sự với người lạ.",
        "Chạm gì mà chạm, đi chơi cát đi!",
        "Nếu tui không đẹp, bạn đâu dám đụng vào.",
        "Cái tay đó vừa móc mũi đúng không?",
        "Đụng thêm phát nữa là tui chửi đó!",
        "Chủ tui chưa cho phép, bạn tự tiện à?",
        "Muốn gì? Làm bạn đời tui à?",
        "Tui không quen kiểu tay ngang như bạn.",
        "Gan thì gan, đừng có liều!",
        "Tui không thân thiện như cái mặt tui đâu.",
        "Ai cho sờ vào bảo bối nhà [username]?",
        "Từ bạn phát ra cảm giác nghèo dữ lắm!",
        "Cút đi, dân thường không được lại gần!",
        "Tránh ra, không tui ré lên bây giờ á!",
        "Đừng có dụ tui bằng ánh mắt đó!",
        "Còn sờ nữa là tui cắn thiệt đó nha!",
        "Tui là pet xịn, không dành cho ai cũng được sờ!",
        "Bạn không phải chủ, bạn là người lạ.",
        "Muốn sờ? Về đầu thai làm [username] đi!",
        "Số tui khổ ghê, gặp ai cũng đòi vuốt!",
        "Nhìn bạn là tui muốn đi spa gấp!",
        "Sờ tui? Bạn dám, nhưng tui không cho!",
        "Ơ kìa, đồ phèn cũng biết mê pet xịn à?",
        "Câu cuối: ĐỪNG chạm, kẻo ăn đấm!"
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
        this.nameAnimal.string = `<outline color=#000000 width=1>${this.pet.name} [${owner.userName}]</outline>`;
        this.animalPlayer = owner;
        this.animalType = AnimalType.FollowTarget;
        this.followTargetUser.playFollowTarget(owner.node, this.spriteNode, parentPetFollowUser);
    }

    updateNameOwnedUser(data: any) {
        if (!data || !data.fullname) return;
        this.nameAnimal.string = `<outline color=#000000 width=1>${this.pet.name} [${data.fullname}]</outline>`;
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
}



