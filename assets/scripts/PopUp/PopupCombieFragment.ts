import { _decorator, Component, Node, tween, Vec3, Sprite, Button, UIOpacity } from 'cc';
import { BasePopup } from './BasePopup';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { PopupManager } from './PopupManager';
import { ItemIconManager } from '../utilities/ItemIconManager';
import { PetDTO } from '../Model/PetDTO';
import { RecipeDTO } from '../Model/Item';
import { Constants } from '../utilities/Constants';

const { ccclass, property } = _decorator;

@ccclass('PopupCombieFragment')
export class PopupCombieFragment extends BasePopup {

    @property(Button) closeButton: Button = null!;
    @property(Node) itemCombine: Node[] = [];

    @property(Sprite) openChestSprite: Sprite = null!;
    @property(Sprite) closeChestSprite: Sprite = null!;

    @property(Node) detailNode: Node = null!;
    @property(Sprite) petIconSpriters: Sprite = null!;
    @property(Sprite) petIconSprite: Sprite = null!;
    @property(SlotPetDetail) petDetail: SlotPetDetail = null!;

    private petData!: PetDTO;
    private recipeData!: RecipeDTO;

    public init(param?: PopupCombieFragmentParam) {
        this.closeButton.addAsyncListener(() =>
            PopupManager.getInstance().closePopup(this.node.uuid)
        );

        if (!param) {
            PopupManager.getInstance().closePopup(this.node.uuid, true);
            return;
        }

        this.petData = param.pet;
        this.recipeData = param.recipe;

        this.setupFragmentIcons();
        this.setupPetDetail();
        this.play();
    }

    private setupFragmentIcons() {
        const ingredients = [...this.recipeData.ingredients].sort((a, b) => a.part - b.part);

        ingredients.forEach((ing, index) => {
            const node = this.itemCombine[index];
            if (!node) return;

            const sprite = node.getComponent(Sprite);
            if (!sprite) return;

            sprite.spriteFrame =
                ItemIconManager.getInstance().getIconPetFragment(
                    ing.item.item_code,
                    ing.part
                );
        });

        this.petIconSprite.spriteFrame =
            ItemIconManager.getInstance().getIconPet(
                Constants.parseSpecies(this.recipeData.pet.species.toString())
            );
    }

    private setupPetDetail() {
        this.petDetail.showDetailPanel(this.petData);
    }

    async play() {
        await this.showCombineItems();
        await this.playImpact();
        await this.impactPulse();
        await this.openChest();
        await this.moveResultToCenter();
        await this.showPetIcon();
        this.showPetDetail();
        this.startIdle(this.detailNode);
    }

    private async showCombineItems() {
        for (const item of this.itemCombine) {
            item.active = true;
            item.setScale(Vec3.ZERO);

            await new Promise<void>(resolve => {
                tween(item)
                    .to(0.25, { scale: Vec3.ONE }, { easing: 'backOut' })
                    .call(resolve)
                    .start();
            });
        }

        this.openChestSprite.node.active = true;
        this.closeChestSprite.node.active = false;
    }

    private async playImpact() {
        const target = this.petIconSpriters.node.position.clone();

        for (const item of this.itemCombine) {
            await this.moveFragment(item, target);
        }
    }

    private moveFragment(node: Node, pos: Vec3): Promise<void> {
        return new Promise(resolve => {
            const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
            opacity.opacity = 255;

            tween(node)
                .to(0.18, {
                    position: pos,
                    scale: new Vec3(0.3, 0.3, 0.3),
                    angle: 180,
                }, { easing: 'quadIn' })
                .call(() => {
                    node.active = false;
                    resolve();
                })
                .start();

            tween(opacity)
                .to(0.18, { opacity: 0 })
                .start();
        });
    }

    private impactPulse(): Promise<void> {
        return new Promise(resolve => {
            tween(this.petIconSpriters.node)
                .to(0.08, { scale: new Vec3(1.15, 1.15, 1) })
                .to(0.08, { scale: Vec3.ONE })
                .call(resolve)
                .start();
        });
    }

    private openChest(): Promise<void> {
        return new Promise(resolve => {
            const closeChest = this.closeChestSprite.node;
            const openChest = this.openChestSprite.node;
            const item = this.petIconSpriters.node;

            openChest.active = false;
            closeChest.active = true;
            item.active = false;

            const origin = closeChest.position.clone();

            tween(closeChest)
                .to(0.1, { scale: new Vec3(1.1, 0.9, 1) })
                .to(0.1, { scale: Vec3.ONE })

                .to(0.06, { position: new Vec3(origin.x - 18, origin.y) })
                .to(0.06, { position: new Vec3(origin.x + 18, origin.y) })
                .to(0.06, { position: new Vec3(origin.x - 10, origin.y) })
                .to(0.06, { position: new Vec3(origin.x + 10, origin.y) })
                .to(0.06, { position: origin })

                .delay(0.15)

                .call(() => {
                    closeChest.active = false;
                    openChest.active = true;

                    item.active = true;
                    item.setScale(Vec3.ZERO);
                    item.setPosition(origin);
                })
                .call(() => {
                    const opacity = item.getComponent(UIOpacity) || item.addComponent(UIOpacity);
                    opacity.opacity = 255;

                    tween(item)
                        .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
                        .start();

                    tween(opacity)
                        .to(0.2, { opacity: 0 })
                        .call(resolve)
                        .start();
                })
                .start();
        });
    }

    private moveResultToCenter(): Promise<void> {
        return new Promise(resolve => {

            this.fadeOut(this.openChestSprite.node, 0.25);
            const pet = this.petIconSpriters.node;
            const opacity = pet.getComponent(UIOpacity) || pet.addComponent(UIOpacity);
            opacity.opacity = 255;

            tween(pet)
                .to(1, {
                    position: Vec3.ZERO,
                    scale: new Vec3(1, 1, 1),
                }, { easing: 'quadOut' })
                .delay(1.5)
                .start();

            tween(opacity)
                .delay(1.5)
                .to(0.3, { opacity: 0 })
                .call(() => {
                    pet.active = false;
                    resolve();
                })
                .start();

        });
    }

    private fadeOut(node: Node, duration = 0.25) {
        if (!node.active) return;

        const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
        opacity.opacity = 255;

        tween(opacity)
            .to(duration, { opacity: 0 })
            .call(() => node.active = false)
            .start();
    }


    private showPetIcon(): Promise<void> {
        this.detailNode.active = true;
        this.detailNode.setScale(Vec3.ZERO);
        this.detailNode.setPosition(Vec3.ZERO);

        return new Promise(resolve => {
            tween(this.detailNode)
                .to(0.25, {
                    scale: Vec3.ONE,
                    position: new Vec3(0, 70, 0),
                }, { easing: 'backOut' })
                .call(resolve)
                .start();
        });
    }

    private showPetDetail() {
        this.petDetail.node.active = true;
        this.petDetail.node.setScale(Vec3.ZERO);

        tween(this.petDetail.node)
            .to(0.25, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
    }

    private startIdle(node: Node) {
        const base = node.position.clone();
        tween(node)
            .repeatForever(
                tween()
                    .to(1.2, { position: new Vec3(base.x, base.y + 10) }, { easing: 'sineInOut' })
                    .to(1.2, { position: base }, { easing: 'sineInOut' })
            )
            .start();
    }
}

export interface PopupCombieFragmentParam {
    pet: PetDTO;
    recipe: RecipeDTO;
}
