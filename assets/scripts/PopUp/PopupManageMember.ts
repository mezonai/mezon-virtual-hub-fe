import { _decorator, Component, Node, Button, Prefab,ScrollView,instantiate } from 'cc';
import { PopupManager } from './PopupManager';
import { ItemMemberManager } from '../Clan/ItemMemberManager';
import { Label } from 'cc';
import { PopupClanMemberManager } from './PopupClanMemberManager';
import { ClansData } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('PopupManageMember')
export class PopupManageMember extends Component {
    @property(Button) closeButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svOfficeList: ScrollView = null!;

    // private listMember: OfficeMemberDTO[] = [];
    // private _listMember: ItemMemberManager[] = []; 
    private clansData: ClansData;
    // private memberSelectedIds: Set<string> = new Set();
    @property(Button) promoteBtn: Button = null!;
    @property(Button) demoteBtn: Button = null!;
    @property(Button) removeMemberBtn: Button = null!;
    @property(Label) selectedCountLabel: Label = null!;
    private popupClanMemberManager: PopupClanMemberManager;

    public init(clansData: ClansData, popupClanMemberManager: PopupClanMemberManager): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.clansData = clansData;
        this.popupClanMemberManager = popupClanMemberManager;
        this.promoteBtn.addAsyncListener(async () => {
            this.promoteBtn.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.promoteBtn.interactable = true;
        });
        this.demoteBtn.addAsyncListener(async () => {
            this.demoteBtn.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.demoteBtn.interactable = true;
        });
        this.removeMemberBtn.addAsyncListener(async () => {
            this.removeMemberBtn.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.removeMemberBtn.interactable = true;
        });
        this.initList();
    }

    async initList() {
        //this.listMember = await WebRequestManager.instance.getListMemberOfficeAsync(this.myOffice.id);
        // this.svOfficeList.content.removeAllChildren();
        // this._listMember = [];
        // if(!this.listMember?.result || this.listMember.result.length === 0)
        //     this.popupClanMemberManager.ShowNoItem();
        // for (const itemOffice of this.listMember) {
        //     const itemJoinGuild = instantiate(this.itemPrefab);
        //     itemJoinGuild.setParent(this.svOfficeList.content);
            
        //     const itemComp = itemJoinGuild.getComponent(ItemMemberManager)!;
        //     itemComp.setData(itemOffice, (id: string, selected: boolean) => {
        //     this.onSelectMember(id, selected);
        // });
        //     this._listMember.push(itemComp);
        // }
    }

    private onSelectMember(id: string, selected: boolean) {
        // const count = this.memberSelectedIds.size;
        // this.selectedCountLabel.string = `Đã chọn: ${count} thành viên`;
        // console.log("Thành viên", id, selected ? "được chọn ✅" : "bỏ chọn ❌");

        // if (selected) {
        //     this.memberSelectedIds.add(id);
        // } else {
        //     this.memberSelectedIds.delete(id);
        // }
    }

    private async ondemoteMembers() {

    }

    private async onPromoteMembers() {

    }

    private async onRemoveMembers() {

    }
}