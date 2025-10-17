import { _decorator, Component, Node, Button } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { PopupApprovedMember } from './PopupApprovedMember';
import { PopupManageMember } from './PopupManageMember';
import { ClansData } from '../Interface/DataMapAPI';
import { EditBox } from 'cc';
const { ccclass, property } = _decorator;

enum UpgradeTab {
    APPROVE = "APPROVE",
    MANAGER = "MANAGER",
}
@ccclass('PopupClanMemberManager')
export class PopupClanMemberManager extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property({ type: Node }) tabManagerMember: Node = null;
    @property({ type: PopupManageMember }) popupManageMember: PopupManageMember = null;
    @property({ type: Node }) tabAprovedmember: Node = null;
    @property({ type: Node }) redNoticeAprrove: Node = null;
    @property({ type: PopupApprovedMember }) popupApprovedMember: PopupApprovedMember = null;
    private currentTab: UpgradeTab = null;
    private clanDetail: ClansData;
    private isInitManager = false;
    private isInitApprove = false;
    public  onMemberChanged?: () => void;

    public init(param?: PopupClanMemberManagerParam): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        if (!param) return;
        this.clanDetail = param.clanDetail;
        this.onMemberChanged = param?.onMemberChanged;
        this.tabManagerMember.on(Node.EventType.TOUCH_END, () => this.switchTab(UpgradeTab.MANAGER));
        this.tabAprovedmember.on(Node.EventType.TOUCH_END, () => this.switchTab(UpgradeTab.APPROVE));
        this.switchTab(UpgradeTab.APPROVE);
    }

    private setActiveTabUI(tab: UpgradeTab) {
        this.popupManageMember.node.active = tab === UpgradeTab.MANAGER;
        this.popupApprovedMember.node.active = tab === UpgradeTab.APPROVE;
    }

    private async switchTab(tab: UpgradeTab) {
        this.currentTab = tab;
        this.setActiveTabUI(tab);

        if (tab === UpgradeTab.MANAGER) {
            if (!this.isInitManager) {
                await this.popupManageMember.init(this.clanDetail, this,  {
                    onMemberChanged: this.onMemberChanged,
                });
                this.isInitManager = true;
            }
        } 
        else if (tab === UpgradeTab.APPROVE) {
            if (!this.isInitApprove) {
                await this.popupApprovedMember.init(this.clanDetail, this);
                this.isInitApprove = true;
            }
        }
    }

    public ShowNoticeApprove(isShow:boolean){
        this.redNoticeAprrove.active = isShow;
    }
}


export interface PopupClanMemberManagerParam {
    clanDetail: ClansData;
    onMemberChanged?: () => void;
}


