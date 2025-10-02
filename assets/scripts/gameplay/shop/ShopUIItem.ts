import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { BaseInventoryUIITem } from '../player/inventory/BaseInventoryUIItem';
import { UserMeManager } from '../../core/UserMeManager';
import { Food, FoodType, InventoryType, Item, ItemType } from '../../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('ShopUIItem')
export class ShopUIItem extends BaseInventoryUIITem {
    @property({ type: Node }) blockOverlay: Node = null;

    public override toggleActive(isActive) {
        this.stasSprite.spriteFrame = isActive ? this.stasFrame[1] : this.stasFrame[0];
    }

    public override init(data: Item) {
        super.init(data);
        this.checkOwn(data);
    }

    public override initFood(data: Food) {
        super.initFood(data);
        this.checkOwn(data);
    }

    public checkOwn(data: any) {
        if (this.isFoodData(this.dataFood)) {
            this.blockOverlay.active = false;
            this.toggle.interactable = true;
            return;
        }

        const owned = this.isOwn(data);
        this.blockOverlay.active = owned;
        this.toggle.interactable = !owned;
        this.node.setSiblingIndex(owned ? this.node.parent.children.length : 0);
    }

    private isFoodData(data: any): boolean {
        return (
            data?.type === FoodType.NORMAL ||
            data?.type === FoodType.PREMIUM ||
            data?.type === FoodType.ULTRA_PREMIUM
        );
    }

    public isOwn(data: Item): boolean {
        if (data.type === ItemType.PET_CARD) {
            return false;
        }
        return UserMeManager.Get.inventories.some(x => x.item?.id === data.id);
    }


    public isOwnFood(data: Food): boolean {
        return UserMeManager.Get.inventories.some(x => x.food?.id === data.id);
    }

    public reset() {
        this.toggleActive(false);
        this.checkOwn(this.data);
        this.toggle.isChecked = false;
    }
}