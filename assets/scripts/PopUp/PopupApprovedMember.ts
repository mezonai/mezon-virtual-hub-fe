import { _decorator, Component, Node, ScrollView, Prefab, Button, instantiate} from 'cc';
import { PopupClanMemberManager } from './PopupClanMemberManager';
import { ClanRequestResponseDTO, ClansData, MemberAction } from '../Interface/DataMapAPI';
import { EditBox } from 'cc';
import { PaginationController } from '../utilities/PaginationController';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemMemberJoinClan } from '../Clan/ItemMemberJoinClan';
import { Constants } from '../utilities/Constants';
import { Label } from 'cc';
import { PopupSelectionMini, SelectionMiniParam } from './PopupSelectionMini';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupApprovedMember')
export class PopupApprovedMember extends Component {
    @property(ScrollView) svMemberList: ScrollView = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Label) totalMember: Label = null!;
    @property(Node) noMember: Node = null;
    private currentSearch: string = '';
    private listMemberJoinClan: ClanRequestResponseDTO;
    private _listMemberJoinClan: ItemMemberJoinClan[] = [];
    private clanDetail: ClansData;
    private popupClanMemberManager: PopupClanMemberManager;

    public async init(clansData: ClansData, popupClanMemberManager: PopupClanMemberManager) {
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            this.currentSearch = this.searchInput.string.trim();
            await this.loadList(1, this.currentSearch);
            this.searchButton.interactable = true;
        });
        this.clanDetail = clansData;
        this.popupClanMemberManager = popupClanMemberManager;
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    public async loadList(page: number, search?: string) {
        this.listMemberJoinClan = await WebRequestManager.instance.getListMemberClanPendingAsync(this.clanDetail.id, page, search);
        this.svMemberList.content.removeAllChildren();
        this.noMember.active = false;

        const hasPending = Array.isArray(this.listMemberJoinClan?.result) && this.listMemberJoinClan.result.length > 0;
        this.popupClanMemberManager.ShowNoticeApprove(hasPending);

        if (!hasPending) {
            this.noMember.active = true;
            return;
        }

        for (const member of this.listMemberJoinClan.result) {
            const itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.svMemberList.content);

            const itemComp = itemNode.getComponent(ItemMemberJoinClan)!;
            itemComp.setData(member, async (id, action) => {
                await this.handleMemberAction(id, action);
            });
            this._listMemberJoinClan.push(itemComp);
        }

        this.totalMember.string = `Tổng số thành viên: ${this.listMemberJoinClan.pageInfo.total}`;
        this.pagination.setTotalPages(this.listMemberJoinClan.pageInfo.total_page || 1);
    }

    private async handleMemberAction(id: string, action: MemberAction) {
        const isAccept = action === MemberAction.ACCEPT;
        const message = isAccept ? "Bạn có chắc chắn muốn chấp nhận đơn xin tham gia này?" : "Bạn có chắc chắn muốn từ chối đơn xin tham gia này?";
        const successMsg = isAccept ? "Đã duyệt thành công!" : "Đã từ chối thành công!";
        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini", PopupSelectionMini, {
                content: message,
                textButtonLeft: "Có",
                textButtonRight: "Không",
                textButtonCenter: "",
                onActionButtonLeft: async () => {
                    if (!popup?.node?.uuid) return;
                    await WebRequestManager.instance.postApproveMembersAsync(id, isAccept);
                    await Promise.all([
                        Constants.showConfirm(successMsg, "Thông báo"),
                        await this.loadList(1),
                        PopupManager.getInstance().closePopup(this.node.uuid),
                        PopupManager.getInstance().closePopup(popup.node.uuid),
                    ]);
                },
                onActionButtonRight: () => {
                    if (popup?.node?.uuid) {
                        PopupManager.getInstance().closePopup(popup.node.uuid);
                    }
                },
            }
        );
    }
}


