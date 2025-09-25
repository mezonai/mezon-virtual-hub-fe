import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { BaseInventoryUIITem } from './BaseInventoryUIItem';
import { Food, Item, ItemType } from '../../../Model/Item';
import { UserMeManager } from '../../../core/UserMeManager';
import Utilities from '../../../utilities/Utilities';
import { WebRequestManager } from '../../../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('InventoryUIITem')
export class InventoryUIITem extends BaseInventoryUIITem {
    public override init(data: Item) {
        super.init(data);
    }

    public override initFood(data: Food) {
        super.initFood(data);
        const foodDTO = UserMeManager.GetFoods?.find(inv => inv.food?.id === data.id);
        const quantity = foodDTO?.quantity ?? 0;
        this.node.active = quantity > 0;
        this.amountLabel.string = Utilities.convertBigNumberToStr(quantity);
    }

      
    public async updateAmountCardItem(data: Item) {
        if (!this.amountLabel) return;
        const inventoryList = await WebRequestManager.instance.getItemTypeAsync(ItemType.PET_CARD);
        const itemDTO = inventoryList.find(inv => inv.item?.id === data.id)
        const quantity = itemDTO?.quantity ?? 0;
        this.amountLabel.string = Utilities.convertBigNumberToStr(quantity);
        this.amountLabel.node.active = data.type == ItemType.PET_CARD;
    }
}