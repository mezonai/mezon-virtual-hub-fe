import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Constants } from '../utilities/Constants';
import { UserClan } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberMain')
export class ItemMemberMain extends Component {
    @property([SpriteFrame]) rankIcons: SpriteFrame[] = []; //0 = rank 1, 1 = rank 2, 2 = rank 3
    @property(Label) nameMemberLabel: Label = null!;
    @property(Label) roleLabel: Label = null!;
    @property(Label) scoreWeeklyLabel: Label = null!;
    @property(Label) totalScoreLabel: Label = null!;
    @property(Label) rankLabel: Label = null!;
    @property(Sprite) rankIcon: Sprite = null!;
    @property(Label) rankIconLabel: Label = null!;
    @property(Sprite) avatarSprite: Sprite = null!;
    
    private memberData: UserClan = null!;

    setData(data: UserClan) {
        this.memberData = data;
        Constants.loadAvatar(this.avatarSprite, data.avatar_url);
        this.nameMemberLabel.string = data.display_name;
        // this.roleLabel.string = OfficeRoleText[data.role];
        // this.totalScoreLabel.string = data.score === 0 ? '--' : data.totalScore.toString();
        // this.scoreWeeklyLabel.string = data.totalScore === 0 ? '--' : data.totalScore.toString();
        //this.setRankIcon(data);
    }

    // setRankIcon(data: OfficeMemberDTO) {
    //     if (data.rank >= 1 && data.rank <= 3) {
    //         this.rankIcon.node.active = true;
    //         this.rankIcon.spriteFrame = this.rankIcons[data.rank - 1];
    //         this.rankIconLabel.string = data.rank.toString();
    //         this.rankLabel.node.active = false;
    //     } else {
    //         this.rankIcon.node.active = false;
    //         this.rankLabel.node.active = true;
    //         this.rankIconLabel.string = data.rank.toString();
    //         this.rankLabel.string = data.rank === 0 ? '--' : data.rank.toString();
    //     }
    // }
}


