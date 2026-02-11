import { _decorator, RichText, Button, Label } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { PopupClanNotice, PopupClanNoticeParam as PopupOfficeNoticeParam } from './PopupClanNotice';
import { PopupClanMember, PopupClanMemberParam } from './PopupClanMember';
import { PopupClanLeaderboard } from './PopupClanLeaderboard';
import { PopupClanFundMember, PopupClanFundMemberParam } from './PopupClanFundMember';
import { PopupClanInventory, PopupClanInventoryParam } from './PopupClanInventory';
import { AvatarIconHelper } from '../Clan/AvatarIconHelper';
import { ClanDescriptionDTO, ClanFundResponseDTO, ClansData } from '../Interface/DataMapAPI';
import { UserMeManager } from '../core/UserMeManager';
import { PopupSelectionMini } from './PopupSelectionMini';
import { Constants } from '../utilities/Constants';
import { isValid } from 'cc';
import { PopupClanHistory, PopupClanHistoryParam } from './PopupClanHistory';
import { LoadingManager } from './LoadingManager';
import { PopupClanShop } from './PopupClanShop';
const { ccclass, property } = _decorator;

@ccclass('PopupClanDetailInfo')
export class PopupClanDetailInfo extends BasePopup {
    @property(Label) private branch: Label = null!;
    @property(Label) private nameLeader: Label = null!;
    @property(Label) private nameViceLeader: Label = null!;
    @property(Label) private total_Member: Label = null!;
    @property(RichText) private totalClanFund: RichText = null!;
    @property(Label) private description: Label = null!;
    @property(Button) private wallPostBtn: Button = null!;
    @property(Button) private inventoryClanBtn: Button = null!;
    @property(Button) private contributeBtn: Button = null!;
    @property(Button) private listMemberBtn: Button;
    @property(Button) private leaderboardBtn: Button = null!;
    @property(Button) private outClanBtn: Button = null!;
    @property(Button) ShopClanButton: Button = null;
    @property(Button) closeButton: Button = null;
    @property(AvatarIconHelper) avatarSprite: AvatarIconHelper = null!;
    @property(Button) private history_Btn: Button = null!;

    private clanDetail: ClansData;
    private clanFund: number;
    private clanFundUsed: number;
    private descriptionNotice: ClanDescriptionDTO;
    private _description:string;

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

        this.ShopClanButton.addAsyncListener(async () => {
            this.ShopClanButton.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_ClanShop", PopupClanShop, {
                clanDetailId: this.clanDetail.id,
            });
            this.ShopClanButton.interactable = true;
        });

        this.inventoryClanBtn.addAsyncListener(async () => {
            this.inventoryClanBtn.interactable = false;
            const param: PopupClanInventoryParam =
            {
                clanDetailId: this.clanDetail.id,
                onUpdateFund: (newFund: number) => {
                    this.clanFund = newFund;
                    this.setDataFundClan(newFund);
                }
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanInventory", PopupClanInventory, param);
            this.inventoryClanBtn.interactable = true;
        });

        this.contributeBtn.addAsyncListener(async () => {
            this.contributeBtn.interactable = false;
            const value = await WebRequestManager.instance.getClanFundAsync(this.clanDetail.id);
            const newFund = value?.funds.find(f => f.type === "gold")?.amount ?? 0;
            const newSpent = value?.funds.find(f => f.type === "gold")?.spent_amount ?? 0;

            const param: PopupClanFundMemberParam =
            {
                clanDetail: this.clanDetail,
                clanFund: newFund,
                clanFundUsed: newSpent,
                onUpdateFund: (newFund: number) => {
                    this.clanFund = newFund;
                    this.setDataFundClan(newFund);
                }
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanFundMember", PopupClanFundMember, param);
            this.contributeBtn.interactable = true;
        });

        this.listMemberBtn.addAsyncListener(async () => {
            this.listMemberBtn.interactable = false;
            const param: PopupClanMemberParam =
            {
                clanDetail: this.clanDetail,
                onMemberChanged: async () => {
                    await this.getMyClan();
                },
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

        this.history_Btn.addAsyncListener(async () => {
            this.history_Btn.interactable = false;
            const param: PopupClanHistoryParam =
            {
                clanDetail: this.clanDetail,
            }
            await PopupManager.getInstance().openAnimPopup("UI_ClanHistory", PopupClanHistory, param);
            this.history_Btn.interactable = true;
        });

        this.getMyClan();
    }

    async outClan(){
        if(UserMeManager.Get.user.id == this.clanDetail?.leader?.id){
            Constants.showConfirm("Bạn đang là Giám đốc văn phòng. Hãy bổ nhiệm người khác trước khi rời văn phòng!");
            return;
        }
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
                            WebRequestManager.instance.getUserProfileAsync(),
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
        const isViceLeader = this.clanDetail?.vice_leaders?.some(
            (v) => v.id === UserMeManager.Get.user.id,
        );

        if (UserMeManager.Get.user.id === leaderId || isViceLeader) {
            const param: PopupOfficeNoticeParam = {
                send: async (message: string) => {
                    await this.callApiPostNotice(message);
                },
                defaultText: this._description || ""
            };
            await PopupManager.getInstance().openAnimPopup("UI_ClanNotice", PopupClanNotice, param);
        } else {
            Constants.showConfirm("Chỉ quản lý mới được phép thao tác");
        }
    }

    async getMyClan() {
        try {
            LoadingManager.getInstance().openLoading();
            this.clanDetail = await WebRequestManager.instance.getClanDetailAsync(UserMeManager.Get.clan.id);
            const value = await WebRequestManager.instance.getClanFundAsync(UserMeManager.Get.clan.id);
            this.clanFund = value?.funds.find(f => f.type === "gold")?.amount ?? 0;
            this.clanFundUsed = value?.funds.find(f => f.type === "gold")?.spent_amount ?? 0;
            this.setDataFundClan(this.clanFund);
            this.setDataMyClanInfo(this.clanDetail);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    public setDataFundClan(value: Number){
        this.totalClanFund.string = ` <outline color=#222222 width=1> ${value}</outline>`;
    }

    setDataMyClanInfo(clanData: ClansData) {
        this.branch.string = ` ${clanData.name ?? ""}`;
        this.nameLeader.string = ` ${clanData.leader?.display_name ?? "Hiện chưa có"}`;
        //this.nameViceLeader.string = ` ${clanData.vice_leader?.display_name ?? "Hiện chưa có"}`;
        this.total_Member.string = ` ${(clanData.member_count ?? 0).toString()} `;
        this._description = clanData.description;
        this.description.string = ` Mô tả: ${this._description ?? ""}`;
        this.avatarSprite.setAvatar(clanData.avatar_url ?? "avatar_1");
    }

    async callApiPostNotice(message: string) {
        const description: ClanDescriptionDTO = { description: message };
        this.descriptionNotice = await WebRequestManager.instance.postUpdateNoticeAsync(this.clanDetail.id, description);
        const desc = this.descriptionNotice?.description?.trim();
        this._description = desc && desc.length > 0 ? desc : "";
        this.description.string = ` Mô tả: ${this._description}`;
    }

}