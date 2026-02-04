import { _decorator, Component, Node, tween, Vec3, Sprite, Button } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { Item, RecipeDTO } from '../Model/Item';
import { UITransform } from 'cc';
import { UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PopupExchangeFragment')
export class PopupExchangeFragment extends BasePopup {
    @property(Button) closeButton: Button = null!;
    @property(Node) itemCombine: Node[] = [];
    @property(Node) itemResult: Node = null;

    @property({ type: Sprite }) openChestSprite: Sprite = null;
    @property({ type: Sprite }) closeChestSprite: Sprite = null;

    @property(Node) detailNode: Node = null;
    @property(Sprite) petIconSprite: Sprite = null;

    private fragmentData: Item[] = [];
    private fragmentRewardData: Item;
    private fragmentIconList: Item[] = [];

    public init(param?: PopupExchangeFragmentParam) {
        this.closeButton.addAsyncListener(() =>
            PopupManager.getInstance().closePopup(this.node.uuid)
        );
        if (!param) {
            PopupManager.getInstance().closePopup(this.node.uuid, true);
            return;
        }

        this.fragmentData = param.removed;
        this.fragmentRewardData = param.reward;
        this.fragmentIconList = this.buildFragmentIconList();
        this.setupFragmentIcons();
        this.setupRewardIcon();
        this.playExchangeAnimation();

    }

    private buildFragmentIconList(): Item[] {
        const result: Item[] = [];

        for (const item of this.fragmentData) {
            const count = item.takenQuantity ?? 1;
            for (let i = 0; i < count; i++) {
                result.push(item);
            }
        }

        return result;
    }

    private setupFragmentIcons() {
        this.itemCombine.forEach((node, index) => {
            if (!node) return;

            const item = this.fragmentIconList[index];
            if (!item) {
                node.active = false;
                return;
            }

            const sprite = node.getComponent(Sprite);
            if (!sprite) return;

            sprite.spriteFrame =
                ItemIconManager.getInstance().getIconPetFragment(
                    item.item_code,
                    item.index
                );

            node.active = true;
            node.setScale(Vec3.ONE);
            node.setPosition(Vec3.ZERO);
        });
    }

    private setupRewardIcon() {
        this.petIconSprite.spriteFrame = ItemIconManager.getInstance().getIconPetFragment(
            this.fragmentRewardData.item_code,
            this.fragmentRewardData.index
        );

        this.petIconSprite.node.active = true;
        this.itemResult.setScale(Vec3.ONE);
    }

    private playExchangeAnimation() {
        this.openChestSprite.node.active = true;
        this.closeChestSprite.node.active = false;

        const fragments = this.itemCombine.slice(0, 3);

        fragments.forEach((node, index) => {
            if (!node) return;

            const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
            opacity.opacity = 255;

            tween(node)
                .delay(0.3 + index * 0.1)
                .to(0.45,
                    {
                        worldPosition: this.itemResult.worldPosition,
                        scale: new Vec3(0.2, 0.2, 0.2),
                        angle: 360,
                    },
                    {
                        easing: 'quadIn',
                        onUpdate: (_target, ratio) => {
                            opacity.opacity = 255 * (1 - ratio);
                        }
                    }
                )
                .call(() => node.active = false)
                .start();

        });

        tween(this.node)
            .delay(0.55)
            .call(() => this.closeChest())
            .delay(0.15)
            .call(() => this.shakeChest())
            .delay(0.6)
            .call(() => this.openChestAndReward())
            .start();
    }


    private closeChest() {
        this.openChestSprite.node.active = false;
        this.closeChestSprite.node.active = true;

        const chest = this.closeChestSprite.node;
        chest.setScale(Vec3.ONE);

        tween(chest)
            .to(0.12, { scale: new Vec3(1.1, 0.85, 1) })
            .to(0.08, { scale: Vec3.ONE })
            .start();
    }

    private shakeChest() {
        const chest = this.closeChestSprite.node;
        const origin = chest.position.clone();

        tween(chest)
            .to(0.05, { position: new Vec3(origin.x - 16, origin.y) })
            .to(0.05, { position: new Vec3(origin.x + 16, origin.y) })
            .to(0.05, { position: new Vec3(origin.x - 10, origin.y) })
            .to(0.05, { position: new Vec3(origin.x + 10, origin.y) })
            .to(0.05, { position: origin })
            .start();
    }


    private openChestAndReward() {
        const rewardNode = this.petIconSprite.node;

        this.openChestSprite.node.active = true;
        this.closeChestSprite.node.active = false;

        this.detailNode.active = true;
        rewardNode.active = true;
        rewardNode.setScale(Vec3.ZERO);

        const chestWorldPos = this.itemResult.worldPosition.clone();

        const rewardParent = rewardNode.parent!;
        const localStartPos = rewardParent
            .getComponent(UITransform)!
            .convertToNodeSpaceAR(chestWorldPos);

        rewardNode.setPosition(localStartPos);

        const finalPos = localStartPos.clone();
        finalPos.y += 140;

        tween(rewardNode)
            .to(0.25, {
                scale: Vec3.ONE,
                position: new Vec3(localStartPos.x, localStartPos.y + 40),
            }, { easing: 'backOut' })
            .to(0.35, {
                position: finalPos,
            }, { easing: 'quadOut' })
            .to(0.25, {
                scale: Vec3.ONE,
                position: new Vec3(localStartPos.x, 0),
            }, { easing: 'backOut' })
            .call(() => {
                this.openChestSprite.node.active = false;
                this.detailNode.active = true;
            })
            .start();
    }
}

export interface PopupExchangeFragmentParam {
    removed: Item[];
    reward: Item;
}
