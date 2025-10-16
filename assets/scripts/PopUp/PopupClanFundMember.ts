import { Button } from 'cc';
import { _decorator, Component, Node, Prefab, ScrollView, instantiate, randomRangeInt} from 'cc';
import { PopupManager } from './PopupManager';
import { PopupTransferCoinPopup, SendClanFundParam} from './PopupTransferCoinPopup';
import { BasePopup } from './BasePopup';
import { Constants } from '../utilities/Constants';
import { UserManager } from '../core/UserManager';
import { UserMeManager } from '../core/UserMeManager';
import { PopupClanHistory } from './PopupClanHistory';
import { PaginationController } from '../utilities/PaginationController';
import { ClanContributorsResponseDTO, ClanFundPayload, ClansData } from '../Interface/DataMapAPI';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemMemberFund } from '../Clan/ItemMemberFund';
import { PurchaseMethod } from '../Model/Item';
import { ServerManager } from '../core/ServerManager';
import { RichText } from 'cc';
import { PopupSelectionMini } from './PopupSelectionMini';
import { EditBox } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupClanFundMember')
export class PopupClanFundMember extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) private clanFund_Btn : Button = null!;
    @property(Button) private historySpending_BTn: Button = null!;
    @property(RichText) private totalClanFund: RichText = null!;
    @property(RichText) private clanFundUsed: RichText = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svMemberList: ScrollView = null!;
    @property(PaginationController) pagination: PaginationController = null!;
    @property(Node) noMember: Node = null;
    @property(EditBox) searchInput: EditBox = null!;
    @property(Button) searchButton: Button = null!;

    private currentSearch: string = '';
    private clanDetail: ClansData;
    private listClanFundMember: ClanContributorsResponseDTO;
    private _listClanFundMember: ItemMemberFund[] = [];
    private onUpdateFund?: (newFund: number) => void;

    public init(param?: PopupClanFundMemberParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        if (!param) return;
        this.clanFund_Btn.addAsyncListener(async () => {
            this.clanFund_Btn.interactable = false;
            const param: SendClanFundParam = {
                clanDetail: this.clanDetail,
                onActionSendCoin: (data) => { this.SendClanFund(data); }
            }
            await PopupManager.getInstance().openAnimPopup("UITransferCoinPopup", PopupTransferCoinPopup, param);
            this.clanFund_Btn.interactable = true;
        });
        this.historySpending_BTn.addAsyncListener(async () => {
            this.historySpending_BTn.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_ClanHistory", PopupClanHistory);
            this.historySpending_BTn.interactable = true;
        });
        this.searchButton.addAsyncListener(async () => {
            this.searchButton.interactable = false;
            this.currentSearch = this.searchInput.string.trim();
            await this.loadList(1, this.currentSearch);
            this.searchButton.interactable = true;
        });

        this.clanDetail = param.clanDetail;
        this.onUpdateFund = param.onUpdateFund;
        this.updateGoldUI(param.clanFund);
        this.pagination.init(
            async (page: number) => await this.loadList(page), 1
        );
        this.loadList(1);
    }

    updateGoldUI(value: number) {
        this.totalClanFund.string = ` <outline color=#222222 width=1> ${value}</outline>`;
    }

    addSelfContribution(value: number) {
        this.updateGoldUI(value)
        this.loadList(1);
        if (this.onUpdateFund) {
            this.onUpdateFund(value);
        }
    }

    async loadList(page: number, search?: string) {
        this.listClanFundMember = await WebRequestManager.instance.GetClanFundContributorsAsync(this.clanDetail.id, page);
        this.svMemberList.content.removeAllChildren();
        this._listClanFundMember = [];
        
        this.noMember.active = !this.listClanFundMember?.result || this.listClanFundMember.result.length === 0;
        for (const itemClan of this.listClanFundMember.result) {
            const itemJoinClan = instantiate(this.itemPrefab);
            itemJoinClan.setParent(this.svMemberList.content);
            const itemComp = itemJoinClan.getComponent(ItemMemberFund)!;
            itemComp.setData(itemClan);
            this._listClanFundMember.push(itemComp);
        }
        this.pagination.setTotalPages(this.listClanFundMember.pageInfo.total_page || 1);
    }

    private async SendClanFund(data) {
        const { clanId, type, amount } = data;
        console.log("data:", data);
        console.log("amount:", amount);
        if (amount <= 0) {
            let chatContent = Constants.invalidGoldResponse[randomRangeInt(0, Constants.invalidGoldResponse.length)];
            Constants.showConfirm(chatContent);
            return;
        }
        console.log("Coin:", UserMeManager.playerCoin);
        if (amount > UserMeManager.playerCoin) {
            let chatContent = Constants.notEnoughGoldResponse[randomRangeInt(0, Constants.notEnoughGoldResponse.length)];
            Constants.showConfirm(chatContent);
            return;
        }

        const panel = await PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có chắc chắn muốn nạp quỹ cho văn phòng?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                ServerManager.instance.sendClanFund(data);
            },
            onActionButtonRight: () => {
                PopupManager.getInstance().closePopup(panel.node.uuid);
            },
        });
    }
}

export interface PopupClanFundMemberParam {
    clanDetail: ClansData;
    clanFund: number;
    onUpdateFund?: (newFund: number) => void;
}

