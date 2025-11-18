import { Button } from 'cc';
import { RichText } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { ItemDetailReward } from './ItemDetailReward';
import { RewardItemDTO, RewardNewbieDTO, RewardType } from '../../Model/Item';
import { Constants } from '../../utilities/Constants';
import { PopupGetPet, PopupGetPetParam } from '../../PopUp/PopupGetPet';
import { PopupReward, PopupRewardParam, RewardNewType, RewardStatus } from '../../PopUp/PopupReward';
import { PopupManager } from '../../PopUp/PopupManager';
import { Color } from 'cc';
import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('ItemRewardColor')
export class ItemRewardColor {
    @property({ type: Color }) colorBorder: Color = null;
    @property({ type: Color }) colorBackground: Color = null;
    @property({ type: Color }) colorTitle: Color = null;
    @property({ type: String }) outlineCode: String = "";
}
@ccclass('ItemRewardEvent')
export class ItemRewardEvent extends Component {
    @property({ type: [ItemRewardColor] }) itemRewardColor: ItemRewardColor[] = [];
    @property({ type: [ItemDetailReward] }) itemDetailReward: ItemDetailReward[] = [];
    @property({ type: Animation }) animatorBorder: Animation = null;
    @property({ type: RichText }) title: RichText = null;
    @property({ type: Sprite }) backgroundItem: Sprite = null;
    @property({ type: Sprite }) backgroundBorderItem: Sprite = null;
    @property({ type: Node }) effect: Node = null;
    @property({ type: Node }) receivedNode: Node = null;
    @property({ type: Button }) clickButton: Button = null;
    @property({ type: Boolean }) isShowEffect: Boolean = false;

    setData(rewardNewbie: RewardNewbieDTO, onClaimCallback?: (questId: string) => Promise<boolean>) {
        const rewards = rewardNewbie?.rewards;
        if (rewardNewbie == null || rewards == null) return;
        this.itemDetailReward.forEach((item, i) => {
            const reward = rewards[i];
            const isActive = reward !== undefined;

            item.node.active = isActive;
            if (isActive) item.setDataDetail(reward);
        });
        this.setTitle("Ngày", 1);// chưa có data nên chưa map dc
        const canReceive = !rewardNewbie.is_claimed && rewardNewbie.is_available;
        this.animatorBorder.node.active = canReceive;
        if (canReceive) this.playAnimBorder();
        this.receivedNode.active = rewardNewbie.is_claimed;
        this.clickButton.addAsyncListener(async () => {// them logic neu nhận quà rồi thi ko cho nhấn
            const endAt = new Date(rewardNewbie.end_at);
            if (endAt.getTime() <= Date.now()) {
                Constants.showConfirm("Rất tiếc, phần quà này đã hết hạn.", "Chú ý");
                return;
            }
            if (!canReceive || rewardNewbie.is_claimed) return;
            this.clickButton.interactable = false;
            if (onClaimCallback) {
                const success = await onClaimCallback(rewardNewbie.id);
                if (success) {
                    for (let i = 0; i < rewards.length; i++) {
                        await this.showPopupReward(rewards[i]);
                    }
                }
            }
            this.clickButton.interactable = true;
        })
    }

    setTitle(content: string, index: number) {
        const outlineCode = this.itemRewardColor[index].outlineCode;
        const colorTitle = this.itemRewardColor[index].colorTitle;
        this.title.fontColor = colorTitle;
        this.title.string = `<outline color=#${outlineCode} width=1> ${content} </outline>`;
    }

    setColorBackgroundAndBorder(index: number) {
        const colorBorder = this.itemRewardColor[index].colorBorder;
        const colorBackground = this.itemRewardColor[index].colorBackground;
        this.backgroundBorderItem.color = colorBorder;
        this.backgroundItem.color = colorBackground;
    }

    async showPopupReward(reward: RewardItemDTO) {
        if (reward.type == RewardType.PET) {
            const petReward = reward.pet;
            const param: PopupGetPetParam = {
                pet: petReward
            };
            const popup = await PopupManager.getInstance().openPopup('PopupGetPet', PopupGetPet, param);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
            return;
        }
        const type = Constants.mapRewardType(reward);
        const name = type == RewardNewType.NORMAL_FOOD ? "Thức ăn sơ cấp" : type == RewardNewType.PREMIUM_FOOD ? "Thức ăn cao cấp"
            : type == RewardNewType.ULTRA_PREMIUM_FOOD ? "Thức ăn siêu cao cấp" : type == RewardNewType.GOLD ? "Vàng" : "Kim cương";
        const content = `Chúc mừng bạn nhận thành công ${name}`;
        const paramPopup: PopupRewardParam = {
            rewardType: type,
            quantity: reward.quantity,
            status: RewardStatus.GAIN,
            content: content,
        };
        const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, paramPopup);
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
    }

    public playAnimBorder() {
        this.animatorBorder.play();
    }
}


