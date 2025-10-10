import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberJoinClan')
export class ItemMemberJoinClan extends Component {
       @property(Label) nameMemberLabel: Label = null!;
       @property(Label) dateApply: Label = null!;
       @property(Sprite) avatarSprite: Sprite = null!;
       @property(Toggle) toggleSelect: Toggle = null!;
       
    //    private memberData: UserClan = null!;
    //    private _onSelectCallback: (id: string, selected: boolean) => void = null!;
   
    //    setData(data: OfficeMemberDTO, onSelectCallback: (id: string, selected: boolean) => void) {
    //        this.memberData = data;
    //        Constants.loadAvatar(this.avatarSprite, data.user.avatar_url);
    //        this.toggleSelect.isChecked = false;
    //        this._onSelectCallback = onSelectCallback;
    //        this.toggleSelect.node.on('toggle', (toggle: Toggle) => {
    //            this._onSelectCallback(this.memberData.id, toggle.isChecked);
    //        });
    //        this.nameMemberLabel.string = data.user.display_name;
    //        this.dateApply.string = Utilities.formatDateVN(data.requestedAt);
    //    }
   
    //    getMemberId(): string {
    //        return this.memberData.id;
    //    }
}


