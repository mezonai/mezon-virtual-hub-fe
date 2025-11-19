import { _decorator, Component, Sprite, SpriteFrame, Vec3 } from 'cc';
import { Food, Item, ItemType, PurchaseMethod, RewardItemDTO, RewardType } from '../Model/Item';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { LocalItemDataConfig } from '../Model/LocalItemConfig';
import { ResourceManager } from '../core/ResourceManager';
import { Species } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('IconItemUIHelper')
export class IconItemUIHelper extends Component {

    @property([SpriteFrame]) foodIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) cardIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) moneyIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) petIcons: SpriteFrame[] = [];
    @property([SpriteFrame]) plantIcons: SpriteFrame[] = [];
    @property(Sprite) icon: Sprite = null!;

    private foodMap: Record<string, SpriteFrame> | null = null;
    private cardMap: Record<string, SpriteFrame> | null = null;
    private moneyMap: Record<string, SpriteFrame> | null = null;
    private petMap: Record<string, SpriteFrame> | null = null;
    private plantMap: Record<string, SpriteFrame> | null = null;

    private initFoodMap() {
        this.foodMap = {};
        if (this.foodIcons.length >= 3) {
            this.foodMap = {
                normal: this.foodIcons[0],
                premium: this.foodIcons[1],
                ultrapremium: this.foodIcons[2]
            };
        }
    }

    private initCardMap() {
        this.cardMap = {};
        if (this.cardIcons.length >= 3) {
            this.cardMap = {
                rarity_card_rare: this.cardIcons[0],
                rarity_card_epic: this.cardIcons[1],
                rarity_card_legendary: this.cardIcons[2]
            };
        }
    }

    private initMoneyMap() {
        this.moneyMap = {};
        if (this.moneyIcons.length >= 2) {
            this.moneyMap = {
                gold: this.moneyIcons[0],
                diamond: this.moneyIcons[1]
            };
        }
    }

    private initPetMap() {
        this.petMap = {};
        for (const sf of this.petIcons) {
            if (sf && sf.name) {
                this.petMap[sf.name.toLowerCase()] = sf;
            }
        }
    }

    private initPlantMap() {
        this.plantMap = {};
        for (const sf of this.plantIcons) {
            if (sf && sf.name) {
                this.plantMap[sf.name] = sf;
            }
        }
    }

    private async applyFoodIcon(food: Food) {
        if (!food) return;
        if (!this.foodMap) this.initFoodMap();
        const normalizedType = food.type.replace(/-/g, "");
        this.icon.spriteFrame = this.foodMap?.[normalizedType] ?? null;
    }

    private async applyCardIcon(item: Item) {
        if (!item || item.type !== ItemType.PET_CARD) return;
        if (!this.cardMap) this.initCardMap();
        this.icon.spriteFrame = this.cardMap?.[item.item_code] ?? null;
    }

    private async applyMoneyIcon(rewardType: RewardType) {
        if (!this.moneyMap) this.initMoneyMap();
        this.icon.spriteFrame = this.moneyMap?.[rewardType] ?? null;
    }

    private async applyPetIcon(species: Species) {
        if (!species) return;
        if (!this.petMap) this.initPetMap();
        this.icon.spriteFrame = this.petMap?.[species] ?? null;
    }

    private async applyPlantIcon(plantName: string) {
        if (!plantName) return;
        if (!this.plantMap) this.initPlantMap();
        this.icon.spriteFrame = this.plantMap?.[plantName] ?? null;
    }

    private async applySkinIcon(item: Item) {
        const localData = this.getLocalData(item);
        this.icon.spriteFrame = await this.getSkinSprite(localData, item);
    }

    public async setIconByFood(food: Food) {
        await this.applyFoodIcon(food);
    }

    public async setIconByItem(item: Item) {
        if (item.type === ItemType.PET_CARD) {
            await this.applyCardIcon(item);
        } else {
            await this.applySkinIcon(item);
        }
    }

    public async setIconPlantByItem(plantName: string) {
        await this.applyPlantIcon(plantName);
    }

    public async setIconByReward(reward: RewardItemDTO) {
        if (reward.type === RewardType.GOLD || reward.type === RewardType.DIAMOND) {
            await this.applyMoneyIcon(reward.type);
        } else if (reward.type === RewardType.PET && reward.pet?.species) {
            await this.applyPetIcon(reward.pet.species);
        } else if (reward.type === RewardType.ITEM && reward.item) {
            await this.setIconByItem(reward.item);
        } else if (reward.type === RewardType.PLANT && reward.item) {
            await this.applyPlantIcon(reward.item.name);
        } else if (reward.type === RewardType.FOOD && reward.food) {
            await this.applyFoodIcon(reward.food);
        }
    }

    public async setIconByPurchaseMethod(method: PurchaseMethod) {
        switch (method) {
            case PurchaseMethod.GOLD:
                await this.applyMoneyIcon(RewardType.GOLD);
                break;
            case PurchaseMethod.DIAMOND:
                await this.applyMoneyIcon(RewardType.DIAMOND);
                break;
        }
    }

    public setSizeIconByItemType(itemType?: ItemType, sizeSpecial = 0.16, sizeDefault = 0.3) {
        let value = sizeDefault;
        if (itemType) {
            if (itemType === ItemType.PET_CARD) value = 0.06;
            else if (itemType === ItemType.HAIR || itemType === ItemType.FACE) value = sizeSpecial;
        }
        this.node.scale = new Vec3(value, value, value);
    }

    public setSizeIconByRewardType(reward: RewardItemDTO, sizeSpecial = 0.16, sizeDefault = 0.3) {
        let value = sizeDefault;
        if (reward.type === RewardType.ITEM && reward.item) {
            if (reward.item.type === ItemType.PET_CARD) value = 0.06;
            else if (reward.item.type === ItemType.HAIR || reward.item.type === ItemType.FACE) value = sizeSpecial;
        } else if (reward.type === RewardType.PET) {
            value = 0.06;
        }
        this.node.scale = new Vec3(value, value, value);
    }

    private async loadSkinIcon(bundleName: string, bundlePath: string) {
        const bundleData = { bundleName, bundlePath };
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
    }

    public GetIcon(): SpriteFrame {
        return this.icon.spriteFrame;
    }
    
    private getLocalData(item: Item) {
        if (!item) return null;
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    public getMoneyIcon(rewardType: RewardType | string): SpriteFrame {
        if (!this.moneyMap) this.initMoneyMap();
        return this.moneyMap?.[rewardType] ?? null;
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

    public getPetIcon(species: string): SpriteFrame {
        if (!this.petMap) this.initPetMap();
        return this.petMap?.[species.toLowerCase()] ?? null;
    }

    public getPlantIcon(plantName: string): SpriteFrame {
        if (!this.plantMap) this.initPlantMap();
        const key = plantName;
        return this.plantMap?.[key] ?? null;
    }
}
