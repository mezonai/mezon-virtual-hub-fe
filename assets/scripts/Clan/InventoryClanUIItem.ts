import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { ClanWarehouseSlotDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('InventoryClanUIItem')
export class InventoryClanUIItem extends Component {
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;

    public onClick?: (item: InventoryClanUIItem) => void;
    public clanWarehouseSlotDTO: ClanWarehouseSlotDTO = null;

    public initPlant(clanWarehouseSlotDTO: ClanWarehouseSlotDTO, callback?: (item: InventoryClanUIItem) => void) {
        this.clanWarehouseSlotDTO = clanWarehouseSlotDTO;
        this.onClick = callback;
        if (clanWarehouseSlotDTO.plant) {
            const sprite = this.iconItemUIHelper.getPlantIcon(clanWarehouseSlotDTO.plant?.name);
            if (sprite) this.iconItemUIHelper.icon.spriteFrame = sprite;
            this.amountLabel.string = `${clanWarehouseSlotDTO.quantity}`;
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
