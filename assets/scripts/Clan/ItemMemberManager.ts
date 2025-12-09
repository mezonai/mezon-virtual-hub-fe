import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Constants } from '../utilities/Constants';
import { Toggle } from 'cc';
import { ClanRole, UserClan } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;
Node
@ccclass('ItemMemberManager')
export class ItemMemberManager extends Component {
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
    @property(Toggle) toggleSelect: Toggle = null!;
    
    private memberData: UserClan = null!;
    private _onSelectCallback: (memberData: UserClan, selected: boolean) => void = null!;

    setData(data: UserClan, onSelectCallback: (memberData: UserClan, selected: boolean) => void) {
        this.memberData = data;
        this.toggleSelect.isChecked = false;
        this._onSelectCallback = onSelectCallback;
        this.toggleSelect.node.on('toggle', (toggle: Toggle) => {
            this._onSelectCallback(this.memberData, toggle.isChecked);
        });
        Constants.loadAvatar(this.avatarSprite, data.avatar_url);
        this.nameMemberLabel.string = data.display_name;
        this.setRole(data.clan_role);
        this.totalScoreLabel.string = 'Tổng: ' + (data.total_score === 0 ? '--' : data.total_score.toString());
        this.scoreWeeklyLabel.string = 'Tuần: ' + (data.weekly_score === 0 ? '--' : data.weekly_score.toString());
        this.setRankIcon(data);
    }

    setRole(clan_role: string ){
        const role = clan_role;
        const roleText = Constants.roleMap[role] ?? "";
        this.roleNode.active = role !== ClanRole.MEMBER;
        this.roleLabel.string = roleText;
    }

    setRankIcon(data: UserClan) {
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

    getMemberId(): string {
        return this.memberData.id;
    }
}


