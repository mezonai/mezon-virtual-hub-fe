import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Sprite } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ClanActivityResponseDTO, ClansData } from '../Interface/DataMapAPI';
import { WebRequestManager } from '../network/WebRequestManager';
import { PaginationController } from '../utilities/PaginationController';
import { ItemHistoryClan } from '../Clan/ItemHistoryClan';
import { LoadingManager } from './LoadingManager';

const { ccclass, property } = _decorator;

@ccclass('PopupClanHistory')
export class PopupClanHistory extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svActivityClan: ScrollView = null!;
     @property(Node) noActivity: Node = null;
    @property(PaginationController) pagination: PaginationController = null!;

    private clanDetail: ClansData;
    private clanActivity: ClanActivityResponseDTO;
    private _clanActivity: ItemHistoryClan[] = []; 

    public init(param?: PopupClanHistoryParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        if (!param) return;
        this.clanDetail = param.clanDetail;
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    async loadList(page: number) {
        try {
            LoadingManager.getInstance().openLoading();
            this.clanActivity = await WebRequestManager.instance.getClanActivityAsync(this.clanDetail.id, page);
            this.svActivityClan.content.removeAllChildren();
            this._clanActivity = [];
            this.noActivity.active = !this.clanActivity?.result || this.clanActivity.result.length === 0;
            for (const itemClan of this.clanActivity.result) {
                const itemJoinClan = instantiate(this.itemPrefab);
                itemJoinClan.setParent(this.svActivityClan.content);
                const itemComp = itemJoinClan.getComponent(ItemHistoryClan)!;
                itemComp.setData(itemClan);
                this._clanActivity.push(itemComp);
            }
            this.pagination.setTotalPages(this.clanActivity.pageInfo.total_page || 1);
            this.UpdatePage();
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
        
    }

    UpdatePage(){
        const totalPages = this.clanActivity.pageInfo.total_page || 1;
        this.pagination.setTotalPages(totalPages);
    }

}

export interface PopupClanHistoryParam {
    clanDetail: ClansData;
}

