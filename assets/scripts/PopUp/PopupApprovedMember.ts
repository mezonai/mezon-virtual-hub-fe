import { _decorator, Component, Node, ScrollView, Prefab, Button, instantiate} from 'cc';
import { PopupClanMemberManager } from './PopupClanMemberManager';
import { ClansData } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('PopupApprovedMember')
export class PopupApprovedMember extends Component {
    @property(ScrollView) svListMembers: ScrollView = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(Button) acceptBtn: Button = null!;
    @property(Button) rejectBtn: Button = null!;

    private memberSelectedIds: Set<string> = new Set();
    private clansData: ClansData;
    private popupClanMemberManager: PopupClanMemberManager;

    public async init(clansData: ClansData, popupClanMemberManager: PopupClanMemberManager) {
        this.clansData = clansData;
        this.popupClanMemberManager = popupClanMemberManager;
        await this.loadMembers();
        this.acceptBtn.addAsyncListener(async () => {
            this.acceptBtn.interactable = false;
            this.onAcceptMembers();
            this.acceptBtn.interactable = true;
        });
         this.rejectBtn.addAsyncListener(async () => {
            this.rejectBtn.interactable = false;
            this.onRejectMembers();
            this.rejectBtn.interactable = true;
        });
    }

    async loadMembers() {
        // const list = await WebRequestManager.instance.getListMemberOfficePendingAsync();
        // this.svListMembers.content.removeAllChildren();
        //  if(!this.memberRequests?.result || this.memberRequests.result.length === 0)
        //     this.popupClanMemberManager.ShowNoItem();
        // for (const member of list.memberRequests) {
        //     const itemNode = instantiate(this.itemPrefab);
        //     itemNode.setParent(this.svListMembers.content);

        //     const itemComp = itemNode.getComponent(ItemMemberJoinClan)!;
        //     itemComp.setData(member, this.onMemberSelect.bind(this));
        // }
    }

    private onMemberSelect(id: string, selected: boolean) {
        // if (selected) {
        //     this.memberSelectedIds.add(id);
        // } else {
        //     this.memberSelectedIds.delete(id);
        // }
    }

    private async onAcceptMembers() {
        // if (this.memberSelectedIds.size === 0) {
        //     Constants.showConfirm("Vui lòng chọn ít nhất 1 thành viên!", "Thông báo");
        //     return;
        // }

        // const param: OfficeMembersApprovePayload = {
        //     officeId: this.myOffice.id,
        //     memberIds: Array.from(this.memberSelectedIds),
        // }
        // const result = await WebRequestManager.instance.postApproveMembersAsync(param);
        // this.memberSelectedIds.clear();
        // this.loadMembers();
    }

    private async onRejectMembers() {
        // const panel = await PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, {
        //     content: "Bạn có chắc chắn muốn từ chối thành viên này?",
        //     textButtonLeft: "Có",
        //     textButtonRight: "Không",
        //     textButtonCenter: "",
        //     onActionButtonLeft: () => {
        //         PopupManager.getInstance().closePopup(this.node.uuid);
        //     },
        //     onActionButtonRight: async () => {
        //         if (panel?.node?.uuid) {
        //             await Promise.all([
        //                 PopupManager.getInstance().closePopup(panel.node.uuid),
        //             ]);
        //         }
        //     },
        // });
        // if (this.memberSelectedIds.size === 0) {
        //     Constants.showConfirm("Vui lòng chọn ít nhất 1 thành viên!", "Thông báo");
        //     return;
        // }

        // const ids = Array.from(this.memberSelectedIds);
        // // const result = await WebRequestManager.instance.postRejectMembersAsync(ids);
        // // Constants.showConfirm(result.message, "Thành công");
        // this.loadMembers();
    }
}


