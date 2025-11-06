import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { PlantDataDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('ShopClanItem')
export class ShopClanItem extends Component {
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;
    public onClick?: (item: ShopClanItem) => void;
    public plant: PlantDataDTO = null;

    public initPlant(plant: PlantDataDTO, callback?: (item: ShopClanItem) => void) {
        this.plant = plant;
        this.onClick = callback;
        if (plant) {
            const sprite = this.iconItemUIHelper.getPlantIcon(plant?.name);
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


