import { _decorator, Component, Node, Prefab, ScrollView, Button, instantiate, CCBoolean, CCString } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemIconAvatarClan } from '../Clan/ItemIconAvatarClan';
import { ClansData } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;

@ccclass('AvatarIconStruct')
export class AvatarIconStruct {
    @property({ type: CCString })
    name: string = '';

    @property({ type: CCBoolean })
    owned: boolean = false;
}

@ccclass('PopupClanUpdateIcon')
export class PopupClanUpdateIcon extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Button) updateButton: Button = null!;
    @property(Prefab) avatarItemPrefab: Prefab = null!;
    @property(ScrollView) svAvatarList: ScrollView = null!;
    @property([AvatarIconStruct]) avatarIconStruct: AvatarIconStruct[] = [];

    private myOffice: ClansData;
    private selectedAvatarName: string = '';
    private avatarItems: ItemIconAvatarClan[] = [];
    onAvatarUpdated?: (avatarName: string) => void;

    public init(param?: PopupClanUpdateIconParam): void {
        this.closeButton.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
        if (!param) return;

        this.onAvatarUpdated = param.onAvatarUpdated;
        this.myOffice = param.clanDetail;
        this.selectedAvatarName = this.myOffice.avatar_url ?? '';

        this.updateButton.addAsyncListener(async () => {
            this.updateButton.interactable = false;
            // APIManager.postUpdateOfficeAvatar(this.myOffice.id, this.selectedAvatarName);
            this.onAvatarUpdated?.(this.selectedAvatarName);
            this.updateButton.interactable = true;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });

        this.loadAvatars();
    }

    private loadAvatars() {
        this.svAvatarList.content.removeAllChildren();
        this.avatarItems = [];

        for (const avatarData of this.avatarIconStruct) {
            const itemNode = instantiate(this.avatarItemPrefab);
            itemNode.setParent(this.svAvatarList.content);
            const itemComp = itemNode.getComponent(ItemIconAvatarClan);
            itemComp.avatarIconHelper.setAvatar(avatarData.name);
            const isCurrent = avatarData.name === this.myOffice.avatar_url;
            itemComp.toggleActive(isCurrent);
            this.avatarItems.push(itemComp);
            itemComp.toggle.node.on("toggle", () => {
                this.onAvatarSelected(itemComp, avatarData.name);
            });
        }
    }

    private onAvatarSelected(item: ItemIconAvatarClan, avatarName: string) {
        this.selectedAvatarName = avatarName;
    }
}

export interface PopupClanUpdateIconParam {
    clanDetail: ClansData;
    onAvatarUpdated?: (avatarName: string) => void;
}
