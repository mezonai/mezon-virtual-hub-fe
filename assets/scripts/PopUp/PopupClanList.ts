import { _decorator, Prefab, Button, instantiate, ScrollView, Node} from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemJoinClan } from '../Clan/ItemJoinClan';
import { PaginationController } from '../utilities/PaginationController';
import { ClansData, ClansResponseDTO, ClanStatus, UserDataResponse } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
import { Label } from 'cc';
import { EditBox } from 'cc';
import { PopupSelectionMini } from './PopupSelectionMini';
import { PopupClanDetailInfo } from './PopupClanDetailInfo';
const { ccclass, property } = _decorator;
@ccclass('PopupClanList')
export class PopupClanList extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svClanList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    @property(Label) totalClan: Label = null;

    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;
    private currentSearch: string = '';

    private listClan: ClansResponseDTO;
    private _listClan: ItemJoinClan[] = []; 

    public async init(param?: any) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            this.currentSearch = this.searchInput.string.trim();
            await this.loadList(1, this.currentSearch);
            this.searchButton.interactable = true;
        });

        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
        this.UpdatePage();
    }

    async loadList(page: number, search?: string) {
        this.listClan = await WebRequestManager.instance.getAllClanRequestsync(page);
        this.svClanList.content.removeAllChildren();
        this._listClan = [];
        this.noMember.active = !this.listClan?.result || this.listClan.result.length === 0;
        for (const itemClan of this.listClan.result) {
                const itemJoinClan = instantiate(this.itemPrefab);
                itemJoinClan.setParent(this.svClanList.content);
                const itemComp = itemJoinClan.getComponent(ItemJoinClan)!;
                itemComp.setData(
                    itemClan,
                    async (clan) => await this.handleJoinRequest(clan, itemComp),
                    async (clan) => await this.handleCancelRequest(clan, itemComp)
                );
                this._listClan.push(itemComp);
        }
        this.totalClan.string =  `Tổng số văn phòng: ${this.listClan.pageInfo.total}`;
        this.pagination.setTotalPages(this.listClan.pageInfo.total_page || 1);
    }

    async ShowOpenClanWhenAprrove(message: string){
        await PopupManager.getInstance().openAnimPopup('UI_ClanDetailInfo', PopupClanDetailInfo);
        await PopupManager.getInstance().closePopup(this.node.uuid);
        Constants.showConfirm(message);

    }

    UpdatePage(){
        const totalPages = this.listClan.pageInfo.total_page || 1;
        this.pagination.setTotalPages(totalPages);
    }

    private async handleJoinRequest(clan: ClansData, itemComp: ItemJoinClan) {
        const hasPending = this.listClan.result.some(c => c.join_status === ClanStatus.PENDING);
        if (hasPending) {
            Constants.showConfirm(
                "Bạn đã gửi yêu cầu gia nhập văn phòng khác. Vui lòng hủy yêu cầu trước đó để tiếp tục."
            );
            return;
        }

        await WebRequestManager.instance.postJoinClanAsync(clan.id);
        Constants.showConfirm("Đơn gia nhập của bạn đã được gửi đi", "Thông báo");
        itemComp.updateStatus(ClanStatus.PENDING);
    }

    private async handleCancelRequest(clan: ClansData, itemComp: ItemJoinClan) {
        const popup = await PopupManager.getInstance().openAnimPopup(
            "PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có chắc muốn hủy yêu cầu gia nhập văn phòng này?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                if (!popup?.node?.uuid) return;
                const timeCanCancel = await WebRequestManager.instance.postCancelJoinClanAsync(clan.id);
                timeCanCancel
                ? await Constants.showConfirm(`Yêu cầu gia nhập chỉ có thể hủy sau ${timeCanCancel} giờ kể từ khi tạo.`)
                : itemComp.updateStatus(ClanStatus.NONE);

                await PopupManager.getInstance().closePopup(popup.node.uuid);

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