import { SpriteFrame } from 'cc';
import { Button } from 'cc';
import { Sprite } from 'cc';
import { RichText } from 'cc';
import { _decorator, Component, Animation, Node } from 'cc';
import { FoodType, ItemType, QuestType, RewardItemDTO, RewardNewbieDTO, RewardType } from '../Model/Item';
import { Color } from 'cc';
import { Species } from '../Model/PetDTO';
import { WebRequestManager } from '../network/WebRequestManager';
import { PopupReward, PopupRewardParam, RewardStatus } from '../PopUp/PopupReward';
import { Constants } from '../utilities/Constants';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupGetPet, PopupGetPetParam } from '../PopUp/PopupGetPet';
const { ccclass, property } = _decorator;

@ccclass('RewardLoginItem')
export class RewardLoginItem extends Component {
    @property({ type: [SpriteFrame] }) iconRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconPetRewards: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) iconFoodRewards: SpriteFrame[] = [];
    @property({ type: [Color] }) titleColor: Color[] = [];
    @property({ type: RichText }) title: RichText = null;
    @property({ type: RichText }) quantity: RichText = null;
    @property({ type: Sprite }) icon: Sprite = null;
    @property({ type: Animation }) animatorBorder: Animation = null;
    @property({ type: Node }) receivedNode: Node = null;
    @property({ type: Button }) clickButton: Button = null;
    setData(rewardNewbie: RewardNewbieDTO, onClaimCallback?: (questId: string) => Promise<boolean>) {
        const reward = rewardNewbie?.rewards[0];
        if (rewardNewbie == null || reward == null) return;
        this.setTitle(rewardNewbie);
        this.setIconReward(reward);
        this.quantity.string = `<outline color=#6D4B29 width=1> ${reward.quantity} </outline>`;
        const canReceive = !rewardNewbie.is_claimed && rewardNewbie.is_available;
        this.animatorBorder.node.active = canReceive;
        if (canReceive) this.playAnimBorder();
        this.receivedNode.active = rewardNewbie.is_claimed;
        this.clickButton.addAsyncListener(async () => {// them logic neu nhận quà rồi thi ko cho nhấn
            const endAt = new Date(rewardNewbie.end_at);
            if (endAt.getTime() <= Date.now()) {
                Constants.showConfirm("Rất tiếc, phần quà này đã hết hạn.", "Chú ý" );
                return;
            }
            if (!canReceive || rewardNewbie.is_claimed) return;
            this.clickButton.interactable = false;
            if (onClaimCallback) {
                const success = await onClaimCallback(rewardNewbie.id);
                if (success) {
                    await this.showPopupReward(reward); // chỉ show khi claim ok
                }
            }
            this.clickButton.interactable = true;
        })
    }

    async showPopupReward(reward: RewardItemDTO) {
        if (reward.type == RewardType.PET) {
            const petReward = reward.pet;
            const param: PopupGetPetParam = {
                pet: petReward
            };
            await PopupManager.getInstance().openPopup('PopupGetPet', PopupGetPet, param);
            return;
        }
        const name = Constants.getNameItem(reward);
        const content = `Chúc mừng bạn nhận thành công ${name}`;
        const paramPopup: PopupRewardParam = {
            status: RewardStatus.GAIN,
            content: content,
            reward: reward
        };
        await PopupManager.getInstance().openPopup('PopupReward', PopupReward, paramPopup);
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

    setTitle(rewardNewbie: RewardNewbieDTO) {
        const codeColorOutLine = rewardNewbie.quest_type == QuestType.NEWBIE_LOGIN_SPECIAL ? "#AC6333" : "#000000";
        this.title.fontColor = rewardNewbie.quest_type == QuestType.NEWBIE_LOGIN_SPECIAL ? this.titleColor[0] : this.titleColor[1];
        this.title.string = `<outline color=${codeColorOutLine} width=1> ${rewardNewbie.name} </outline>`;
    }

    public playAnimBorder() {
        this.animatorBorder.play();
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



