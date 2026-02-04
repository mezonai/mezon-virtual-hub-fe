import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { Item, RecipeDTO, } from '../Model/Item';
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
    public farmTool: RecipeDTO = null;

    public initItemFarmTool(farmTool: RecipeDTO, callback?: (item: ShopClanTool) => void) {
        this.farmTool = farmTool;
        this.onClick = callback;
        if (farmTool) {
            this.iconItemUIHelper.setIconByItem(farmTool.item);
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


