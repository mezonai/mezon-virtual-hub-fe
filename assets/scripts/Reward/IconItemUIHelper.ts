import { _decorator, Component, Sprite, SpriteFrame, Label } from 'cc';
import { Food, InventoryDTO, InventoryType, Item, ItemType, PurchaseMethod, RewardItemDTO, RewardType } from '../Model/Item';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { LocalItemDataConfig } from '../Model/LocalItemConfig';
import { ResourceManager } from '../core/ResourceManager';
import { Vec3 } from 'cc';
import { UserMeManager } from '../core/UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('IconItemUIHelper')
export class IconItemUIHelper extends Component {
    @property([SpriteFrame]) foodIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) cardIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) moneyIcons: SpriteFrame[] = [];

    private foodIconMap: Record<string, SpriteFrame> = {};
    private cardIconMap: Record<string, SpriteFrame> = {};
    private moneyIconMap: Record<string, SpriteFrame> = {};

    @property(Sprite) icon: Sprite;

    onLoad() {
        this.initMaps();
    }

    private initMaps() {
        if (this.foodIcons.length >= 3) {
            this.foodIconMap = {
                normal: this.foodIcons[0],
                premium: this.foodIcons[1],
                ultrapremium: this.foodIcons[2]
            };
        }
        if (this.cardIcons.length >= 3) {
            this.cardIconMap = {
                rarity_card_rare: this.cardIcons[0],
                rarity_card_epic: this.cardIcons[1],
                rarity_card_legendary: this.cardIcons[2]
            };
        }
        if (this.moneyIcons.length >= 2) {
            this.moneyIconMap = {
                gold: this.moneyIcons[0],
                diamond: this.moneyIcons[1]
            };
        }
    }

    private ensureMaps() {
        if (Object.keys(this.foodIconMap).length === 0 && this.foodIcons.length <= 3) {
            this.initMaps();
        }
        if (Object.keys(this.cardIconMap).length === 0 && this.cardIcons.length <= 3) {
            this.initMaps();
        }
        if (Object.keys(this.moneyIconMap).length === 0 && this.moneyIcons.length <= 2) {
            this.initMaps();
        }
    }

    private async applyIcon(food?: Food, item?: Item, rewardType?: RewardType) {
        this.ensureMaps();
        if (!this.icon) return;

        if (rewardType === RewardType.GOLD || rewardType === RewardType.DIAMOND) {
            this.icon.spriteFrame = this.moneyIconMap[rewardType] ?? null;
            return;
        }

        if (food) {
            const normalizedType = food.type.replace(/-/g, "");
            this.icon.spriteFrame = this.foodIconMap[normalizedType] ?? null;
            return;
        }

        if (item) {
            if (item.type === ItemType.PET_CARD) {
                this.icon.spriteFrame = this.cardIconMap[item.item_code] ?? null;
            } else {
                const skinLocalData = this.getLocalData(item);
                this.icon.spriteFrame = await this.getSkinSprite(skinLocalData, item);
            }
            return;
        }
    }

    public async setIconByReward(reward: RewardItemDTO) {
        await this.applyIcon(reward.food, reward.item, reward.type);
    }

    public async setIconByInventory(inventory: InventoryDTO) {
        await this.applyIcon(inventory.food, inventory.item, inventory.inventory_type as any);
    }

    public async setIconByItem(item: Item) {
        await this.applyIcon(null, item, null);
    }

    public async setIconByFood(food: Food) {
        await this.applyIcon(food, null, null);
    }

    public async setIconByPurchaseMethod(method: PurchaseMethod) {
        switch (method) {
            case PurchaseMethod.GOLD:
                await this.applyIcon(undefined, undefined, RewardType.GOLD);
                break;
            case PurchaseMethod.DIAMOND:
                await this.applyIcon(undefined, undefined, RewardType.DIAMOND);
                break;
        }
    }

    private getLocalData(item: Item) {
        if (!item) {
            return null;
        }
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    private async getSkinSprite(localData: LocalItemDataConfig, item: Item): Promise<SpriteFrame> {
        if (!localData) return null;

        if (!item.iconSF || item.iconSF.length === 0) {
            item.iconSF = [];
            for (const icon of localData.icons) {
                let spriteFrame = await this.loadSkinIcon(localData.bundleName, icon);
                item.iconSF.push(spriteFrame);
            }
        }
        item.mappingLocalData = localData;
        return item.iconSF[0];
    }

    private async loadSkinIcon(bundleName, bundlePath) {
        let bundleData = {
            bundleName: bundleName,
            bundlePath: bundlePath
        }
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
    }

    public setSizeIconByItemType(itemType: ItemType, sizeSpecial = 0.16, sizeDefault = 0.3) {
        let value: number;

        if (itemType === ItemType.PET_CARD) {
            value = 0.06;
        } else if (itemType === ItemType.HAIR || itemType === ItemType.FACE) {
            value = sizeSpecial; 
        } else {
            value = sizeDefault;
        }

        this.node.scale = new Vec3(value, value, 1);
    }


    public setSizeIconByInventoryType(inventoryType: InventoryType, sizeSpecial = 0.3, sizeDefault = 0.3) {
        const isSpecial = inventoryType === InventoryType.FOOD;
        const value = isSpecial ? sizeSpecial : sizeDefault;
        this.node.scale = new Vec3(value, value, 1);
    }

    public GetIcon():SpriteFrame{
        return this.icon.spriteFrame;
    }
}
