import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Constants } from '../utilities/Constants';
import { ClanRole, UserClan } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberMain')
export class ItemMemberMain extends Component {
    @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameMemberLabel: Label = null!;
    @property(Label) scoreWeeklyLabel: Label = null!;
    @property(Label) totalScoreLabel: Label = null!;
    @property(Node) roleNode: Node = null!;
    @property(Label) roleLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Sprite) avatarSprite: Sprite = null!;
    
    private memberData: UserClan = null!;

    setData(data: UserClan) {
        this.memberData = data;
        Constants.loadAvatar(this.avatarSprite, data.avatar_url);
        this.nameMemberLabel.string = data.display_name;
        this.setRole(data.clan_role);
        // this.totalScoreLabel.string = data.score === 0 ? '--' : data.totalScore.toString();
        // this.scoreWeeklyLabel.string = data.totalScore === 0 ? '--' : data.totalScore.toString();
        //this.setRankIcon(data);
    }

    setRole(clan_role: string) {
        const role = clan_role;
        this.roleNode.active = role !== ClanRole.MEMBER;
        const roleText = Constants.roleMap[role] ?? "";
        this.roleLabel.string = roleText;
    }

    // setRankIcon(data: UserClan) {
    //        const rank = data?.rank ?? 0;
    //        const isTop3 = rank >= 1 && rank <= 3;
    //        this.rankIcon.node.active = isTop3;
    //        this.rankLabel.node.active = !isTop3;
    //        if (isTop3) {
    //            this.rankIcon.spriteFrame = this.rankIcons[rank - 1];
    //            this.rankIconLabel.string = rank.toString();
    //        } else {
    //            const rankText = rank === 0 ? '--' : rank.toString();
    //            this.rankLabel.string = rankText;
    //        }
    //    }
}


