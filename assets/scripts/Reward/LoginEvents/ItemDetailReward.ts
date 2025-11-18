import { RichText } from 'cc';
import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { FoodType, RewardItemDTO, RewardType } from '../../Model/Item';
import { Species } from '../../Model/PetDTO';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemDetailReward')
export class ItemDetailReward extends Component {
    @property({ type: [SpriteFrame] }) iconRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconPetRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconFoodRewards: SpriteFrame[] = [];
    @property({ type: RichText }) quantity: RichText = null;
    @property({ type: Sprite }) icon: Sprite = null;

    setDataDetail(reward: RewardItemDTO) {
        this.setIconReward(reward);
        this.quantity.string = `<outline color=#6D4B29 width=1> ${reward.quantity} </outline>`;
    }

    setIconReward(reward: RewardItemDTO) {
        switch (reward.type) {
            case RewardType.FOOD:
                this.icon.spriteFrame = this.getIconFood(reward.food.type);
                break;
            case RewardType.GOLD:
            case RewardType.DIAMOND:
                this.icon.spriteFrame = this.getIconValue(reward.type);
                break;
            case RewardType.PET:
                this.icon.spriteFrame = this.getIconPet(reward.pet?.species);
                break;
            default:
                this.icon.spriteFrame = null; // hoặc icon mặc định nếu có
                break;
        }
    }

    getIconValue(itemType: RewardType): SpriteFrame {
        const index = itemType == RewardType.DIAMOND ? 0 : 1;
        return this.iconRewards[index];
    }

    getIconFood(foodType: FoodType): SpriteFrame {
        const index = foodType == FoodType.NORMAL ? 0 : foodType == FoodType.PREMIUM ? 1 : 2;
        return this.iconFoodRewards[index];

    }

    getIconPet(species: Species): SpriteFrame {
        const speciesName = Species[species].charAt(0).toLowerCase() + Species[species].slice(1);
        const found = this.iconPetRewards.find(sf => sf && sf.name === speciesName);
        return found || this.iconPetRewards[0];
    }

}


