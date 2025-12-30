import { _decorator, Component, Node, Button, ScrollView, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemMemberMain } from '../Clan/ItemMemberMain';
import { WebRequestManager } from '../network/WebRequestManager';
import { Prefab } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
import { PopupClanMemberManager, PopupClanMemberManagerParam } from './PopupClanMemberManager';
import { ClansData, ClansResponseDTO, MemberResponseDTO, ScoreType } from '../Interface/DataMapAPI';
import { PaginationController } from '../utilities/PaginationController';
import { Label } from 'cc';
import { EditBox } from 'cc';
import { Constants } from '../utilities/Constants';
import { LoadingManager } from './LoadingManager';
import { ItemMemberScore } from '../Clan/ItemMemberScore';
import { Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupClanMember')
export class PopupClanMember extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) memberManageButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    @property(Label) totalMember: Label = null;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    @property(Toggle) tabWeekButton: Toggle = null!;
    @property(Toggle) tabTotalButton: Toggle = null!;
    private currentSearch: string = '';
    private currentMode: ScoreType = ScoreType.WEEKLY;
    @property(ScrollView) contentWeekly: ScrollView = null!;
    @property(ScrollView) contentTotal: ScrollView = null!;
    private listMember: MemberResponseDTO;

    private weeklyScoreMember: ItemMemberScore[] = [];
    private totalScoreMember: ItemMemberScore[] = [];

    private clanDetail: ClansData;
    private onMemberChanged?: () => void;

    public init(param?: PopupClanMemberParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        if (!param) return;
        this.clanDetail = param.clanDetail;
        this.CheckShowMemberManager();
        this.onMemberChanged = param?.onMemberChanged;

        this.searchInput.node.on('editing-return', async () => {
            await this.searchMembersIfChanged(this.searchInput.string);
        });

        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            await this.searchMembersIfChanged(this.searchInput.string);
            this.searchButton.interactable = true;
        });

        this.memberManageButton.addAsyncListener(async () => {
            this.memberManageButton.interactable = false;
            const param: PopupClanMemberManagerParam =
            {
                clanDetail: this.clanDetail,
                onMemberChanged: async () => {
                    await this.loadList(1);
                    this.onMemberChanged?.();
                },
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanMemberManager", PopupClanMemberManager, param);
            this.memberManageButton.interactable = true;
        });

        this.tabWeekButton.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ScoreType.WEEKLY);
            },
            this
        );

        this.tabTotalButton.node.on(
            Toggle.EventType.TOGGLE,
            async (toggle: Toggle) => {
                if (!toggle.isChecked) return;
                await this.switchMode(ScoreType.TOTAL);
            },
            this
        );

        this.currentMode = ScoreType.WEEKLY;
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    private async switchMode(mode: ScoreType) {
        if (this.currentMode === mode) return;

        this.currentMode = mode;
        this.updateTabVisibility();

        await this.loadList(1, this.currentSearch);
    }

    private updateTabVisibility() {
        this.contentWeekly.node.active = this.currentMode === ScoreType.WEEKLY;
        this.contentTotal.node.active = this.currentMode === ScoreType.TOTAL;
    }

    private getSlotsByMode(mode: ScoreType): ItemMemberScore[] {
        return mode === ScoreType.WEEKLY
            ? this.weeklyScoreMember
            : this.totalScoreMember;
    }

    private getContentByMode(mode: ScoreType): ScrollView {
        return mode === ScoreType.WEEKLY
            ? this.contentWeekly
            : this.contentTotal;
    }

    private async searchMembersIfChanged(newSearch?: string) {
        const result = Constants.getSearchIfChanged(this.currentSearch, newSearch);
        if (result !== null) {
            this.currentSearch = result;
            await this.loadList(1, this.currentSearch);
        }
    }

    CheckShowMemberManager() {
        const leaderId = this.clanDetail?.leader?.id;
        const isViceLeader = this.clanDetail?.vice_leaders?.some(
            (v) => v.id === UserMeManager.Get.user.id,
        );
        const canManage = UserMeManager.Get.user.id === leaderId || isViceLeader;
        this.memberManageButton.node.active = !!canManage;
    }

    private async loadList(page: number, search?: string) {
        try {
            LoadingManager.getInstance().openLoading();
            this.listMember = await WebRequestManager.instance.getListMemberClanAsync(this.clanDetail.id, this.currentMode.toString(), page, search);
            this.noMember.active = !this.listMember?.result || this.listMember.result.length === 0;

            const slots = this.getSlotsByMode(this.currentMode);
            const content = this.getContentByMode(this.currentMode).content;
            const list = this.listMember.result ?? [];

            for (let i = 0; i < list.length; i++) {
                let slot: ItemMemberScore;

                if (i < slots.length) {
                    slot = slots[i];
                } else {
                    const node = instantiate(this.itemPrefab);
                    node.setParent(content);
                    slot = node.getComponent(ItemMemberScore)!;
                    slots.push(slot);
                }

                slot.node.active = true;
                slot.setData(list[i]);
            }
            for (let i = list.length; i < slots.length; i++) {
                slots[i].node.active = false;
            }
            this.totalMember.string = `Tổng số thành viên: ${this.listMember.pageInfo.total}`;
            this.pagination.setTotalPages(this.listMember.pageInfo.total_page || 1);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

}

export interface PopupClanMemberParam {
    clanDetail: ClansData;
    onMemberChanged?: () => void;
}



