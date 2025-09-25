import { _decorator, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemCombine } from '../gameplay/Upgrade/ItemCombine';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { Label } from 'cc';
import { RichText } from 'cc';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { Button } from 'cc';
import { UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupCombiePet')
export class PopupCombiePet extends BasePopup {
    @property({ type: [ItemCombine] }) itemCombine: ItemCombine[] = [];
    @property({ type: ItemCombine }) itemResult: ItemCombine = null;
    @property({ type: RichText }) titleLabel: RichText = null;
    @property({ type: SlotPetDetail }) petDetail: SlotPetDetail = null;
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Node }) posNew: Node = null;
    @property({ type: Node }) preCombineNode: Node = null;
    resultPet: PopupCombiePetParam;

    public async init(param?: PopupCombiePetParam) {
        if (!param) return;
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            PopupManager.getInstance().closePopup(this.node.uuid, true);
            await this.resultPet.onFinishAnim();
        });
        this.resultPet = param;
        this.setCombinePets(param.listPets);
        this.setResultPet(param.petMerge);
        if (this.preCombineNode) this.preCombineNode.active = true;
        this.playCombineAnimation();
    }

    private setCombinePets(pets: PetDTO[]) {
        this.itemCombine.forEach((slot, i) => {
            const pet = pets[i];
            if (slot && pet) {
                slot.setData(pet, true);
            }
        });
    }

    private setResultPet(resultPet?: PetDTO) {
        if (!resultPet || !this.itemResult) return;
        this.itemResult.setData(resultPet, false);
    }

    playCombineTweenStagger(positionMove: Vec3) {
        this.itemCombine.forEach((item, index) => {
            tween(item.node)
                .delay(index * 0.2)
                .to(0.3, { position: positionMove }, { easing: "quadInOut" })
                .call(() => {
                    if (this.itemResult) {
                        this.itemResult.playImpact();
                    }
                })
                .start();
        });
    }


    onShowPetDetail() {
        this.petDetail.showDetailPanel(this.resultPet.petMerge);
        this.petDetail.node.active = true;
        this.closeButton.node.active = true;
        this.titleLabel.node.active = true;
    }

    private async playCombineAnimation(): Promise<void> {
        const resultNode = this.itemResult?.node;
        if (!resultNode) return;
        await this.showCombineItemsSequentially();
        await this.playCombineItemsImpact(resultNode);
        if (this.preCombineNode) this.preCombineNode.active = false;
        await this.moveToCenterAndScale(resultNode);
        await this.playBaseEffects();
        if (this.resultPet.isSuccess) {
            await this.playSuccessEffects();
        }
        this.updateResultTitle();
        await this.moveToWorldPosition(resultNode, this.posNew.worldPosition);
        this.onShowPetDetail();
        this.itemResult?.stopBlinkEffect(this.resultPet.isSuccess);
    }

    private async playCombineItemsImpact(resultNode: Node): Promise<void> {
        const positionMove = resultNode.position;
        for (const item of this.itemCombine) {
            await this.moveToPosition(item.node, positionMove);
            await this.itemResult?.playImpact();
        }
    }

    private async playBaseEffects(): Promise<void> {
        if (!this.itemResult) return;

        const blinkStar = this.resultPet.isSuccess
            ? this.resultPet.petMerge.stars - 1
            : this.resultPet.petMerge.stars;

        this.itemResult.startBlinkEffect(blinkStar);
        await this.itemResult.playAbsorb();
        this.itemResult.playCircleEffect(true);
    }

    private async playSuccessEffects(): Promise<void> {
        if (!this.itemResult) return;

        await this.itemResult.playExplosive();
        this.itemResult.playStartFly();
    }

    private updateResultTitle(): void {
        if (!this.titleLabel) return;

        this.titleLabel.string = this.resultPet.isSuccess
            ? "<outline color=#33190d width=1>Chúc Mừng Pet Đã Thăng Sao</outline>"
            : "<outline color=#33190d width=1>Tiếc quá!! Pet chưa thể thăng sao lần này</outline>";
    }

    async showCombineItemsSequentially(delayStep: number = 0.5): Promise<void> {
        for (let i = 0; i < this.itemCombine.length; i++) {
            const item = this.itemCombine[i];
            if (!item) continue;
            await item.fadeIn();
            await this.delay(delayStep);
        }
        await this.itemResult?.fadeIn();
    }


    private delay(sec: number): Promise<void> {
        return new Promise((resolve) => this.scheduleOnce(resolve, sec));
    }

    moveToPosition(node: Node, targetPos: Vec3, duration: number = 0.3): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(duration, { position: targetPos }, { easing: 'sineInOut' })
                .call(() => {
                    if (node != null) {
                        node.active = false;
                    }
                    resolve();
                })
                .start();
        });
    }

    moveToCenterAndScale(node: Node, duration: number = 0.4): Promise<void> {
        return new Promise((resolve) => {
            const targetPos = new Vec3(0, 0, 0); // giữa màn hình (theo local của parent)

            tween(node)
                .to(
                    duration,
                    {
                        position: targetPos,
                        scale: new Vec3(2, 2, 2),
                    },
                    { easing: 'quadOut' }
                )
                .call(() => resolve())
                .start();
        });
    }

    moveToWorldPosition(node: Node, targetWorldPos: Vec3, duration: number = 0.3): Promise<void> {
        return new Promise((resolve) => {
            const localPos = node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
            tween(node)
                .to(duration, { position: localPos }, { easing: 'quadOut' })
                .call(() => resolve())
                .start();
        });
    }
}

export interface PopupCombiePetParam {
    listPets: PetDTO[];
    petMerge: PetDTO;
    isSuccess: boolean;
    onFinishAnim?: () => Promise<void>;
}
