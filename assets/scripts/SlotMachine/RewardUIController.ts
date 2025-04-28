import { _decorator, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab, tween, Vec3 } from 'cc';
import { InventoryDTO, Item, RewardItemDTO, RewardType } from '../Model/Item';
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

    protected start(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                console.log('Pressed SPACE');
                this.ShowTextFly();
                break;

        }
    }

    show(hasReward: boolean, listItem: RewardItemDTO[] = []) {
        console.log(hasReward, listItem)
        this.node.active = true;
        this.hasNoPrize_node.active = !hasReward;

        if (hasReward && listItem.length > 0) {
            this.spawnItem(listItem);
        }
    }

    protected override getLocalData(reward: RewardItemDTO) {
        const item = reward.item;
        if (!item) {
            return null;
        }
        return ResourceManager.instance.getLocalSkinById(UserMeManager.Get.user.gender, item.id, item.type);
    }

    protected override async registUIItemData(itemNode: Node, item: RewardItemDTO, skinLocalData: LocalItemDataConfig) {
        let uiItem = itemNode.getComponent(RewardItem);
        if (item.item.iconSF.length == 0) {
            for (const icon of skinLocalData.icons) {
                let spriteFrame = await this.setItemImage(skinLocalData.bundleName, icon);
                item.item.iconSF.push(spriteFrame);
            }
        }
        uiItem.avatar.spriteFrame = item.item.iconSF[0];
        item.item.mappingLocalData = skinLocalData;
        uiItem.init(item.item);
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


    private readonly MAX_SLOT = 4;

    private spawnItemSequential(index: number, listItem: RewardItemDTO[], bubbleChildren: Node[]) {
        if (index >= Math.min(this.MAX_SLOT, bubbleChildren.length)) return;

        const reward = index < listItem.length ? listItem[index] : undefined;

        if (reward?.item) {
            let inventory = new InventoryDTO();
            console.log(reward)
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
                const uiItem = itemNode.getComponent(RewardItem);
                if (reward) {
                    SoundManager.instance.playSound(AudioType.ReceiveReward);
                    if (reward.type === RewardType.ITEM) {
                        const skinLocalData = this.getLocalData(reward);
                        console.log(this.getLocalData(reward), reward)
                        this.registUIItemData(itemNode, reward, skinLocalData);
                    } else if (reward.type === RewardType.GOLD) {
                        uiItem.setupGold(reward.amount);
                    }
                } else {
                    SoundManager.instance.playSound(AudioType.NoReward);
                    uiItem.setupEmpty?.();
                }
            })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "quadOut" })
            .call(() => {
                if (reward) this.ShowTextFly(reward);
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
                const rewardId = reward.item?.id ?? 'NO_ID';
                const rewardType = reward.type === RewardType.GOLD ? 'GOLD' : 'ITEM';
            
                if (reward.type === RewardType.GOLD) {
                    message = `Bạn nhận được +${reward.amount}`;
                    this.isCoin = true;
                } else if (reward.type === RewardType.ITEM && reward.item) {
                    const itemName = `${reward.item?.name} x ${reward.quantity} `;
                    message = `Bạn nhận được: ${itemName}`;
                    this.isCoin = false;
                }
            }
            
            floatingText.showReward(message, this.isCoin);
        }
    }


    public HideNode() {
        const bubbleChildren = this.bubbleRotation.node.children;
        for (let i = 0; i < bubbleChildren.length; i++) {
            const bubble = bubbleChildren[i];
            const itemNode = bubble.getChildByName("RewardItem");
            if (itemNode) {
                itemNode.active = false;
            }
        }
    }
}