import { _decorator, Component, Node, Button, Prefab, ScrollView, Label, EditBox, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemLeaderboardClan } from '../Clan/ItemLeaderboardClan';
import { PaginationController } from '../utilities/PaginationController';
import { ClansResponseDTO } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
import { LoadingManager } from './LoadingManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanLeaderboard')
export class PopupClanLeaderboard extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svClanList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null!;
    @property(Label) totalClan: Label = null!;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;

    private listClan: ClansResponseDTO;
    private _listClan: ItemLeaderboardClan[] = [];
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

        this.pagination.init(
            async (page: number) => await this.loadList(page, this.currentSearch), 1
        );
        await this.loadList(1);
    }

    private async searchClansIfChanged(newSearch?: string) {
        const result = Constants.getSearchIfChanged(this.currentSearch, newSearch);
        if (result !== null) {
            this.currentSearch = result;
            await this.loadList(1, this.currentSearch);
        }
    }

    private async loadList(page: number, search?: string) {
        try{
            LoadingManager.getInstance().openLoading();
            this.listClan = await WebRequestManager.instance.getAllClansync(page, search);
        this.svClanList.content.removeAllChildren();
        this._listClan = [];
        this.noMember.active = !this.listClan?.result || this.listClan.result.length === 0;
        for (const itemClan of this.listClan.result) {
            const node = instantiate(this.itemPrefab);
            node.setParent(this.svClanList.content);

            const comp = node.getComponent(ItemLeaderboardClan)!;
            comp.setData(itemClan);
            this._listClan.push(comp);
        }
        this.totalClan.string = `Tổng số văn phòng: ${this.listClan.pageInfo.total}`;
        this.pagination.setTotalPages(this.listClan.pageInfo.total_page || 1);
        }catch{

        }finally{
            LoadingManager.getInstance().closeLoading();
        }

        
    }
}
