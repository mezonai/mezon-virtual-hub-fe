import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { Prefab } from 'cc';
import { ScrollView } from 'cc';
import { ItemLeaderboardClan } from '../Clan/ItemLeaderboardClan';
import { WebRequestManager } from '../network/WebRequestManager';
import { instantiate } from 'cc';
import { ClansResponseDTO } from '../Interface/DataMapAPI';
import { PaginationController } from '../utilities/PaginationController';
const { ccclass, property } = _decorator;

@ccclass('PopupClanLeaderboard')
export class PopupClanLeaderboard extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svOfficeList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    private listClan: ClansResponseDTO;
    private _listClan: ItemLeaderboardClan[] = [];

    public async init(param?: any) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        await this.initList();
    }

    async initList() {
        this.listClan = await WebRequestManager.instance.getAllClansync();
        this.svOfficeList.content.removeAllChildren();
        this._listClan = [];
        this.noMember.active = !this.listClan?.result || this.listClan.result.length === 0;
        for (const itemClan of this.listClan.result) {
            const itemJoinClan = instantiate(this.itemPrefab);
            itemJoinClan.setParent(this.svOfficeList.content);
            const itemComp = itemJoinClan.getComponent(ItemLeaderboardClan)!;
            itemComp.setData(itemClan);
            this._listClan.push(itemComp);
        }
        this.UpdatePage();
    }
   
    UpdatePage() {
        const totalPages = this.listClan.pageInfo.total_page || 1;
        this.pagination.setTotalPages(totalPages);
    }
}


