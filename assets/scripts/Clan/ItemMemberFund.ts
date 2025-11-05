import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { ClanContributorDTO, ClanRole } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberFund')
export class ItemMemberFund extends Component {
    @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameMemberLabel: Label = null!;
    @property(Label) total_Fund: Label = null!;
    @property(Node) roleNode: Node = null!;
    @property(Label) roleLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Sprite) avatarSprite: Sprite = null!;

    private ClanContributor: ClanContributorDTO = null!;

    setData(data: ClanContributorDTO) {
        this.ClanContributor = data;
        this.nameMemberLabel.string = data.username;
        this.total_Fund.string = data.total_amount;
        this.setRankIcon(data);
        this.setRole(data.clan_role);
        Constants.loadAvatar(this.avatarSprite, data.avatar_url);
    }

    setRole(clan_role: string) {
        const role = clan_role;
        this.roleNode.active = role !== ClanRole.MEMBER;
        const roleText = Constants.roleMap[role] ?? "";
        this.roleLabel.string = roleText;
    }

    setRankIcon(data: ClanContributorDTO) {
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
}


