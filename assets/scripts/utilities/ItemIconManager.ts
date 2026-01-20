import { SpriteFrame } from 'cc';
import { director } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Food, FoodType, Item, ItemCode, ItemType, RewardItemDTO, RewardType } from '../Model/Item';
import { Species } from '../Model/PetDTO';
import { LocalItemDataConfig } from '../Model/LocalItemConfig';
import { ResourceManager } from '../core/ResourceManager';
import { LoadBundleController } from '../bundle/LoadBundleController';
const { ccclass, property } = _decorator;

@ccclass('ItemIconManager')
export class ItemIconManager extends Component {
    private static instance: ItemIconManager | null = null;
    @property({ type: SpriteFrame }) defaultIcon: SpriteFrame = null;
    @property({ type: [SpriteFrame] }) iconRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconPetRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconFoodRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconCardRewards: SpriteFrame[] = [];
    public static getInstance(): ItemIconManager {
        return this.instance;
    }

    onLoad() {
        if (ItemIconManager.instance) {
            this.destroy(); // Xóa nếu đã có một instance khác
            return;
        }
        ItemIconManager.instance = this;
        director.addPersistRootNode(this.node); // Giữ lại khi đổi Scene
    }

   async getIconReward(reward: RewardItemDTO): Promise<SpriteFrame> {
        switch (reward.type) {
            case RewardType.ITEM:
                return this.getIconItem(reward.item);
            case RewardType.FOOD:
                return this.getIconFood(reward.food.type);
            case RewardType.GOLD:
            case RewardType.DIAMOND:
                return this.getIconValue(reward.type);
            case RewardType.PET:
                return this.getIconPet(reward.pet?.species);
            default:
                return this.defaultIcon;// hoặc icon mặc định nếu có
        }
    }

    async getIconRewardSlot(reward: RewardItemDTO): Promise<SpriteFrame> {
        switch (reward.type_item) {
            case RewardType.ITEM:
                return this.getIconItem(reward.item);
            case RewardType.FOOD:
                return this.getIconFood(reward.food.type);
            case RewardType.GOLD:
            case RewardType.DIAMOND:
                return this.getIconValue(reward.type);
            case RewardType.PET:
                return this.getIconPet(reward.pet?.species);
            default:
                return this.defaultIcon;// hoặc icon mặc định nếu có
        }
    }

    getIconFoodDto(food: Food): SpriteFrame {
        return this.getIconFood(food.type);
    }

    async getIconItemDto(item: Item): Promise<SpriteFrame> {
        if (item == null) return this.defaultIcon;
        if (item.type === ItemType.PET_CARD) {
            const index = item.item_code == ItemCode.RARITY_CARD_RARE ? 0 : item.item_code == ItemCode.RARITY_CARD_EPIC ? 1 : 2;
            return this.iconCardRewards[index];
        }
        else{
            const localData = this.getLocalData(item);
            return this.getSkinSprite(localData, item);
        }
    }

    getIconPurchaseMethod(itemType: RewardType): SpriteFrame {
        return this.getIconValue(itemType);
    }
    
    private getIconValue(itemType: RewardType): SpriteFrame {
        const index = itemType == RewardType.DIAMOND ? 0 : 1;
        return this.iconRewards[index];
    }

    private getIconFood(foodType: FoodType): SpriteFrame {
        const index = foodType == FoodType.NORMAL ? 0 : foodType == FoodType.PREMIUM ? 1 : 2;
        return this.iconFoodRewards[index];

    }

    private getIconPet(species: Species): SpriteFrame {
        const speciesName = Species[species].charAt(0).toLowerCase() + Species[species].slice(1);
        const found = this.iconPetRewards.find(sf => sf && sf.name === speciesName);
        return found || this.iconPetRewards[0];
    }

    private async getIconItem(item: Item): Promise<SpriteFrame> {
        if (item == null) return this.defaultIcon;
        if (item.type !== ItemType.PET_CARD) {
          return await this.getIconItemDto(item);
        } 
        if (item.type === ItemType.PET_CARD) {
            const index = item.item_code == ItemCode.RARITY_CARD_RARE ? 0 : item.item_code == ItemCode.RARITY_CARD_EPIC ? 1 : 2;
            return this.iconCardRewards[index];
        }
        return this.defaultIcon;
    }

    private async loadSkinIcon(bundleName: string, bundlePath: string) {
        const bundleData = { bundleName, bundlePath };
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
    }

    private getLocalData(item: Item) {
        if (!item) return null;
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    private async getSkinSprite(localData: LocalItemDataConfig, item: Item): Promise<SpriteFrame> {
        if (!localData) return null;

        if (!item.iconSF || item.iconSF.length === 0) {
            item.iconSF = [];
            for (const icon of localData.icons) {
                const spriteFrame = await this.loadSkinIcon(localData.bundleName, icon);
                item.iconSF.push(spriteFrame);
            }
        }
        item.mappingLocalData = localData;
        return item.iconSF[0];
    }
}


