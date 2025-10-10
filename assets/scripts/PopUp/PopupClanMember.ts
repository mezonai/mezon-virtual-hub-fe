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
const { ccclass, property } = _decorator;

@ccclass('PopupClanMember')
export class PopupClanMember extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) memberManageButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svOfficeList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;

    private listMember: MemberResponseDTO;
    private _listMember: ItemMemberMain[] = [];
    private clanDetail: ClansData;

    public init(param?: PopupClanMemberParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        if (!param) return;
        this.clanDetail = param.clanDetail;
        this.memberManageButton.addAsyncListener(async () => {
            this.memberManageButton.interactable = false;
            const param: PopupClanMemberManagerParam =
            {
                clanDetail: this.clanDetail
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanMemberManager", PopupClanMemberManager, param);
            this.memberManageButton.interactable = true;
        });
        this.initList();
        this.CheckShowMemberManager();
        this.UpdatePage();
    }

    CheckShowMemberManager() {
        const userId = UserMeManager.Get.user.id;
        const { leader, vice_leader } = this.clanDetail;

        const canManage =
            (leader && userId === leader.id) ||
            (vice_leader && userId === vice_leader.id);

        this.memberManageButton.node.active = !!canManage;
    }

    UpdatePage() {
        const totalPages = this.listMember?.pageInfo.total_page || 1;
        this.pagination.setTotalPages(totalPages);
    }

    async initList() {
        this.listMember = await WebRequestManager.instance.getListMemberClanAsync(this.clanDetail.id);
        this.svOfficeList.content.removeAllChildren();
        this._listMember = [];
        this.noMember.active = !this.listMember?.result || this.listMember.result.length === 0;
        for (const itemMember of this.listMember.result) {
            const itemJoinGuild = instantiate(this.itemPrefab);
            itemJoinGuild.setParent(this.svOfficeList.content);

            const itemComp = itemJoinGuild.getComponent(ItemMemberMain)!;
            itemComp.setData(itemMember);
            this._listMember.push(itemComp);
        }
    }
}

export interface PopupClanMemberParam {
    clanDetail: ClansData;
}



