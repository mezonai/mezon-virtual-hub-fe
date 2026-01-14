import { _decorator, Component, Sprite, SpriteFrame, Vec3 } from 'cc';
import { Food, Item, ItemType, PurchaseMethod, RewardItemDTO, RewardType } from '../Model/Item';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('IconItemUIHelper')
export class IconItemUIHelper extends Component {
    @property(Sprite) icon: Sprite = null!;

    public async setIconByFood(food: Food) {
        if (!food || !ItemIconManager.getInstance()) return;
        this.icon.spriteFrame = ItemIconManager.getInstance().getIconFoodDto(food);
    }

    public async setIconByItem(item: Item) {
        if (!item || !ItemIconManager.getInstance()) return;
        this.icon.spriteFrame = await ItemIconManager.getInstance().getIconItemDto(item);
    }

    public async setIconByReward(reward: RewardItemDTO) {
        if (!reward || !ItemIconManager.getInstance()) return;
        this.icon.spriteFrame = await ItemIconManager.getInstance().getIconReward(reward);
        this.setSizeIconByRewardType(reward);
    }

    public async setIconByPurchaseMethod(method: PurchaseMethod) {
        if (!method || !ItemIconManager.getInstance()) return;
        switch (method) {
            case PurchaseMethod.GOLD:
                this.icon.spriteFrame = ItemIconManager.getInstance().getIconPurchaseMethod(
                    RewardType.GOLD
                );
                break;
            case PurchaseMethod.DIAMOND:
                this.icon.spriteFrame = ItemIconManager.getInstance().getIconPurchaseMethod(
                    RewardType.DIAMOND
                );
                break;
        }
    }

    public setSizeIconByItemType( itemType?: ItemType, sizeSpecial = 0.16, sizeDefault = 0.3
    ) {
        let value = sizeDefault;
        if (itemType) {
            if (itemType === ItemType.PET_CARD) value = 0.06;
            else if (itemType === ItemType.HAIR || itemType === ItemType.FACE)
                value = sizeSpecial;
        }
        this.node.scale = new Vec3(value, value, value);
    }

    public setSizeIconByRewardType( reward: RewardItemDTO, sizeSpecial = 0.16, sizeDefault = 0.3
    ) {
        let value = sizeDefault;
        if (reward.type === RewardType.ITEM && reward.item) {
            if (reward.item.type === ItemType.PET_CARD) value = 0.06;
            else if (
                reward.item.type === ItemType.HAIR ||
                reward.item.type === ItemType.FACE
            )
                value = sizeSpecial;
        } else if (reward.type === RewardType.PET) {
            value = 0.06;
        }
        this.node.scale = new Vec3(value, value, value);
    }

    public GetIcon(): SpriteFrame {
        return this.icon.spriteFrame;
    }

    public getMoneyIcon(rewardType: RewardType): SpriteFrame {
        return (this.icon.spriteFrame = ItemIconManager.getInstance().getIconPurchaseMethod(rewardType));
    }

}
