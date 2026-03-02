import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { ClanDecorInventoryDTO, DecorItemDTO, Item, RecipeDTO, } from '../Model/Item';
import { Constants } from '../utilities/Constants';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('ShopClanTool')
export class ShopClanTool extends Component {
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;
    public onClick?: (item: ShopClanTool) => void;
    public recipe: RecipeDTO = null;
    public deco: ClanDecorInventoryDTO = null;
    @property({ type: Node }) isOwnerDeco: Node = null;
    @property({ type: Node }) isUseDeco: Node = null;

    public initItemToolFarm(recipe: RecipeDTO, callback?: (item: ShopClanTool) => void) {
        this.isOwnerDeco.active = false;
        this.recipe = recipe;
        this.onClick = callback;
        if (recipe.item) {
            this.iconItemUIHelper.setIconByItem(recipe.item);
        }
        else if (recipe.pet_clan) {
            this.iconItemUIHelper.setIconByPetClan(Constants.getPetClanType(recipe.pet_clan.pet_clan_code.toString()));
        }
        else if (recipe.decor_item) {
            this.iconItemUIHelper.icon.spriteFrame = ItemIconManager.getInstance().getIconDeco(recipe.decor_item.name.toString());
            this.SetIsOwnerDeco(recipe.decor_item.current_decor_item_quantity >= recipe.decor_item.max_decor_item_quantity);
        }
        if (this.toggle) {
            this.toggle.node.on('toggle', () => {
                if (this.toggle.isChecked) {
                    this.onItemClick();
                }
            });
        }
    }

    public initItemDeco(deco: ClanDecorInventoryDTO, callback?: (item: ShopClanTool) => void) {
        this.deco = deco;
        this.onClick = callback;
        this.iconItemUIHelper.icon.spriteFrame = ItemIconManager.getInstance().getIconDeco(deco.decorItem.name.toString());
        this.SetIsUseDeco(deco.is_used);
        if (this.toggle) {
            this.toggle.node.on('toggle', () => {
                if (this.toggle.isChecked) {
                    this.onItemClick();
                }
            });
        }
    }

    public SetIsUseDeco(isUse: boolean){
        this.isUseDeco.active = isUse;
    }

    public SetIsOwnerDeco(isOwn: boolean){
        this.isOwnerDeco.active = isOwn;
    }

    onItemClick() {
        if (this.onClick) {
            this.onClick(this);
        }
    }
}


