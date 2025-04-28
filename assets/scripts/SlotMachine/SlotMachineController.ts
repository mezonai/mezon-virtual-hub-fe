import { _decorator, AudioClip, AudioSource, Button, Component, director, EventKeyboard, Input, input, instantiate, JsonAsset, KeyCode, Label, math, Node, Prefab, randomRangeInt, resources, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';import { WebRequestManager } from '../network/WebRequestManager';
import { Item, RewardItemDTO, RewardType } from '../Model/Item';
import { EVENT_NAME } from '../network/APIConstant';
import { BubbleRotation } from './BubbleRotation';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { RewardItem } from './RewardItem';
import { LocalItemConfig, LocalItemDataConfig } from '../Model/LocalItemConfig';
import { BaseInventoryManager } from '../gameplay/player/inventory/BaseInventoryManager';
import { ResourceManager } from '../core/ResourceManager';
import { UserMeManager } from '../core/UserMeManager';
import { RewardUIController } from './RewardUIController';
import { UIManager } from '../core/UIManager';
import { RewardFloatingText } from './RewardFloatingText';
import { UserManager } from '../core/UserManager';
import { AudioType, SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('SlotMachineController')
export class SlotMachineController extends Component {
    @property(Node)
    slotMachinePopUp: Node = null;
    @property(Node)
    noticeSpin: Node = null;

    @property(RewardUIController)
    rewardPopUp: RewardUIController = null;
    @property(BubbleRotation)
    bubbleRotation: BubbleRotation = null;
    @property(Node)
    playerHub: Node = null;

    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Button }) spinButton: Button = null;
    @property(Label) spinButtonLabel: Label = null;

    @property(Prefab) rewardTextPrefab: Prefab = null;
    @property(Node) container: Node = null;
    private minusCoin : number = 10;
    private hasSpin: boolean = false;
    
    protected start(): void {
        this.slotMachinePopUp.active = false;
        this.spinButton.node.on('click', this.spinMachine, this);
        this.closeButton.node.on("click", this.endSpinSlotMachine, this);
    }

    endSpinSlotMachine() {
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        this.rewardPopUp.show(false, null);
        this.slotMachinePopUp.active = false;
        this.playerHub.active = true;
    }

    showNoticeSpin(isShow: boolean) {
        this.slotMachinePopUp.active = isShow;
        this.spinButton.interactable = isShow;
        this.spinButtonLabel.string = "Quay";
        this.rewardPopUp.node.active = !isShow;
        this.rewardPopUp.HideNode();
        this.hasSpin = false;
        this.closeButton.node.active = true;
        if(!this.slotMachinePopUp.active) return;
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    }
    

    private onError(error: any) {
        this.bubbleRotation.stopRotation();
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }

    getRewardsSpin(response: any) {
        this.bubbleRotation.stopRotation();
        const rewardsData = response?.data?.rewards ?? [];
        const userGold = response?.data?.user_gold ?? 0;
        const hasReward = Array.isArray(rewardsData) && rewardsData.some(d => d !== null);
        const rewardItems = this.parseRewardItem(rewardsData);
        if (UserMeManager.Get) {
            UserMeManager.playerCoin = userGold;
        }
        this.rewardPopUp.show(hasReward, rewardItems);
        this.spinButton.node.active = true;
        this.spinButton.interactable = true;
        this.spinButtonLabel.string = this.hasSpin ? "Quay tiếp" : "Quay";
        this.closeButton.node.active = true;
    }

    parseRewardItem(response: any): RewardItemDTO[] {
        if (!Array.isArray(response)) return [];

        const validData = response.filter((data: any) => data && typeof data === "object");

        if (validData.length === 0) {
            return [];
        }

        return validData.map((data: any, index: number) => {
            const rewardItem = new RewardItemDTO();
            rewardItem.type = data.type === RewardType.ITEM ? RewardType.ITEM : RewardType.GOLD;

            if (rewardItem.type === RewardType.ITEM) {
                rewardItem.item = this.parseItem(data.item);
                rewardItem.quantity = data.quantity ?? 1;
            } else {
                rewardItem.amount = data.amount ?? 0;
            }

            return rewardItem;
        });
    }


    parseItem(itemData: any): Item {
        const item = new Item();
        item.id = itemData.id;
        item.name = itemData.name;
        item.gender = itemData.gender;
        item.gold = itemData.gold;
        item.type = itemData.type;
        item.is_equippable = itemData.is_equippable;
        item.is_static = itemData.is_static;
        item.iconSF = [];
        item.mappingLocalData = null;

        return item;
    }

    private async spinMachine() {
        if (this.spinButtonLabel) {
            this.rewardPopUp.node.active = false;
            this.rewardPopUp.HideNode();
            this.closeButton.node.active = false;
            this.spinButton.interactable = false;
            this.spinButtonLabel.string = "Xin chờ...";
            this.spinButton.node.active = true;
            this.hasSpin = true;
        }
        WebRequestManager.instance.getRewardsSpin(
            async (response) => {
                try {
                    if (UserMeManager.Get) {
                        UserMeManager.playerCoin -= this.minusCoin;
                        this.showMinusCoinEffect(this.minusCoin);
                    }
                    this.bubbleRotation.startRotation();
                    SoundManager.instance.playSound(AudioType.SlotMachine);
                    await this.delay(3000);
                    this.getRewardsSpin(response);
                } catch (error) {
                    this.onError(error);
                }
            },
            (error) => this.onError(error)
        );
    }
    

    showMinusCoinEffect(coin:Number) {
        const rewardTextNode = instantiate(this.rewardTextPrefab);
        rewardTextNode.setParent(this.container);
    
        const floatingText = rewardTextNode.getComponent(RewardFloatingText);
        if (floatingText) {
            let message = '';
            message = `Mỗi lần quay bạn bị trừ -${coin}`;
            floatingText.showReward(message, true);
        }
    }
    

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async spawnItem(listItem: RewardItemDTO[]) {
        this.rewardPopUp.show(true, listItem);
    }
    
}
