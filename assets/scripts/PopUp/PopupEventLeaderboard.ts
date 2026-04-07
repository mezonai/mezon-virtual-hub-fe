import { _decorator, Component, Node, Button, Prefab, ScrollView, Label, instantiate, Toggle } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { FillterType, LeaderboardItemDTO, LeaderboardResponseDTO } from '../Interface/DataMapAPI';
import { LoadingManager } from './LoadingManager';
import { ItemLeaderboardEvent } from '../Event/ItemLeaderboardEvent.ts';
import { PopupLoginEventsParam } from './PopupLoginEvents';


const { ccclass, property } = _decorator;

@ccclass('PopupEventLeaderboard')
export class PopupEventLeaderboard extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(Node) noMember: Node = null!;
    @property(Toggle) tabClanButton: Toggle = null!;
    @property(Toggle) tabUserButton: Toggle = null!;
    @property(Node) clanTitleNode: Node = null!;
    @property(Node) userTitleNode: Node = null!;

    
    @property(ScrollView) contentClan: ScrollView = null!;
    @property(ScrollView) contentUser: ScrollView = null!;

    private currentMode: FillterType = FillterType.CLAN;
    private listData: LeaderboardResponseDTO
    private clanLeaderboardItems: ItemLeaderboardEvent[] = [];
    private userLeaderboardItems: ItemLeaderboardEvent[] = [];

    private eventId: string = '';

    public async init(param?: any) {
        this.eventId = param?.rewardEvents || '';

        this.closeButton.node.on(Button.EventType.CLICK, async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });

        this.tabClanButton.node.on(Toggle.EventType.TOGGLE, async (toggle: Toggle) => {
            if (toggle.isChecked) await this.switchMode(FillterType.CLAN);
        }, this);

        this.tabUserButton.node.on(Toggle.EventType.TOGGLE, async (toggle: Toggle) => {
            if (toggle.isChecked) await this.switchMode(FillterType.USER);
        }, this);

        this.currentMode = FillterType.CLAN;
        await this.loadList();
    }

    private async switchMode(mode: FillterType) {
        if (this.currentMode === mode) return;

        this.currentMode = mode;
        this.updateTabVisibility();
        await this.loadList();
    }

    private updateTabVisibility() {
        this.contentClan.node.active = this.currentMode === FillterType.CLAN;
        this.contentUser.node.active = this.currentMode === FillterType.USER;

        this.clanTitleNode.active = this.currentMode === FillterType.CLAN;
        this.userTitleNode.active = this.currentMode === FillterType.USER;
    }

    private getSlotsByMode(mode: FillterType): ItemLeaderboardEvent[] {
        return mode === FillterType.CLAN
            ? this.clanLeaderboardItems
            : this.userLeaderboardItems;
    }

    private getContentByMode(mode: FillterType): ScrollView {
        return mode === FillterType.CLAN
            ? this.contentClan
            : this.contentUser;
    }

    private async loadList() {
        try {
            LoadingManager.getInstance().openLoading();
            
            if (!this.eventId) return;

            this.listData = await WebRequestManager.instance.getLeaderboardEventAsync(this.eventId);
            const rawData = this.listData?.data ?? [];

            const sortedList = this.processLeaderboardData(rawData, this.currentMode);
            
            this.noMember.active = sortedList.length === 0;

            const slots = this.getSlotsByMode(this.currentMode);
            const content = this.getContentByMode(this.currentMode).content!;
            const isClanMode = this.currentMode === FillterType.CLAN;

            for (let i = 0; i < sortedList.length; i++) {
                let slot: ItemLeaderboardEvent;

                if (i < slots.length) {
                    slot = slots[i];
                } else {
                    const node = instantiate(this.itemPrefab);
                    node.setParent(content);
                    slot = node.getComponent(ItemLeaderboardEvent)!;
                    slots.push(slot);
                }

                slot.node.active = true;
                slot.setData(sortedList[i], isClanMode);
            }

            for (let i = sortedList.length; i < slots.length; i++) {
                if (slots[i]) slots[i].node.active = false;
            }

        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private processLeaderboardData(data: LeaderboardItemDTO[], mode: FillterType): LeaderboardItemDTO[] {
        if (!data || data.length === 0) return [];

        let processedList: LeaderboardItemDTO[] = [];

        if (mode === FillterType.CLAN) {
            const clanMap: Record<string, LeaderboardItemDTO> = {};
            data.forEach(item => {
                const id = item.clan_id;
                if (!clanMap[id]) {
                    clanMap[id] = { ...item };
                } else {
                    clanMap[id].score += item.score;
                }
            });
            processedList = Object.keys(clanMap).map(key => clanMap[key]);
        } else {
            processedList = [...data];
        }

        processedList.sort((a, b) => b.score - a.score);

        return processedList.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }
}