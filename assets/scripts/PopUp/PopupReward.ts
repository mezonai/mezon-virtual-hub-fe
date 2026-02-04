import { _decorator, Button, Component, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Food, FoodType, FragmentItemDTO, RewardItemDTO, RewardType } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

export enum RewardStatus {
    GAIN = "GAIN",   // Nhận
    LOSS = "LOSS",   // Mất
}

@ccclass('PopupReward')
export class PopupReward extends BasePopup {
    @property(Button) confirmButton: Button = null;
    @property(Label) contentReward: Label = null!;
    @property({ type: RichText }) title: RichText = null;
    @property(Label) quantity: Label = null!;
    @property(Sprite) icon: Sprite = null!;
    public async init(param?: PopupRewardParam) {
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.confirmButton.addAsyncListener(async () => {
            this.confirmButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
        this.showReward(param);
    }

    async showReward(param: PopupRewardParam) {
        this.title.string = param.status === RewardStatus.GAIN ? "Nhận Quà" : "Thông Báo";
        if (param.fragmentDTO != null) {
            this.icon.spriteFrame = ItemIconManager.getInstance().getIconPetFragment(param.fragmentDTO.item.item_code, param.fragmentDTO.index);
            return;
        }
        this.icon.spriteFrame = await ItemIconManager.getInstance().getIconReward(param.reward);

        // 3. Content
        this.contentReward.string = param.content;

        // 4. Quantity text
        const prefix = param.status === RewardStatus.GAIN ? "+" : "-";
        const quantity = param.reward.quantity;
        this.quantity.string = `${prefix}${quantity}`;

        // 5. Update user data
        switch (param.reward.type) {
            case RewardType.ITEM:
                await WebRequestManager.instance.getUserProfileAsync();
                break;
            case RewardType.GOLD:
                UserMeManager.playerCoin += (param.status === RewardStatus.GAIN ? quantity : -quantity);
                break;
            case RewardType.DIAMOND:
                UserMeManager.playerDiamond += (param.status === RewardStatus.GAIN ? quantity : -quantity);
                break;
            case RewardType.FOOD:
                const delta = (param.status === RewardStatus.GAIN ? quantity : -quantity);

                const addSuccess = UserMeManager.AddQuantityFood(param.reward.food.type, delta);
                if (!addSuccess) {
                    WebRequestManager.instance.getUserProfile(
                        () => { },
                        () => { }
                    );
                }
                break;
            default:
                return "";// fallback
        }
    }
}


export interface PopupRewardParam {
    status: RewardStatus;
    content: string,
    reward?: RewardItemDTO,
    fragmentDTO?: FragmentItemDTO,// gán reward hoặc fragmentDTO để set Hình
}