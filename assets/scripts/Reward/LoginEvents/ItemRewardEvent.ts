import { Button } from 'cc';
import { RichText } from 'cc';
import { _decorator, Component, Node, Animation } from 'cc';
import { ItemDetailReward } from './ItemDetailReward';
import { EventType, RewardItemDTO, RewardNewbieDTO, RewardType } from '../../Model/Item';
import { Constants } from '../../utilities/Constants';
import { PopupGetPet, PopupGetPetParam } from '../../PopUp/PopupGetPet';
import { PopupReward, PopupRewardParam, RewardStatus } from '../../PopUp/PopupReward';
import { PopupManager } from '../../PopUp/PopupManager';
import { Color } from 'cc';
import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { LoadingManager } from '../../PopUp/LoadingManager';
const { ccclass, property } = _decorator;
@ccclass('ItemRewardColor')
export class ItemRewardColor {
    @property({ type: Color }) colorBorder: Color = new Color(255, 255, 255, 255);
    @property({ type: Color }) colorBackground: Color = new Color(255, 255, 255, 255);
    @property({ type: Color }) colorTitle: Color = new Color(255, 255, 255, 255);
    @property({ type: String }) outlineCode: string = "";
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
    @property({ type: Boolean }) isShowEffect: boolean = false;

    setData(rewardNewbie: RewardNewbieDTO, eventType: EventType, onClaimCallback?: (questId: string) => Promise<boolean>) {
        const rewards = rewardNewbie?.rewards;

        if (rewardNewbie == null || rewards == null) return;
        this.itemDetailReward.forEach((item, i) => {
            const reward = rewards[i];
            const isActive = reward !== undefined;

            item.node.active = isActive;
            if (isActive) item.setDataDetail(reward);
        });
        this.setTitle(rewardNewbie.name, eventType);
        this.setColorBackgroundAndBorder(eventType)
        const canReceive = !rewardNewbie.is_claimed && rewardNewbie.is_available;
        this.animatorBorder.node.active = canReceive;
        this.effect.active = this.isShowEffect;
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
                LoadingManager.getInstance().openLoading();
                const success = await onClaimCallback(rewardNewbie.id);
                LoadingManager.getInstance().closeLoading();
                if (success) {
                    for (let i = 0; i < rewards.length; i++) {
                        await this.showPopupReward(rewards[i]);
                    }
                }
            }
            this.clickButton.interactable = true;
        })
        this.clickButton.interactable = canReceive;
    }

    setTitle(content: string, eventType: EventType) {
        const index = eventType == EventType.EVENT_LOGIN_PET ? 0 : eventType == EventType.EVENT_LOGIN_PLANT ? 1 : 0;
        const outlineCode = this.itemRewardColor[index].outlineCode;
        const colorTitle = this.itemRewardColor[index].colorTitle;
        this.title.fontColor = colorTitle;
        this.title.string = `<outline color=#${outlineCode} width=1> ${content} </outline>`;
    }

    setColorBackgroundAndBorder(eventType: EventType) {
        const index = eventType == EventType.EVENT_LOGIN_PET ? 0 : eventType == EventType.EVENT_LOGIN_PLANT ? 1 : 0;
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
        const name = Constants.getNameItem(reward);
        const content = `Chúc mừng bạn nhận thành công ${name}`;
        const paramPopup: PopupRewardParam = {
            status: RewardStatus.GAIN,
            content: content,
            reward: reward
        };
        const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, paramPopup);
        await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
    }

    public playAnimBorder() {
        this.animatorBorder.play();
    }
}


