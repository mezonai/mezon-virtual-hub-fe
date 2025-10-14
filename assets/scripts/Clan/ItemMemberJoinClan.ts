import { _decorator, Component, Node, Sprite, Button, SpriteFrame, RichText, Label } from 'cc';
import { Toggle } from 'cc';
import { MemberAction, MemberClanRequestDTO } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
import Utilities from '../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('ItemMemberJoinClan')
export class ItemMemberJoinClan extends Component {
    @property(Label) nameMemberLabel: Label = null!;
    @property(Label) dateApply: Label = null!;
    @property(Sprite) avatarSprite: Sprite = null!;
    @property(Button) acceptBtn: Button = null!;
    @property(Button) rejectBtn: Button = null!;
    private memberData: MemberClanRequestDTO = null!;
    private _onSelectCallback: (id: string, selected: boolean) => void = null!;

    setData(data: MemberClanRequestDTO, callback: (id: string, action: MemberAction) => void) {
        this.memberData = data;
        Constants.loadAvatar(this.avatarSprite, data.user.avatar_url);
        this.nameMemberLabel.string = data.user.display_name;
        this.dateApply.string = Utilities.formatDateVN(data.created_at);
        this.acceptBtn.addAsyncListener(async () => callback(data.id, MemberAction.ACCEPT));
        this.rejectBtn.addAsyncListener(async () => callback(data.id, MemberAction.REJECT));
    }

    getMemberId(): string {
        return this.memberData.id;
    }
}


