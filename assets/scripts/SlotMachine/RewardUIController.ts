import { _decorator, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab, SpriteFrame, Tween, tween, Vec2, Vec3 } from 'cc';
import { InventoryDTO, Item, ItemType, RewardItemDTO, RewardType } from '../Model/Item';
import { BubbleRotation } from './BubbleRotation';
import { RewardItem } from './RewardItem';
import { BaseInventoryManager } from '../gameplay/player/inventory/BaseInventoryManager';
import { ResourceManager } from '../core/ResourceManager';
import { UserMeManager } from '../core/UserMeManager';
import { RewardFloatingText } from './RewardFloatingText';
import { GameManager } from '../core/GameManager';
import { AudioType, SoundManager } from '../core/SoundManager';
import { LocalItemDataConfig } from '../Model/LocalItemConfig';
const { ccclass, property } = _decorator;

@ccclass('RewardUIController')
export class RewardUIController extends BaseInventoryManager {
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

    protected start(): void {
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

    protected override getLocalData(reward: RewardItemDTO) {
        const item = reward.item;
        if (!item) {
            return null;
        }
        return ResourceManager.instance.getLocalSkinById(item.id, item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: RewardItemDTO, skinLocalData: LocalItemDataConfig) {
        let uiItem = itemNode.getComponent(RewardItem);
        uiItem.resetData();
        if (item.item.iconSF.length == 0) {
            for (const icon of skinLocalData.icons) {
                let spriteFrame = await this.setItemImage(skinLocalData.bundleName, icon);
                item.item.iconSF.push(spriteFrame);
            }
        }
        uiItem.avatar.spriteFrame = item.item.iconSF[0];
        item.item.mappingLocalData = skinLocalData;
        uiItem.init(item.item);
        const isSpecial  = item.item.type === ItemType.HAIR || item.item.type === ItemType.FACE;
        const scaleValue = isSpecial  ? 0.25 : 0.4;
        uiItem.avatar.node.scale = new Vec3(scaleValue, scaleValue, 0);
        uiItem.setupAvatar();
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
        if (reward?.item) {
            let inventory = new InventoryDTO();
            inventory.item = reward.item;
            GameManager.instance.inventoryController.addItemToInventory(inventory);
        }

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
                            const skinLocalData = this.getLocalData(reward);
                            this.registUIItemData(itemNode, reward, skinLocalData);
                            break;
                        }
                        case RewardType.GOLD:
                        case RewardType.DIAMOND:
                            {
                                this.setupMoneyReward(uiItem, reward.type)
                                uiItem.setupGoldOrDiamond(reward.amount);
                                break;
                            }
                        case RewardType.FOOD: {
                            this.setupFoodReward(uiItem, reward.food.type);
                            uiItem.setupFood(reward.quantity);
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
                    message = `Bạn nhận được +${reward.amount}`;
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
            }

            floatingText.showReward(message, this.isCoin, RewardType.GOLD);
        }
    }

    public override setupFoodReward(uiItem: any, foodType: string) {
        const normalizedType = foodType.replace(/-/g, "");
        const sprite = this.foodIconMap[normalizedType];
        if (sprite) {
            uiItem.iconFood.spriteFrame = sprite;
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