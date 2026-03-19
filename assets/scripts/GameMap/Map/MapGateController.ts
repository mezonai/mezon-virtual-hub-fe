import { _decorator, SpriteFrame, Color, Sprite, IPhysics2DContact, Collider2D } from 'cc';
import { ClanEstateDTO, DecorPlaceholderDTO, RecipeDTO, RewardType } from '../../Model/Item';
import { Constants } from '../../utilities/Constants';
import { WebRequestManager } from '../../network/WebRequestManager';
import { InteracterLabel } from '../../PopUp/InteracterLabel';
import { PopupManager } from '../../PopUp/PopupManager';
import { ItemIconManager } from '../../utilities/ItemIconManager';
import { PopupBuyQuantityItem, PopupBuyQuantityItemParam } from '../../PopUp/PopupBuyQuantityItem';
import { UserMeManager } from '../../core/UserMeManager';
import { MapItemController } from '../../gameplay/MapItem/MapItemController';
import { MapDecorSlot } from './MapDecorSlot';
import { OfficeSceneController } from '../OfficeScene/OfficeSceneController';
const { ccclass, property } = _decorator;

@ccclass('MapGateController')
export class MapGateController extends MapItemController {
    @property mapIndex: number = 0;
    @property([MapDecorSlot]) decorSlots: MapDecorSlot[] = [];
    private recipe: RecipeDTO | null = null;
    private estateData: ClanEstateDTO | null = null;
    private slotByIndex: Map<number, MapDecorSlot> = new Map();

    @property(Sprite) gateStatus: Sprite = null;
    @property(SpriteFrame) unlockedSprite: SpriteFrame = null;
    @property(SpriteFrame) lockedSprite: SpriteFrame = null;

    private colorLocked = new Color(255, 255, 255);
    private colorUnlocked = new Color(51, 0, 255);

    start() {
        this.slotByIndex.clear();
        this.decorSlots.forEach(slot => {
            this.slotByIndex.set(slot.positionIndex, slot);
        });
    }

    public setup(param: { estate: ClanEstateDTO | null, recipe: RecipeDTO | null }) {
        this.estateData = param.estate;
        this.recipe = param.recipe;
        if (this.estateData) {
            this.setUnlockedState();
            this.loadPlaceholders(this.estateData.realEstate.decorPlaceholders);
            return;
        }

        if (this.recipe?.map) {
            const current = this.recipe.map.current_map_quantity;
            const max = this.recipe.map.max_map_quantity;
            if (current >= max) {
                this.setUnlockedState();
                return;
            }

            if (current < max) {
                this.setLockedState();
                return;
            }
        }
    }

    private setLockedState() {
        // TODO: setLockedState LOCKED
        this.gateStatus.spriteFrame = this.lockedSprite;
        this.gateStatus.color = this.colorLocked;
    }

    private setUnlockedState() {
        // TODO: load scene hoặc trigger event Map
        this.gateStatus.spriteFrame = this.unlockedSprite;
        this.gateStatus.color = this.colorUnlocked;
    }

    private loadPlaceholders(data: DecorPlaceholderDTO[]) {
        if (!data || data.length === 0) return;
        data.forEach(ph => {
            const slot = this.slotByIndex.get(ph.position_index);
            if (!slot) return;
            slot.setInfoPlaceHolder(ph, this.estateData.id);
        });
    }

    protected override async interact(playerSessionId: string) {
        console.log("Interact with MapGateController")

        if (!UserMeManager.Get.clan || !UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
            PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm("Bạn cần thuộc văn phòng để tương tác mở rộng nông trại");
            return;
        }
        
        if (!this.recipe || !this.recipe.map) return;
        const isUnlocked =
            this.recipe.map.current_map_quantity >=
            this.recipe.map.max_map_quantity;
        if (isUnlocked) {
            this.enterMap();
            return;
        }

        const ingredients = this.recipe.ingredients ?? [];
        const goldIngredient = ingredients.find(i => i.gold && i.gold > 0);

        PopupManager.getInstance().openAnimPopup(
            'PopupBuyQuantityItem',
            PopupBuyQuantityItem,
            <PopupBuyQuantityItemParam>{
                isNotShowQuantity: true,
                selectedItemPrice: goldIngredient.gold,
                ingredientDTO: ingredients,
                spriteMoneyValue: ItemIconManager.getInstance().getIconPurchaseMethod(RewardType.GOLD),
                textButtonLeft: 'Thôi',
                textButtonRight: 'Mua',
                onActionButtonLeft: () => {},
                onActionButtonRight: () => this.tryPurchase(),
                onActionClose: () => (this.isOpenPopUp = false)
            }
        );
        
        this.handleEndContact(null, null, null);
    }

    // protected async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
    //         keyBoard: this.interactKey,
    //         action: `Để đến nông trại ${Constants.getGardenName(this.recipe.map.name)}`,
    //     });
    // }

    private async tryPurchase() {
        if (!this.recipe) return;
        try {
            await WebRequestManager.instance.postBuyMapFarmAsync(this.recipe.id);
            Constants.showConfirm("Mở map thành công!");
            if (this.recipe.map) {
                this.recipe.map.current_map_quantity = this.recipe.map.max_map_quantity;
                this.setUnlockedState();
            }

        } catch (e) {
            Constants.showConfirm("Có lỗi xảy ra khi mở map!");
        }
    }

    private enterMap() {
        
        OfficeSceneController.instance.LoadData();
    }
}