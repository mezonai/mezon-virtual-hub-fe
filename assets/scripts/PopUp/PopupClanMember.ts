import { _decorator, Component, Node, Button, ScrollView, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemMemberMain } from '../Clan/ItemMemberMain';
import { WebRequestManager } from '../network/WebRequestManager';
import { Prefab } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { PopupClanMemberManager, PopupClanMemberManagerParam } from './PopupClanMemberManager';
import { ClansData, ClansResponseDTO, MemberResponseDTO } from '../Interface/DataMapAPI';
import { PaginationController } from '../utilities/PaginationController';
import { Label } from 'cc';
import { EditBox } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupClanMember')
export class PopupClanMember extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) memberManageButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svMemberList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    @property(Label) totalMember: Label = null;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    private currentSearch: string = '';

    private listMember: MemberResponseDTO;
    private _listMember: ItemMemberMain[] = [];
    private clanDetail: ClansData;

    public init(param?: PopupClanMemberParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.clanDetail = param.clanDetail;
        this.CheckShowMemberManager();
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            this.currentSearch = this.searchInput.string.trim();
            await this.loadList(1, this.currentSearch);
            this.searchButton.interactable = true;
        });

        this.memberManageButton.addAsyncListener(async () => {
            this.memberManageButton.interactable = false;
            const param: PopupClanMemberManagerParam =
            {
                clanDetail: this.clanDetail
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanMemberManager", PopupClanMemberManager, param);
            this.memberManageButton.interactable = true;
        });
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    CheckShowMemberManager() {
        const leaderId = this.clanDetail?.leader?.id;
        const viceLeaderId = this.clanDetail?.vice_leader?.id;
        const canManage = UserMeManager.Get.user.id === leaderId || UserMeManager.Get.user.id === viceLeaderId;
        this.memberManageButton.node.active = !!canManage;
    }

    private async loadList(page: number, search?: string) {
        this.listMember = await WebRequestManager.instance.getListMemberClanAsync(this.clanDetail.id, page, search);

        this.svMemberList.content.removeAllChildren();
        this._listMember = [];
        this.noMember.active = !this.listMember?.result || this.listMember.result.length === 0;

        for (const itemMember of this.listMember.result) {
            const itemNode = instantiate(this.itemPrefab);
            itemNode.setParent(this.svMemberList.content);

            const itemComp = itemNode.getComponent(ItemMemberMain)!;
            itemComp.setData(itemMember);
            this._listMember.push(itemComp);
        }

        this.totalMember.string = `Tổng số thành viên: ${this.listMember.pageInfo.total}`;
        this.pagination.setTotalPages(this.listMember.pageInfo.total_page || 1);
    }

}

export interface PopupClanMemberParam {
    clanDetail: ClansData;
}



