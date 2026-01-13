import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Label } from 'cc';
import { ClanWarehouseSlotDTO } from '../Farm/EnumPlant';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('InventoryClanUIItem')
export class InventoryClanUIItem extends Component {
    @property({ type: Sprite }) iconSeed: Sprite = null;
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: Sprite }) seedBags: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;

    public onClick?: () => void;

    public initPlant(clanWarehouseSlotDTO: ClanWarehouseSlotDTO, callback?: () => void) {
        this.onClick = callback;
        if (clanWarehouseSlotDTO.plant) {
            const sprite =  this.iconItemUIHelper.getPlantIcon(clanWarehouseSlotDTO.plant?.name);
            this.seedBags.node.active = !clanWarehouseSlotDTO.is_harvested;
            this.iconItemUIHelper.node.active = clanWarehouseSlotDTO.is_harvested;
            if (sprite) {
                this.iconItemUIHelper.icon.spriteFrame = sprite;
                this.iconSeed.spriteFrame = sprite;
            }

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

    public initTool(clanWarehouseSlotDTO: ClanWarehouseSlotDTO, callback?: () => void) {
        this.onClick = callback;
        if (clanWarehouseSlotDTO.item) {
            this.iconItemUIHelper.setIconByItem(clanWarehouseSlotDTO.item);
            this.iconItemUIHelper.node.active = true;
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
        if (!this?.node || !this.onClick) return;
        this.onClick();
    }
}
