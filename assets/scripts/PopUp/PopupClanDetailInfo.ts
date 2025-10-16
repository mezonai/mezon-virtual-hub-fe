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
import { isValid } from 'cc';
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
    @property(Button) closeButton: Button = null;
    @property(AvatarIconHelper) avatarSprite: AvatarIconHelper = null!;

    private clanDetail: ClansData;
    private clanFund: number;
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

        this.inventoryClanBtn.addAsyncListener(async () => {
            this.inventoryClanBtn.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_ClanInventory", PopupClanInventory);
            this.inventoryClanBtn.interactable = true;
        });

        this.contributeBtn.addAsyncListener(async () => {
            this.contributeBtn.interactable = false;
            const param: PopupClanFundMemberParam =
            {
                clanDetail: this.clanDetail,
                clanFund: this.clanFund,
                onUpdateFund: (newFund: number) => {
                    this.clanFund = newFund;
                    this.totalClanFund.string = `<outline color=#222222 width=1>${newFund}</outline>`;
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
                defaultText: this._description || ""
            };
            await PopupManager.getInstance().openAnimPopup("UI_ClanNotice", PopupClanNotice, param);
        } else {
            Constants.showConfirm("Chỉ quản lý mới được phép thao tác");
        }
    }

    async getMyClan() {
        this.clanDetail = await WebRequestManager.instance.getClanDetailAsync(UserMeManager.Get.clan.id);

        const value = await WebRequestManager.instance.getClanFundAsync(UserMeManager.Get.clan.id);
        this.clanFund = value?.funds.find(f => f.type === "gold")?.amount ?? 0;
        this.totalClanFund.string = ` <outline color=#222222 width=1> ${this.clanFund}</outline>`;

        this.setDataMyClanInfo(this.clanDetail);
    }

    setDataMyClanInfo(clanData: ClansData) {
        this.branch.string = ` ${clanData.name ?? ""}`;
        this.nameLeader.string = ` ${clanData.leader?.display_name ?? "Hiện chưa có"}`;
        this.nameViceLeader.string = ` ${clanData.vice_leader?.display_name ?? "Hiện chưa có"}`;
        this.total_Member.string = ` ${(clanData.member_count ?? 0).toString()} `;
        this._description = clanData.description;
        this.description.string = `Mô tả: ${this._description ?? ""}`;
        this.avatarSprite.setAvatar(clanData.avatar_url ?? "avatar_1");
    }

    async callApiPostNotice(message: string) {
        const description: ClanDescriptionDTO = { description: message };
        this.descriptionNotice = await WebRequestManager.instance.postUpdateNoticeAsync(this.clanDetail.id, description);
        const desc = this.descriptionNotice?.description?.trim();
        this._description = desc && desc.length > 0 ? desc : "";
        this.description.string = `Mô tả: ${this._description}`;
    }

}