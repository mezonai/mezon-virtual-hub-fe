import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { AvatarIconHelper } from './AvatarIconHelper';
import { ClansData, ClanStatus } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('ItemJoinClan')
export class ItemJoinClan extends Component {
    @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameOfficeLabel: Label = null!;
    @property(Label) memberLabel: Label = null!;
    @property(Label) totalScoreLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(AvatarIconHelper) avatarSprite: AvatarIconHelper = null!;
    @property(Button) joinButton: Button = null!
    @property(Button) cancelButton: Button = null!;
    @property(RichText) joinLabel: RichText = null!
    private clanDetail: ClansData = null!;
    private joinCallback: ((clan: ClansData) => void) | null = null;
    private cancelCallback: ((clan: ClansData) => void) | null = null;

    setData(data: ClansData, callback?: (clan: ClansData) => void, cancelCb?: (clan: ClansData) => void) {
        this.clanDetail = data;
        this.joinCallback = callback || null;
        this.cancelCallback = cancelCb || null;
        this.nameOfficeLabel.string = data.name;
        this.memberLabel.string = `${data.member_count === 0 ? '--' : data.member_count.toString()}`;
        this.totalScoreLabel.string = data.score === 0 ? '--' : data.score.toString();
        
        const status = data.join_status ?? ClanStatus.NONE;
        this.updateStatus(status);
        this.joinButton.addAsyncListener(async () => {
            this.joinButton.interactable = false;
            this.joinCallback?.(this.clanDetail);
            this.joinButton.interactable = true;
        });
        this.cancelButton.addAsyncListener(async () => {
            this.cancelButton.interactable = false;
            this.cancelCallback?.(this.clanDetail);
            this.cancelButton.interactable = true;
        });
        this.setRankIcon(data);
        const avatar = data.avatar_url?.trim() || "avatar_1";
        this.avatarSprite.setAvatar(avatar);
    }

    setRankIcon(data: ClansData) {
        const rank = data?.rank ?? 0;
        const isTop3 = rank >= 1 && rank <= 3;
        this.rankIcon.node.active = isTop3;
        this.rankLabel.node.active = !isTop3;
        if (isTop3) {
            this.rankIcon.spriteFrame = this.rankIcons[rank - 1];
            this.rankIconLabel.string = rank.toString();
        } else {
            const rankText = rank === 0 ? '--' : rank.toString();
            this.rankLabel.string = rankText;
        }
    }

    public updateStatus(status: ClanStatus) {
        this.clanDetail.join_status = status;
        this.joinLabel.string = (status === ClanStatus.PENDING)
            ? "<outline color=#222222 width=1> Chờ duyệt </outline>"
            : "<outline color=#222222 width=1> Gia Nhập </outline>";

        this.joinButton.interactable = (status !== ClanStatus.PENDING);
        this.cancelButton.node.active = (status === ClanStatus.PENDING);
    }

    public getOfficeId(): string {
        return this.clanDetail?.id || "";
    }
}
