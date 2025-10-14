import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Constants } from '../utilities/Constants';
import { Toggle } from 'cc';
import { UserClan } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberManager')
export class ItemMemberManager extends Component {
    @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameMemberLabel: Label = null!;
    @property(Label) scoreWeeklyLabel: Label = null!;
    @property(Label) totalScoreLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Sprite) avatarSprite: Sprite = null!;
    @property(Toggle) toggleSelect: Toggle = null!;
    
    private memberData: UserClan = null!;
    private _onSelectCallback: (id: string, selected: boolean) => void = null!;

    setData(data: UserClan, onSelectCallback: (id: string, selected: boolean) => void) {
        this.memberData = data;
        this.toggleSelect.isChecked = false;
        this._onSelectCallback = onSelectCallback;
        this.toggleSelect.node.on('toggle', (toggle: Toggle) => {
            this._onSelectCallback(this.memberData.id, toggle.isChecked);
        });
        Constants.loadAvatar(this.avatarSprite, data.avatar_url);
        // this.roleLabel.string = OfficeRoleText[data.role];
        this.nameMemberLabel.string = data.display_name;
        // this.totalScoreLabel.string = data.score === 0 ? '--' : data.totalScore.toString();
        // this.scoreWeeklyLabel.string = data.totalScore === 0 ? '--' : data.totalScore.toString();
        //this.setRankIcon(data);
    }

    //setRankIcon(data: UserClan) {
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

    getMemberId(): string {
        return this.memberData.id;
    }
}


