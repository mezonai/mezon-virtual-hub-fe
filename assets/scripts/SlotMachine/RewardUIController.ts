import { _decorator, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
import { ItemType, RewardItemDTO, RewardType } from '../Model/Item';
import { BubbleRotation } from './BubbleRotation';
import { RewardItem } from './RewardItem';
import { RewardFloatingText } from './RewardFloatingText';
import { AudioType, SoundManager } from '../core/SoundManager';
import { BasePopup } from '../PopUp/BasePopup';
import { AnimalRarity, Species } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('RewardUIController')
export class RewardUIController extends BasePopup {
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: Node }) hasNoPrize_node: Node = null;
    @property({ type: BubbleRotation }) bubbleRotation: BubbleRotation = null;
    @property(Prefab) rewardTextPrefab: Prefab = null;
    @property(Node) container: Node = null;

    private spawnCount: number = 0;
    private isCoin: boolean;
    private readonly MAX_SLOT = 3;

    private onAllRewardsShownCallback: () => void = null;

    public setOnRewardsShownCallback(callback: () => void) {
        this.onAllRewardsShownCallback = callback;
    }

    public init(param?: any): void {
        super.init();
        if (!this.bubbleRotation) {
            return;
        }
    }

    show(hasReward: boolean, listItem: RewardItemDTO[] = []) {
        this.node.active = true;
        this.hasNoPrize_node.active = !hasReward;

        if (hasReward && listItem.length > 0) {
            this.spawnItem(listItem);
        }
        else {
            if (this.onAllRewardsShownCallback) {
                this.onAllRewardsShownCallback();
            }
        }
    }

    public spawnItem(listItem: RewardItemDTO[]) {
        const bubbleChildren = this.bubbleRotation.node.children;

        for (let i = listItem.length; i < bubbleChildren.length; i++) {
            const bubble = bubbleChildren[i];
            const itemNode = bubble.getChildByName("RewardItem");
            if (itemNode) {
                itemNode.active = false;
            }
        }

        this.spawnItemSequential(0, listItem, bubbleChildren);
    }

    private spawnItemSequential(index: number, listItem: RewardItemDTO[], bubbleChildren: Node[]) {
        if (index >= Math.min(this.MAX_SLOT, bubbleChildren.length)) return;

        const reward = index < listItem.length ? listItem[index] : undefined;
        const bubble = bubbleChildren[index];
        let itemNode = bubble.getChildByName("RewardItem");
        if (!itemNode) {
            itemNode = instantiate(this.itemPrefab);
            itemNode.name = "RewardItem";
            itemNode.setParent(bubble);
        }

        itemNode.active = true;
        itemNode.scale = new Vec3(0, 0, 0);

        tween(itemNode)
            .delay(0.1 * index)
            .to(0.15, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: "backOut" })
            .call(() => {
                if (reward) {
                    SoundManager.instance.playSound(AudioType.ReceiveReward);
                    const uiItem = itemNode.getComponent(RewardItem);

                    switch (reward.type) {
                        case RewardType.ITEM: {
                                let uiItem = itemNode.getComponent(RewardItem);
                                uiItem.resetData();
                                uiItem.init(reward.item);
                                uiItem.setRewardItem(reward);
                            break;
                        }
                        case RewardType.GOLD:
                        case RewardType.DIAMOND:
                            {
                                uiItem.setRewardItem(reward);
                                break;
                            }
                        case RewardType.FOOD: {
                            uiItem.setRewardItem(reward);
                            break;
                        }
                        case RewardType.PET: {
                            uiItem.setRewardItem(reward);
                            break;
                        }
                        default: {
                            SoundManager.instance.playSound(AudioType.NoReward);
                            uiItem.setupEmpty?.();
                            break;
                        }
                    }
                }

            })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "quadOut" })
            .call(() => {
                if (reward) this.ShowTextFly(reward);
                if (index + 1 >= Math.min(this.MAX_SLOT, bubbleChildren.length)) {
                    if (this.onAllRewardsShownCallback) {
                        this.onAllRewardsShownCallback();
                    }
                }
                this.spawnItemSequential(index + 1, listItem, bubbleChildren);
            })
            .start();
    }

    ShowTextFly(reward?: RewardItemDTO) {
        console.log("reward: ", reward);
        const rewardTextNode = instantiate(this.rewardTextPrefab);
        rewardTextNode.setParent(this.container);

        const offsetY = this.spawnCount * 30;
        rewardTextNode.setPosition(new Vec3(0, offsetY, 0));
        this.spawnCount++;

        const floatingText = rewardTextNode.getComponent(RewardFloatingText);
        if (floatingText) {
            let message = '';
            if (reward) {
                if (reward.type === RewardType.GOLD) {
                    message = `Bạn nhận được +${reward.quantity}`;
                    this.isCoin = true;
                }
                else if (reward.type === RewardType.ITEM && reward.item) {
                    const itemName = `${reward.item?.name} x ${reward.quantity} `;
                    message = `Bạn nhận được ${itemName}`;
                    this.isCoin = false;
                }
                else if (reward.type === RewardType.FOOD && reward.food) {
                    const itemName = `${reward.food?.name} x ${reward.quantity} `;
                    message = `Bạn nhận được ${itemName}`;
                    this.isCoin = false;
                }
                else if (reward.type === RewardType.PET && reward.pet) {
                    const speciesName = Species[reward.pet?.species].charAt(0).toLowerCase() + Species[reward.pet?.species].slice(1);
                    const itemName = `${speciesName} - ${reward.pet?.rarity} x ${reward.quantity} `;
                    message = `Bạn nhận được ${itemName}`;
                    this.isCoin = false;
                }
            }

            floatingText.showReward(message, this.isCoin, RewardType.GOLD);
        }
    }

    public HideNode() {
        const bubbleChildren = this.bubbleRotation?.node?.children;
        for (const bubble of bubbleChildren) {
            const itemNode = bubble?.getChildByName("RewardItem");
            if (itemNode) {
                itemNode.active = false;
            }
        }
    }
}