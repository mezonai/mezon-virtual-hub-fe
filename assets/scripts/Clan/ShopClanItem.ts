import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { PlantDataDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('ShopClanItem')
export class ShopClanItem extends Component {
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: Sprite }) seedBags: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;
    public onClick?: (item: ShopClanItem) => void;
    public plant: PlantDataDTO = null;

    public initPlant(plant: PlantDataDTO, callback?: (item: ShopClanItem) => void) {
        this.plant = plant;
        this.onClick = callback;
        if (plant) {
            this.seedBags.node.active = true;
            const sprite = ItemIconManager.getInstance().getIconPlantFarm(plant?.name);
            if (sprite) this.iconItemUIHelper.icon.spriteFrame = sprite;
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


