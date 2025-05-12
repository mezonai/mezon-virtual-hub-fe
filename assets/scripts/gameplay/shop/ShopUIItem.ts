import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { BaseInventoryUIITem } from '../player/inventory/BaseInventoryUIItem';
import { UserMeManager } from '../../core/UserMeManager';
import { Item } from '../../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('ShopUIItem')
export class ShopUIItem extends BaseInventoryUIITem {
    @property({ type: Node }) blockOverlay: Node = null;
    public override toggleActive(isActive) {
        this.stasSprite.spriteFrame = isActive ? this.stasFrame[1] : this.stasFrame[0];
    }

    public override init(data: Item) {
        super.init(data);
        this.checkOwn();
    }

    public checkOwn() {
        if (this.isOwn()) {
            this.blockOverlay.active = true;
            this.toggle.interactable = false;
            this.node.setSiblingIndex(this.node.parent.children.length);
        }
        else {
            this.blockOverlay.active = false;
            this.toggle.interactable = true;
            this.node.setSiblingIndex(0);
        }

    }

    public isOwn() {
        if (this.data.is_stackable) return false;
        
        return UserMeManager.Get.inventories.find(x => x.item.id == this.data.id) != null;
    }

    public reset() {
        this.toggleActive(false);
        this.checkOwn();
        this.toggle.isChecked = false;
    }
}