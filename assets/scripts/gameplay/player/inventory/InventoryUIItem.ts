import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { BaseInventoryUIITem } from './BaseInventoryUIItem';
import { Item } from '../../../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('InventoryUIITem')
export class InventoryUIITem extends BaseInventoryUIITem {
    public override init(data: Item) {
        super.init(data);
        console.log(data)
        if (data.is_stackable) {
            this.amountLabel.string = "1";
        }
        else {
            this.amountLabel.string = "";
        }
    }
}