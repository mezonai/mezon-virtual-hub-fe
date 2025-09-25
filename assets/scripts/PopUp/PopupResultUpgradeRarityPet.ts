import { _decorator, Node, tween, Vec3, RichText, Button, UITransform } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemCombine } from '../gameplay/Upgrade/ItemCombine';
import { AnimalRarity, PetDTO } from '../Model/PetDTO';
import { SlotPetDetail } from '../animal/SlotPetDetail';
const { ccclass, property } = _decorator;

@ccclass('PopupResultUpgradeRarityPet')
export class PopupResultUpgradeRarityPet extends BasePopup {
    @property({ type: ItemCombine }) itemResult: ItemCombine = null;
    @property({ type: RichText }) titleLabel: RichText = null;
    @property({ type: SlotPetDetail }) petDetail: SlotPetDetail = null;
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Node }) posNew: Node = null;
    @property({ type: Node }) preCombineNode: Node = null;
    resultPet: PopupUpgradeRarityPetParam;

    public async init(param?: PopupUpgradeRarityPetParam) {
        if (!param) return;
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            PopupManager.getInstance().closePopup(this.node.uuid, true);
            await this.resultPet.onFinishAnim();
        });
        this.resultPet = param;
        this.setResultPet(param.petMerge);
        if (this.preCombineNode) this.preCombineNode.active = true;
        this.playCombineAnimation();
    }

    private async playRarityRandomEffect(resultPet: PetDTO): Promise<void> {
        const START_DELAY = 0.1;   // thời gian nháy ban đầu (giây)
        const ACCEL_TIME = 1;    // sau bao lâu thì bắt đầu tăng delay
        const DELAY_STEP = 0.02;   // tăng delay mỗi lần
        const MAX_DELAY = 0.2;     // delay tối đa (giây)

        return new Promise((resolve) => {
            const rarities = [
                AnimalRarity.COMMON,
                AnimalRarity.RARE,
                AnimalRarity.EPIC,
                AnimalRarity.LEGENDARY,
            ];

            let step = 0;
            let delay = START_DELAY;
            let elapsed = 0;

            const interval = setInterval(() => {
                const rarity = rarities[step % rarities.length];
                this.itemResult.petUIHelper.setBorderTemp(rarity);

                step++;
                elapsed += delay;

                if (elapsed > ACCEL_TIME) {
                    delay += DELAY_STEP;
                }

                if (delay > MAX_DELAY) {
                    clearInterval(interval);
                    this.itemResult.petUIHelper.setBorder(resultPet);
                    resolve();
                }
            }, START_DELAY * 1000);
        });
    }

    private setResultPet(resultPet?: PetDTO) {
        if (!resultPet || !this.itemResult) return;
        this.itemResult.setData(resultPet, false);
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
        if (this.preCombineNode) this.preCombineNode.active = false;
        await this.playRarityRandomEffect(this.resultPet.petMerge);

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
            ? "<outline color=#33190d width=1>Chúc Mừng Pet Đã Thăng độ hiếm</outline>"
            : "<outline color=#33190d width=1>Tiếc quá!! Pet chưa thể thăng độ hiếm lần này</outline>";
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

    moveToWorldPosition(node: Node, targetWorldPos: Vec3, duration: number = 0.5): Promise<void> {
        return new Promise((resolve) => {
            const localPos = node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
            tween(node)
                .to(duration, { position: localPos }, { easing: 'quadOut' })
                .call(() => resolve())
                .start();
        });
    }
}

export interface PopupUpgradeRarityPetParam {
    petMerge: PetDTO;
    isSuccess: boolean;
    onFinishAnim?: () => Promise<void>;
}
