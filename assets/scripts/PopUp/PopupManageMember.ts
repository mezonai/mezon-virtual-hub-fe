import { _decorator, Component, Node, Button, Prefab,ScrollView,instantiate } from 'cc';
import { PopupManager } from './PopupManager';
import { ItemMemberManager } from '../Clan/ItemMemberManager';
import { Label } from 'cc';
import { PopupClanMemberManager } from './PopupClanMemberManager';
import { ClansData, MemberResponseDTO, RemoveMembersPayload, UserClan } from '../Interface/DataMapAPI';
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
    private memberSelected: Map<string, UserClan> = new Map();
    
    private popupClanMemberManager: PopupClanMemberManager;
    private  onMemberChanged?: () => void;

    public init(clansData: ClansData, popupClanMemberManager: PopupClanMemberManager, param?: { onMemberChanged?: () => void }): void {
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

        this.searchInput.node.on('editing-return', async () => {
            await this.searchClansIfChanged(this.searchInput.string);
        });

        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            await this.searchClansIfChanged(this.searchInput.string);
            this.searchButton.interactable = true;
        });

        this.clanDetail = clansData;
        this.onMemberChanged = param?.onMemberChanged;
        this.checkShowMemberManager();
        this.popupClanMemberManager = popupClanMemberManager;
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    private async searchClansIfChanged(newSearch?: string) {
        const result = Constants.getSearchIfChanged(this.currentSearch, newSearch);
        if (result !== null) {
            this.currentSearch = result;
            await this.loadList(1, this.currentSearch);
        }
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
            itemComp.setData(itemOffice, (itemOffice, selected: boolean) => {
                this.onSelectMember(itemOffice, selected);
                this._listMember.push(itemComp);
            });
            this.totalMember.string = `Tổng số thành viên: ${this.listMember.pageInfo.total}`;
            this.pagination.setTotalPages(this.listMember.pageInfo.total_page || 1);
        }
    }

    private onSelectMember(member: UserClan, selected: boolean) {
        if (selected) {
            this.memberSelected.set(member.id, member);
        } else {
            this.memberSelected.delete(member.id);
        }

        const count = this.memberSelected.size;
        this.selectedCountLabel.string = `Đã chọn: ${count} thành viên`;
    }

    private validateSingleSelection(actionName: string, target :UserClan = null): boolean {
        const count = this.memberSelected.size;
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
        const [target] = Array.from(this.memberSelected.values());
        if (!this.validateSingleSelection("Chuyển Chức Vụ", target)) return;
        if (!this.validateTransfer(target)) return;
        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có muốn chuyển chức Giám Đốc cho người này không?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                if (!popup?.node?.uuid) return;
                await WebRequestManager.instance.patchTransferLeaderShipAsync(this.clanDetail.id, target.id);
                await Promise.all([
                    this.onMemberChanged?.(),
                    this.loadList(1),
                    this.memberSelected.clear(),
                    PopupManager.getInstance().closePopup(popup.node.uuid),
                ]);
            },
            onActionButtonRight: () => {
                if (popup?.node?.uuid) {
                    PopupManager.getInstance().closePopup(popup.node.uuid);
                }
            },
        });
    }

    private async onPromoteMembers() {
       const [target] = Array.from(this.memberSelected.values());
        if (!this.validateSingleSelection("Thăng Chức Vụ", target)) return;
        if (!this.validatePromote(target)) return;

        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có muốn thăng chức Phó Giám Đốc cho người này không?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                if (!popup?.node?.uuid) return;
                await WebRequestManager.instance.patchAssignViceLeaderAsync(this.clanDetail.id, target.id);
                await Promise.all([
                    this.onMemberChanged?.(),
                    this.loadList(1),
                    this.memberSelected.clear(),
                    PopupManager.getInstance().closePopup(popup.node.uuid),
                ]);
            },
            onActionButtonRight: () => {
                if (popup?.node?.uuid) {
                    PopupManager.getInstance().closePopup(popup.node.uuid);
                }
            },
        });
    }

    private async onDemoteMembers() {
        const [target] = Array.from(this.memberSelected.values());
        if (!this.validateSingleSelection("Hủy Chức Vụ", target)) return;
        if (!this.validateDemote(target)) return;
        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có muốn hủy chức Phó Giám Đốc của người này không?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                if (!popup?.node?.uuid) return;
                await WebRequestManager.instance.patchRemoveViceLeaderAsync(this.clanDetail.id, target.id);
                await Promise.all([
                    this.onMemberChanged?.(),
                    this.loadList(1),
                    this.memberSelected.clear(),
                    PopupManager.getInstance().closePopup(popup.node.uuid),
                ]);
            },
            onActionButtonRight: () => {
                if (popup?.node?.uuid) {
                    PopupManager.getInstance().closePopup(popup.node.uuid);
                }
            },
        });
    }

    private async onRemoveMembers() {
        const count = this.memberSelected.size;
        if (count === 0) {
            Constants.showConfirm("Vui lòng chọn thành viên để xóa khỏi văn phòng!");
            return;
        }

        const ids = Array.from(this.memberSelected.keys());
        const targets = Array.from(this.memberSelected.values());
        const invalidTarget = targets.find(user => !this.validateRemove(user));
        if (invalidTarget) return;

        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini",
            PopupSelectionMini,
            {
                content: `Bạn có muốn xóa ${count > 1 ? count + " thành viên" : "người này"} ra khỏi văn phòng không?`,
                textButtonLeft: "Có",
                textButtonRight: "Không",
                textButtonCenter: "",
                onActionButtonLeft: async () => {
                    if (!popup?.node?.uuid) return;
                    await WebRequestManager.instance.removeMemberAsync(this.clanDetail.id, ids);

                    await Promise.all([
                        this.onMemberChanged?.(),
                        this.loadList(1),
                        this.memberSelected.clear(),
                        PopupManager.getInstance().closePopup(popup.node.uuid),
                    ]);
                },
                onActionButtonRight: () => {
                    PopupManager.getInstance().closePopup(popup.node.uuid);
                },
            }
        );
    }

    private validateTransfer(target: UserClan): boolean {
        const userMe = UserMeManager.Get.user;

        if (target.id === userMe.id) {
            Constants.showConfirm("Bạn không thể tự chuyển chức cho chính mình!");
            return false;
        }
        if (target.clan_role === 'leader') {
            Constants.showConfirm("Người này đã là Giám đốc!");
            return false;
        }
        if (target.clan_role === 'vice_leader') {
            Constants.showConfirm("Không thể chuyển chức trực tiếp cho Phó Giám đốc! Hãy hủy chức Phó trước.");
            return false;
        }
        return true;
    }

    private validatePromote(target: UserClan): boolean {
        const leaderId = this.clanDetail?.leader?.id;
        const viceId = this.clanDetail?.vice_leader?.id;

        if (target.id === leaderId) {
            Constants.showConfirm("Không thể thăng chức cho Giám đốc!");
            return false;
        }
        if (viceId && viceId !== target.id) {
            Constants.showConfirm("Đã có Phó Giám đốc! Hãy hủy chức Phó hiện tại trước khi thăng người mới.");
            return false;
        }
        if (target.clan_role === 'vice_leader') {
            Constants.showConfirm("Người này đã là Phó Giám đốc!");
            return false;
        }

        return true;
    }

    private validateDemote(target: UserClan): boolean {
        if (target.clan_role !== 'vice_leader') {
            Constants.showConfirm("Người này không phải là Phó Giám đốc!");
            return false;
        }
        return true;
    }

    private validateRemove(target: UserClan): boolean {
        const leaderId = this.clanDetail?.leader?.id;

        if (target.id === leaderId) {
            Constants.showConfirm("Không thể xóa Giám đốc khỏi văn phòng!");
            return false;
        }
        return true;
    }
}