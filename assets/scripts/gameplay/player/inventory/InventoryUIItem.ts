import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { BaseInventoryUIITem } from './BaseInventoryUIItem';
import { Food, Item } from '../../../Model/Item';
import { UserMeManager } from '../../../core/UserMeManager';
import Utilities from '../../../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('InventoryUIITem')
export class InventoryUIITem extends BaseInventoryUIITem {
    public override init(data: Item) {
        super.init(data);
        if (data.is_stackable) {
            this.amountLabel.string = "1";
        }
        else {
            this.amountLabel.string = "";
        }
    }

    public override initFood(data: Food) {
        super.initFood(data);
        const foodDTO = UserMeManager.GetFoods?.find(inv => inv.food?.id === data.id);
        const quantity = foodDTO?.quantity ?? 0;
        this.node.active = quantity > 0;
        this.amountLabel.string = Utilities.convertBigNumberToStr(10000);
    }
}