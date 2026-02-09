import { _decorator, Button, EditBox, Label, RichText, Sprite, SpriteFrame, Node, ScrollView, Prefab, instantiate } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import Utilities from '../utilities/Utilities';
import { BuyClanPetSlotDataDTO, IngredientDTO, ItemType, RecipeDTO } from '../Model/Item';
import { InventoryClanUIItemMini } from '../Clan/InventoryClanUIItemMini';
import { UserMeManager } from '../core/UserMeManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { Constants } from '../utilities/Constants';
import { GameManager } from '../core/GameManager';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupShopSlotPetClan')
export class PopupShopSlotPetClan extends BasePopup {

    @property({ type: Button }) buttonBuyItem: Button = null;
    @property({ type: Button }) buttonClose: Button = null;
    @property({ type: RichText }) buyItemquantity: RichText = null;
    // @property({ type: Label }) totalRequired: Label = null;
    @property({ type: Label }) maxSlotPetActive: Label = null;
    private petClanSlotRecipeDTO: RecipeDTO[] = [];
    private buyClanPetSlotDataDTO: BuyClanPetSlotDataDTO;

    public init() {
        this.buttonBuyItem.addAsyncListener(async () => {
            this.buttonBuyItem.interactable = false;
            await this.actionBuy();
            this.buttonBuyItem.interactable = true;
        });
         this.buttonClose.addAsyncListener(async () => {
            this.buttonClose.interactable = false;
            await this.closePopup()
            this.buttonClose.interactable = true;
        });
       this.SetData();
    }

    async SetData(){
        this.petClanSlotRecipeDTO = await WebRequestManager.instance.getAllRecipeByTypeAsync(ItemType.PET_CLAN_SLOT);
        const maxSlot =this.petClanSlotRecipeDTO.length > 0? this.petClanSlotRecipeDTO[0].current_slot_quantity : UserMeManager.Get.clan.max_slot_pet_active;
        this.maxSlotPetActive.string = `Số ô Pet hiện có: ${maxSlot} (tối đa)`;
        const totalCurrent = this.petClanSlotRecipeDTO[0].ingredients[0].current_quantity;
        const totalRequired = this.petClanSlotRecipeDTO[0].ingredients[0].total_required_quantity;
        const currentStr = Utilities.convertBigNumberToStr(totalCurrent);
        const requiredStr = Utilities.convertBigNumberToStr(totalRequired);
        if (totalCurrent < totalRequired) {
            this.buyItemquantity.string =`<b><color=#ff4d4d> ${currentStr}</color><color=#FFFFFF> / ${requiredStr}</color></b>`;
        } else {
            this.buyItemquantity.string =`<b><color=#FFFFFF> ${currentStr}/${requiredStr}</color></b>`;
        }
        const canBuy = this.checkEnoughIngredients(this.petClanSlotRecipeDTO[0].ingredients);
        this.buttonBuyItem.interactable = canBuy;
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
        this._onActionClose?.();
    }

    private checkEnoughIngredients( ingredients?: IngredientDTO[] | null): boolean {
        if (!ingredients || ingredients.length === 0) return true;

        return ingredients.every(ing => {
            const need = ing.total_required_quantity;
            const have = ing.current_quantity ?? 0;
            return have >= need;
        });
    }

    async actionBuy() {
        try {
            this.buyClanPetSlotDataDTO = await WebRequestManager.instance.postBuyPetClanSlotAsync(this.petClanSlotRecipeDTO[0].id);
            if (this.buyClanPetSlotDataDTO) {
                UserMeManager.Get.clan.max_slot_pet_active = this.buyClanPetSlotDataDTO.item.max_slot_pet_active;
            }
            Constants.showConfirm('Bạn đã nâng cấp ô pet ở nông trại thành công');
            GameManager.instance.playerHubController.updatePetSlotInfo();
            this.closePopup();

        } catch (err) {
            Constants.showConfirm('Có lỗi xảy ra bạn không thể nâng cấp thành công!!!');
        }
    }

}