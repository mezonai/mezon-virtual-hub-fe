import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { Item, RecipeDTO, } from '../Model/Item';
import { Constants } from '../utilities/Constants';
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

    public initItemToolFarm(recipe: RecipeDTO, callback?: (item: ShopClanTool) => void) {
        this.recipe = recipe;
        this.onClick = callback;
        if (recipe.item) {
            this.iconItemUIHelper.setIconByItem(recipe.item);
        }
        else if (recipe.pet_clan) {
            this.iconItemUIHelper.setIconByPetClan(Constants.getPetClanType(recipe.pet_clan.pet_clan_code.toString()));
        }
        if (this.toggle) {
            this.toggle.node.on('toggle', () => {
                if (this.toggle.isChecked) {
                    this.onItemClick();
                }
            });
        }
    }

    onItemClick() {
        if (this.onClick) {
            this.onClick(this);
        }
    }
}


