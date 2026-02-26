import { _decorator, Component, Node, Button, Prefab, ScrollView, instantiate, RichText, Label, Toggle } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { DecorPlaceholderDTO, ClanDecorInventoryDTO } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { LoadingManager } from './LoadingManager';
import { ShopClanTool } from '../Clan/ShopClanTool';
import { Sprite } from 'cc';
import { Constants } from '../utilities/Constants';
import { ServerManager } from '../core/ServerManager';
const { ccclass, property } = _decorator;
export enum ActionType {
    PLACE,
    REMOVE
}
@ccclass('PopupClanInventoryDeco')
export class PopupClanInventoryDeco extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Button) placeDecoButton: Button = null;
    @property(Button) removeDecoButton: Button = null;

    @property(RichText) titleText: RichText = null;
    @property(Prefab) itemRecipePrefab: Prefab = null!;
    @property(ScrollView) svShopClanPlaceDeco: ScrollView = null!;
    @property(Node) nodeShopClanPlaceDeco: Node = null!;
    @property(RichText) nameDecoPlacert: RichText = null;
    @property(Node) noItemPanel: Node = null;
    @property(Sprite) iconDecoPlace: Sprite = null!;
    private decoPlaceRecipeDTO: ClanDecorInventoryDTO[] = [];
    private _decosPlaceDataDTO: ShopClanTool[] = [];
    private selectingUIDecoPlace: ShopClanTool = null;
    private param: PopupClanShopDecoParam = null;

    public init(param?: PopupClanShopDecoParam): void {
        if (!param) {
            this.closePopup();
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.closePopup();
            this.closeButton.interactable = true;
        });

        if (param) {
            this.param = param;
        }
        if (param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }

        this.placeDecoButton.addAsyncListener(async () => {
            this.placeDecoButton.interactable = false;
            await this.onActionDeco(ActionType.PLACE);
            this.placeDecoButton.interactable = true;
        });

        this.removeDecoButton.addAsyncListener(async () => {
            this.removeDecoButton.interactable = false;
            await this.onActionDeco(ActionType.REMOVE);
            this.removeDecoButton.interactable = true;
        });
        this.initListFarmDecoPlace();
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    async initListFarmDecoPlace() {
        try {
            LoadingManager.getInstance().openLoading();
            this.titleText.string = `Trang Trí ${Constants.getDecoType(this.param.dataDecoPlace.type)} Tại Nông Trại`;
            this.decoPlaceRecipeDTO = await WebRequestManager.instance.getClanDecoInventoryAsync(UserMeManager.Get.clan.id, this.param.dataDecoPlace.type);
            this.loadFromServerFarmDecoPlace(this.decoPlaceRecipeDTO);
        } catch {

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    public loadFromServerFarmDecoPlace(data: ClanDecorInventoryDTO[]) {
        this.noItemPanel.active = !data.length;
        this.svShopClanPlaceDeco.content.removeAllChildren();
        this._decosPlaceDataDTO = [];

        for (const element of data) {
            const slotNode = instantiate(this.itemRecipePrefab);
            const decoItem = slotNode.getComponent(ShopClanTool);
            if (decoItem) {
                decoItem.initItemDeco(element, (slot) => {
                    this.showSlotDetailFarmDecoPlace(slot);
                });
            }
            slotNode.setParent(this.svShopClanPlaceDeco.content);
            this._decosPlaceDataDTO.push(decoItem);
        }
        this.setDefaultDetailDecoPlace();
    }

    setDefaultDetailDecoPlace() {
        if (!this._decosPlaceDataDTO || this._decosPlaceDataDTO.length === 0) return;
        const firstItem = this._decosPlaceDataDTO[0];
        firstItem.toggle.isChecked = true;
        firstItem.onItemClick();
    }

    private showSlotDetailFarmDecoPlace(decoItem: ShopClanTool) {
        this.selectingUIDecoPlace = decoItem;
        this.iconDecoPlace.spriteFrame = ItemIconManager.getInstance().getIconDeco(decoItem.deco.decorItem.name.toString());
        this.nameDecoPlacert.string = `<outline color=#222222 width=1> ${decoItem.deco.decorItem.name}</outline>`;
        console.log(decoItem.deco.id, "is Use",decoItem.deco.is_used);
        this.updatePetActionButtons(decoItem.deco.is_used);
    }

    public updatePetActionButtons(isActive: boolean) {
        this.placeDecoButton.node.active = !isActive;
        this.removeDecoButton.node.active = isActive;
    }

    async onActionDeco(actionType: ActionType) {
        switch (actionType) {
            case ActionType.PLACE:
                if(this.param.isHaveDeco){
                    Constants.showConfirm("Vị trí này đã có trang trí rồi! Hãy cất nó đi trước khi đặt trang trí mới.");
                }
                this.HandleSendPetInFarm();
                break;
            case ActionType.REMOVE:
                this.HandleSendPetOutFarm();
                break;
        }
    }

    private async HandleSendPetInFarm() {
        ServerManager.instance.sendPlaceDeco({
            estateId: this.param.estateId,
            placeholderId: this.param.dataDecoPlace.id,
            decorItemId: this.selectingUIDecoPlace.deco.decorItem.id
        });
    }

    private async HandleSendPetOutFarm() {
        ServerManager.instance.sendRemoveDeco({
            estateId: this.param.estateId,
            placeholderId: this.param.dataDecoPlace.id
        });
    }
}

export interface PopupClanShopDecoParam {
    dataDecoPlace: DecorPlaceholderDTO;
    estateId: string;
    isHaveDeco: boolean
    onActionClose?: () => void;
}

