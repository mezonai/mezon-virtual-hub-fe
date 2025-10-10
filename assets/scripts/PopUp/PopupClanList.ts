import { _decorator, Prefab, Button, instantiate, ScrollView, Node} from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemJoinClan } from '../Clan/ItemJoinClan';
import { PaginationController } from '../utilities/PaginationController';
import { ClansResponseDTO, OfficeStatus, UserDataResponse } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;
@ccclass('PopupClanList')
export class PopupClanList extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svOfficeList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    private listClan: ClansResponseDTO;
    private _listClan: ItemJoinClan[] = []; 

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
                const itemComp = itemJoinClan.getComponent(ItemJoinClan)!;
                itemComp.setData(itemClan, async (office) => {
                    Constants.showConfirm("Lời Tham gia của bạn đã được gửi đi", "Thông báo");
                    const resultJoinOffice = await WebRequestManager.instance.postJoinClanAsync(office.id);
                    this.handleJoinOffice(resultJoinOffice);
                });
                this._listClan.push(itemComp);
        }
        this.UpdatePage();
    }

    UpdatePage(){
        const totalPages = this.listClan.pageInfo.total_page || 1;
        this.pagination.setTotalPages(totalPages);
    }

    handleJoinOffice(resultJoinClan: UserDataResponse) {
        console.log("Clan ", resultJoinClan);
        const officeId = resultJoinClan.clan.id;
        const item = this._listClan.find(i => i.getOfficeId() === officeId);
        item.updateStatus(OfficeStatus.PENDING);
    }
}