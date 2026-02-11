import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { InventoryDTO, Item } from '../Model/Item';
import Utilities from '../utilities/Utilities';
import { Color } from 'cc';
import { RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemCardUpgradePet')
export class ItemCardUpgradePet extends Component {
    @property({ type: RichText }) quantity: RichText = null;
    private quantityMaxUse: number = 1;
    _item: InventoryDTO;
    setDataItem(item: InventoryDTO | null) {
        this._item = item ?? null;
        const current = item?.quantity ?? 0;
        const max = this.quantityMaxUse;
        const currentStr = Utilities.convertBigNumberToStr(current);
        const requiredStr = Utilities.convertBigNumberToStr(max);

        if (current < max) {
            this.quantity.string =`<b><color=#ff4d4d> ${currentStr}</color><color=#FFFFFF>/${requiredStr}</color></b>`;
        } else {
        this.quantity.string =`<b><color=#FFFFFF> ${currentStr}/${requiredStr}</color></b>`;
        }
    }
}
