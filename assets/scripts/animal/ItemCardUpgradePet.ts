import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { InventoryDTO, Item } from '../Model/Item';
import Utilities from '../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('ItemCardUpgradePet')
export class ItemCardUpgradePet extends Component {
    @property({ type: Label }) quantity: Label = null;
    private quantityMaxUse: number = 1;
    _item: InventoryDTO;

    setDataItem(item: InventoryDTO) {
        this._item = item;
        this.quantity.string = `${Utilities.convertBigNumberToStr(item.quantity.toString())}/${this.quantityMaxUse}`;
    }
}


