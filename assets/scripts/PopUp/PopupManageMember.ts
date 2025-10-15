import { _decorator, Component, Node, Button, Prefab,ScrollView,instantiate } from 'cc';
import { PopupManager } from './PopupManager';
import { ItemMemberManager } from '../Clan/ItemMemberManager';
import { Label } from 'cc';
import { PopupClanMemberManager } from './PopupClanMemberManager';
import { ClansData, MemberResponseDTO } from '../Interface/DataMapAPI';
import { WebRequestManager } from '../network/WebRequestManager';
import { Constants } from '../utilities/Constants';
import { PopupSelectionMini, SelectionMiniParam } from './PopupSelectionMini';
import { UserMeManager } from '../core/UserMeManager';
import { PaginationController } from '../utilities/PaginationController';
import { EditBox } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupManageMember')
export class PopupManageMember extends Component {
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svMemberList: ScrollView = null!;
    @property(Button) tranferBtn: Button = null!;
    @property(Button) promoteBtn: Button = null!;
    @property(Button) demoteBtn: Button = null!;
    @property(Button) removeMemberBtn: Button = null!;
    @property(Label) selectedCountLabel: Label = null!;
    @property(Label) totalMember: Label = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    @property(Node) noMember: Node = null;
    private currentSearch: string = '';

    private listMember: MemberResponseDTO;
    private _listMember: ItemMemberManager[] = [];
    private clanDetail: ClansData;
    private memberSelectedIds: Set<string> = new Set();
    
    private popupClanMemberManager: PopupClanMemberManager;

    public init(clansData: ClansData, popupClanMemberManager: PopupClanMemberManager): void {
        this.tranferBtn.addAsyncListener(async () => {
            this.tranferBtn.interactable = false;
            this.onTransferMembers();
            this.tranferBtn.interactable = true;
        });
        this.promoteBtn.addAsyncListener(async () => {
            this.promoteBtn.interactable = false;
            this.onPromoteMembers();
            this.promoteBtn.interactable = true;
        });
        this.demoteBtn.addAsyncListener(async () => {
            this.demoteBtn.interactable = false;
            this.onDemoteMembers();
            this.demoteBtn.interactable = true;
        });
        this.removeMemberBtn.addAsyncListener(async () => {
            this.removeMemberBtn.interactable = false;
            this.onRemoveMembers();
            this.removeMemberBtn.interactable = true;
        });
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            this.currentSearch = this.searchInput.string.trim();
            await this.loadList(1, this.currentSearch);
            this.searchButton.interactable = true;
        });
        this.clanDetail = clansData;
        this.checkShowMemberManager();
        this.popupClanMemberManager = popupClanMemberManager;
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    private checkShowMemberManager() {
        const isLeader = UserMeManager.Get.user.id === this.clanDetail?.leader?.id;
        const isViceLeader = UserMeManager.Get.user.id === this.clanDetail?.vice_leader?.id;

        this.tranferBtn.node.active = isLeader;
        this.promoteBtn.node.active = isLeader;
        this.demoteBtn.node.active = isLeader;
        this.removeMemberBtn.node.active = isLeader || isViceLeader;
    }

    public async loadList(page: number, search?: string) {
        this.listMember = await WebRequestManager.instance.getListMemberClanAsync(this.clanDetail.id, page, search);
        this.svMemberList.content.removeAllChildren();
        this._listMember = [];
        this.noMember.active = false;
        if(!this.listMember?.result || this.listMember.result.length === 0){
            this.noMember.active = true;
            return;
        }
        
        for (const itemOffice of this.listMember.result) {
            const itemJoinGuild = instantiate(this.itemPrefab);
            itemJoinGuild.setParent(this.svMemberList.content);

            const itemComp = itemJoinGuild.getComponent(ItemMemberManager)!;
            itemComp.setData(itemOffice, (id: string, selected: boolean) => {
                this.onSelectMember(id, selected);
                this._listMember.push(itemComp);
            });
            this.totalMember.string = `Tổng số thành viên: ${this.listMember.pageInfo.total}`;
            this.pagination.setTotalPages(this.listMember.pageInfo.total_page || 1);
        }
    }

    private onSelectMember(id: string, selected: boolean) {
        if (selected) {
            this.memberSelectedIds.add(id);
        } else {
            this.memberSelectedIds.delete(id);
        }

        const count = this.memberSelectedIds.size;
        this.selectedCountLabel.string = `Đã chọn: ${count} thành viên`;
    }

    private validateSingleSelection(actionName: string): boolean {
        const count = this.memberSelectedIds.size;
        if (count === 0) {
            Constants.showConfirm(`Vui lòng thành viên bất kì để "${actionName}"!`);
            return false;
        }
        if (count > 1) {
            Constants.showConfirm(`Chỉ có thể "${actionName}" cho 1 thành viên mỗi lần!`);
            return false;
        }
        return true;
    }

    private async onTransferMembers() {
        if (!this.validateSingleSelection("Chuyển Chức Vụ")) return;
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: "Bạn có muốn chuyển chức Giám Đốc cho người này không?",
            textButtonLeft: "Có",
            textButtonRight: "không",
            textButtonCenter: "",
            onActionButtonLeft: () => {
            },
            onActionButtonRight: () => {
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
       
    }
    
    private async onPromoteMembers() {
        if (!this.validateSingleSelection("Thăng Chức Vụ")) return;
       const param: SelectionMiniParam = {
            title: "Thông báo",
            content: "Bạn có muốn thăng chức Phó Giám Đốc cho người này không?",
            textButtonLeft: "Có",
            textButtonRight: "không",
            textButtonCenter: "",
            onActionButtonLeft: () => {
            },
            onActionButtonRight: () => {
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }


    private async onDemoteMembers() {
        if (!this.validateSingleSelection("Hủy Chức Vụ")) return;
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: "Bạn có muốn hủy chức Phó Giám Đốc của người này không?",
            textButtonLeft: "Có",
            textButtonRight: "không",
            textButtonCenter: "",
            onActionButtonLeft: () => {
            },
            onActionButtonRight: () => {
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }

    private async onRemoveMembers() {
        const count = this.memberSelectedIds.size;
        if (count === 0) {
            Constants.showConfirm(`Vui lòng chọn thành viên để xóa khỏi văn phòng`);
            return false;
        }
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: "Bạn có muốn xóa những người đã chọn ra khỏi văn phòng không?",
            textButtonLeft: "Có",
            textButtonRight: "không",
            textButtonCenter: "",
            onActionButtonLeft: () => {
            },
            onActionButtonRight: () => {
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }
}