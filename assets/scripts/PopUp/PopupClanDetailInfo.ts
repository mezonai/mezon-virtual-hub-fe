import { _decorator, RichText, Button, Label } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { PopupClanNotice, PopupClanNoticeParam as PopupOfficeNoticeParam } from './PopupClanNotice';
import { PopupClanMember, PopupClanMemberParam } from './PopupClanMember';
import { PopupClanLeaderboard } from './PopupClanLeaderboard';
import { PopupClanFundMember, PopupClanFundMemberParam } from './PopupClanFundMember';
import { PopupClanInventory } from './PopupClanInventory';
import { AvatarIconHelper } from '../Clan/AvatarIconHelper';
import { ClanDescriptionDTO, ClansData } from '../Interface/DataMapAPI';
import { UserMeManager } from '../core/UserMeManager';
import { PopupSelectionMini } from './PopupSelectionMini';
import { Constants } from '../utilities/Constants';
import { PurchaseMethod } from '../Model/Item';
import { ClanFundWatcher } from '../Clan/ClanFundWatcher';
const { ccclass, property } = _decorator;

@ccclass('PopupClanDetailInfo')
export class PopupClanDetailInfo extends BasePopup {
    @property(Label) private branch: Label = null!;
    @property(Label) private nameLeader: Label = null!;
    @property(Label) private nameViceLeader: Label = null!;
    @property(Label) private total_Member: Label = null!;
    @property(RichText) private totalClanFund: RichText = null!;
    @property(RichText) private description: RichText = null!;
    @property(Button) private wallPostBtn: Button = null!;
    @property(Button) private inventoryClanBtn: Button = null!;
    @property(Button) private contributeBtn: Button = null!;
    @property(Button) private listMemberBtn: Button;
    @property(Button) private leaderboardBtn: Button = null!;
    @property(Button) private outClanBtn: Button = null!;
    @property(Button) closeButton: Button = null;
    @property(AvatarIconHelper) avatarSprite: AvatarIconHelper = null!;

    private clanDetail: ClansData;
    private descriptionNotice: ClanDescriptionDTO;
    private _description:string;
    private goldCallback = (newVal: number) => this.updateGoldUI(newVal);
    
    public init(param?: any): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });

        this.wallPostBtn.addAsyncListener(async () => {
            this.wallPostBtn.interactable = false;
            await this.updateDescription();
            this.wallPostBtn.interactable = true;
        });

        this.inventoryClanBtn.addAsyncListener(async () => {
            this.inventoryClanBtn.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_ClanInventory", PopupClanInventory);
            this.inventoryClanBtn.interactable = true;
        });

        this.contributeBtn.addAsyncListener(async () => {
            this.contributeBtn.interactable = false;
            const param: PopupClanFundMemberParam =
            {
                clanDetail: this.clanDetail
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanFundMember", PopupClanFundMember, param);
            this.contributeBtn.interactable = true;
        });

        this.listMemberBtn.addAsyncListener(async () => {
            this.listMemberBtn.interactable = false;
            const param: PopupClanMemberParam =
            {
                clanDetail: this.clanDetail
            }
            await PopupManager.getInstance().openAnimPopup('UI_ClanMember', PopupClanMember, param);
            this.listMemberBtn.interactable = true;
        });

        this.leaderboardBtn.addAsyncListener(async () => {
            this.leaderboardBtn.interactable = false;
            await PopupManager.getInstance().openAnimPopup('UI_ClanLeaderboard', PopupClanLeaderboard);
            this.leaderboardBtn.interactable = true;
        });

        this.outClanBtn.addAsyncListener(async () => {
            this.outClanBtn.interactable = false;
            await this.outClan();
            this.outClanBtn.interactable = true;
        });
        this.getMyClan();
        ClanFundWatcher.instance.onChange(PurchaseMethod.GOLD, this.goldCallback);
    }

    async outClan(){
        const panel = await PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, {
            content: "Bạn có chắc chắn muốn rời văn phòng?",
            textButtonLeft: "Có",
            textButtonRight: "Không",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                if (panel?.node?.uuid) {
                    const res = await WebRequestManager.instance.postLeaveClanAsync(UserMeManager.Get.clan.id);
                    if (res && !res.clan) {
                        await Promise.all([
                            PopupManager.getInstance().closePopup(this.node.uuid),
                            PopupManager.getInstance().closePopup(panel.node.uuid),
                        ]);
                    } else {
                        Constants.showConfirm("Không thể rời văn phòng, vui lòng thử lại!");
                    }
                }
            },
            onActionButtonRight: () => {
                PopupManager.getInstance().closePopup(panel.node.uuid);
            },
        });
    }

    async updateDescription() {
        const leaderId = this.clanDetail?.leader?.id;
        const viceLeaderId = this.clanDetail?.vice_leader?.id;

        if (UserMeManager.Get.user.id === leaderId || UserMeManager.Get.user.id === viceLeaderId) {
            const param: PopupOfficeNoticeParam = {
                send: async (message: string) => {
                    await this.callApiPostNotice(message);
                },
                defaultText: this._description || "Hãy Nhập gì đó..."
            };
            await PopupManager.getInstance().openAnimPopup("UI_ClanNotice", PopupClanNotice, param);
        } else {
            Constants.showConfirm("Chỉ quản lý mới được phép thao tác");
        }
    }

    updateGoldUI(value: number) {
        this.totalClanFund.string = ` <outline color=#222222 width=1> ${value}</outline>`;
    }

    async getMyClan() {
        this.clanDetail = await WebRequestManager.instance.getClanDetailAsync(UserMeManager.Get.clan.id);
        console.log("Clan id", UserMeManager.Get.clan.id);
        this.setDataMyClanInfo(this.clanDetail);
    }

    setDataMyClanInfo(clanData: ClansData) {
        this.branch.string = ` ${clanData.name ?? ""}`;
        this.nameLeader.string = ` ${clanData.leader?.display_name ?? "Hiện chưa có"}`;
        this.nameViceLeader.string = ` ${clanData.vice_leader?.display_name ?? "Hiện chưa có"}`;
        this.total_Member.string = ` ${(clanData.member_count ?? 0).toString()} `;
        this._description = clanData.description;
        this.description.string = ` <outline color=#222222 width=1> Mô tả: ${this._description ?? ""}</outline>`;
        this.avatarSprite.setAvatar(clanData.avatar_url ?? "avatar_1");
        const goldFund = clanData.funds?.find(f => f.type === PurchaseMethod.GOLD)?.amount ?? 0;
        this.totalClanFund.string = ` <outline color=#222222 width=1> ${goldFund.toString()}</outline>`;
    }
    
    async callApiPostNotice(message: string) {
        const description: ClanDescriptionDTO = { description: message };
        this.descriptionNotice = await WebRequestManager.instance.postUpdateNoticeAsync(this.clanDetail.id, description);
        this._description = this.descriptionNotice.description;
        this.description.string = this._description ?? ` <outline color=#222222 width=1> Mô tả: </outline>`;
    }

}

