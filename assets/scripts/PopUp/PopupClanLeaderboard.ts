import { _decorator, Component, Node, Button, Prefab, ScrollView, Label, EditBox, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemLeaderboardClan } from '../Clan/ItemLeaderboardClan';
import { PaginationController } from '../utilities/PaginationController';
import { ClansResponseDTO, ScoreType } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
import { LoadingManager } from './LoadingManager';
import { Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupClanLeaderboard')
export class PopupClanLeaderboard extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null!;
    @property(Label) totalClan: Label = null!;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    @property(Toggle) tabWeekButton: Toggle = null!;
    @property(Toggle) tabTotalButton: Toggle = null!;
    private currentMode: ScoreType = ScoreType.WEEKLY;
    @property(ScrollView) contentWeekly: ScrollView = null!;
    @property(ScrollView) contentTotal: ScrollView = null!;

    private listClan: ClansResponseDTO;
    private weeklyListClan: ItemLeaderboardClan[] = [];
    private totatListClan: ItemLeaderboardClan[] = [];
    private currentSearch: string = '';

    public async init(param?: any) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });

        this.searchInput.node.on('editing-return', async () => {
            await this.searchClansIfChanged(this.searchInput.string);
        });
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            await this.searchClansIfChanged(this.searchInput.string);
            this.searchButton.interactable = true;
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

        this.pagination.init(
            async (page: number) => await this.loadList(page, this.currentSearch), 1
        );
        this.currentMode = ScoreType.WEEKLY;
        await this.loadList(1);
    }

    private async searchClansIfChanged(newSearch?: string) {
        const result = Constants.getSearchIfChanged(this.currentSearch, newSearch);
        if (result !== null) {
            this.currentSearch = result;
            await this.loadList(1, this.currentSearch);
        }
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

    private getSlotsByMode(mode: ScoreType): ItemLeaderboardClan[] {
        return mode === ScoreType.WEEKLY
            ? this.weeklyListClan
            : this.totatListClan;
    }

    private getContentByMode(mode: ScoreType): ScrollView {
        return mode === ScoreType.WEEKLY
            ? this.contentWeekly
            : this.contentTotal;
    }

    private async loadList(page: number, search?: string) {
        try {
            LoadingManager.getInstance().openLoading();
            const isWeekly = this.currentMode === ScoreType.WEEKLY;
            this.listClan = await WebRequestManager.instance.getAllClansync(isWeekly, page, search);
            this.noMember.active = !this.listClan?.result || this.listClan.result.length === 0;
            const slots = this.getSlotsByMode(this.currentMode);
            const content = this.getContentByMode(this.currentMode).content;
            const list = this.listClan.result ?? [];

            for (let i = 0; i < list.length; i++) {
                let slot: ItemLeaderboardClan;

                if (i < slots.length) {
                    slot = slots[i];
                } else {
                    const node = instantiate(this.itemPrefab);
                    node.setParent(content);
                    slot = node.getComponent(ItemLeaderboardClan)!;
                    slots.push(slot);
                }

                slot.node.active = true;
                slot.setData(list[i], isWeekly);
            }
            for (let i = list.length; i < slots.length; i++) {
                slots[i].node.active = false;
            }
            this.totalClan.string = `Tổng số văn phòng: ${this.listClan.pageInfo.total}`;
            this.pagination.setTotalPages(this.listClan.pageInfo.total_page || 1);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }


    }
}
