import { SpriteFrame } from 'cc';
import { Button } from 'cc';
import { Sprite } from 'cc';
import { RichText } from 'cc';
import { _decorator, Component, Animation, Node } from 'cc';
import { FoodType, ItemType, RewardType } from '../Model/Item';
import { Color } from 'cc';
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
    @property({ type: Boolean }) isSpecialItem: Boolean = false;

    setData() {
        this.setTitle();
        this.quantity.string = `<outline color=#6D4B29 width=1> ${10} </outline>`;
        this.animatorBorder.node.active = false;
        this.receivedNode.active = false;
        this.clickButton.addAsyncListener(async () => {// them logic neu nhận quà rồi thi ko cho nhấn
            this.clickButton.interactable = false;
            this.clickButton.interactable = true;
        })
    }

    setTitle() {
        const codeColorOutLine = this.isSpecialItem ? "#AC6333" : "#000000";
        this.title.fontColor = this.isSpecialItem ? this.titleColor[0] : this.titleColor[1];
        this.title.string = `<outline color=${codeColorOutLine} width=1> Ngày ${1} </outline>`;
    }

    public playAnimBorder() {
        this.animatorBorder.play();
    }

    getIconValue(itemType: RewardType) {
        const index = itemType == RewardType.DIAMOND ? 1 : 0;
        return this.iconRewards[index];
    }

    getIconFood(foodType: FoodType): SpriteFrame {
        const index = foodType == FoodType.NORMAL ? 0 : foodType == FoodType.PREMIUM ? 1 : 2;
        return this.iconFoodRewards[index];

    }

    getIconPet(species: string): SpriteFrame {
        let found = this.iconPetRewards.find(sf => sf && sf.name === species);
        return found || this.iconPetRewards[0] || null;
    }
}



