import { _decorator, Component, Sprite, SpriteFrame, Label } from 'cc';
import { AvatarIconHelper } from './AvatarIconHelper';
import { ClansData } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('ItemLeaderboardClan')
export class ItemLeaderboardClan extends Component {
   @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameOfficeLabel: Label = null!;
    @property(Label) memberLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(Label) totalScoreLabel: Label = null!;
    @property(AvatarIconHelper) avatarSprite: AvatarIconHelper = null!;
    private officeData: ClansData = null!;

    setData(data: ClansData, isWeekly: boolean) {
        this.officeData = data;
        this.nameOfficeLabel.string = data.name;
        this.memberLabel.string = `${data.member_count === 0 ? '--' : data.member_count.toString()}`;
        const score = isWeekly ? data.weekly_score : data.score;
        this.totalScoreLabel.string = score > 0 ? score.toString() : '--';
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

    public getGuildId(): string {
        return this.officeData?.id || "";
    }
}


