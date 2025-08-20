import { RichText } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { PetBattleInfo, PetDTO, Species } from '../Model/PetDTO';
import { PetsDesignIcon } from './PetsDesignIcon';
import { tween } from 'cc';
import { Constants } from '../utilities/Constants';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PetBattleResult')
export class PetBattleResult extends Component {
    @property({ type: PetsDesignIcon }) iconPet: PetsDesignIcon = null;
    @property(Sprite) expFillSprite: Sprite = null;
    @property({ type: RichText }) namePet: RichText = null;
    @property({ type: RichText }) levelPet: RichText = null;
    @property({ type: RichText }) bonusExp: RichText = null;
    @property({ type: RichText }) currentExp: RichText = null;
    private timeEffect: number = 1;
    private maxLevel: number = 100;
    petsDataBeforeUpdate: PetBattleInfo;
    petsDataAfterUpdate: PetDTO;
    private currentResolve: (() => void) | null = null;
    async SetData(expAdded: number, petsDataBeforeUpdate: PetBattleInfo = null, petsDataAfterUpdate: PetDTO = null): Promise<void> {
        this.namePet.string = `<outline color=#222222 width=1> ${petsDataBeforeUpdate.name} </outline>`;
        this.iconPet.setActivePetByName(Species[petsDataBeforeUpdate.species]);
        this.setLevel(petsDataBeforeUpdate, petsDataAfterUpdate);
        this.bonusExp.string = `+ ${expAdded} Exp`;
        this.bonusExp.node.active = false;
        this.petsDataBeforeUpdate = petsDataBeforeUpdate;
        this.petsDataAfterUpdate = petsDataAfterUpdate;
    }

    setLevel(petsDataBeforeUpdate: PetBattleInfo, petsDataAfterUpdate: PetDTO) {
        const currentLevel = petsDataBeforeUpdate == null ? 1 : petsDataBeforeUpdate.level;
        const currentLevelAfterUpdate = petsDataAfterUpdate == null ? 1 : petsDataAfterUpdate.level;
        if (currentLevel >= currentLevelAfterUpdate)
            this.levelPet.string = `<outline color=#222222 width=1> LV. ${currentLevelAfterUpdate}</outline>`;
        else
            this.levelPet.string = `<outline color=#222222 width=1> LV. ${currentLevel} -> LV. ${currentLevelAfterUpdate}</outline>`;
        this.currentExp.string = petsDataAfterUpdate == null ? ` 0/0 ` : ` ${petsDataAfterUpdate.exp}/${petsDataAfterUpdate.max_exp} `;
        this.expFillSprite.fillRange = currentLevel >= this.maxLevel ? 1 : 0;
        this.levelPet.node.active = currentLevel >= this.maxLevel ? true : false;
        this.currentExp.node.active = currentLevel >= this.maxLevel ? true : false;
    }

    async playAnim(): Promise<void> {
        const currentLevel = this.petsDataBeforeUpdate?.level ?? 1;
        const currentLevelAfterUpdate = this.petsDataAfterUpdate?.level ?? 1;

        if (currentLevel >= this.maxLevel) return;

        await this.playBounceBonusExp();

        const levelUpCount = currentLevelAfterUpdate - currentLevel;

        // Nếu có lên level
        if (levelUpCount > 0) {
            const maxExp = this.petsDataBeforeUpdate.totalExp;

            // Chạy qua từng level up trừ lần cuối
            for (let i = 0; i < levelUpCount; i++) {
                if (i === 0) {
                    // Lần đầu: từ exp hiện tại -> full
                    await this.animExp(this.petsDataBeforeUpdate.totalExp, maxExp);
                } else {
                    // Các lần sau: từ 0 -> full
                    await this.animExp(0, maxExp);
                }
                this.expFillSprite.fillRange = 0;
            }
        }
        // Lần cuối cùng: chạy từ 0 -> exp còn dư ở level mới
        await this.animExp(this.petsDataAfterUpdate.exp, this.petsDataAfterUpdate.max_exp);
        this.levelPet.node.active = true;
        this.currentExp.node.active = true;
    }

    public async animExp(currentExp: number, maxExp: number): Promise<void> {
        const newRatio = currentExp / maxExp;
        // Trả về Promise hoàn tất sau khi tween xong
        return new Promise<void>((resolve) => {
            this.currentResolve = resolve;
            tween(this.expFillSprite)
                .to(this.timeEffect, { fillRange: newRatio })
                .call(() => {
                    this.currentResolve = null;
                    resolve(); // khi tween xong thì resolve
                })
                .start();
        });
    }

    async playBounceBonusExp(duration: number = 0.5): Promise<void> {
        return new Promise<void>((resolve) => {
            this.currentResolve = resolve;
            const originalPos = this.bonusExp.node.position.clone();
            this.bonusExp.node.active = true;
            tween(this.bonusExp.node)
                .to(duration, { position: originalPos.clone().add3f(0, 15, 0) }, { easing: 'quadOut' })
                .to(duration, { position: originalPos }, { easing: 'quadIn' })
                .call(() => {
                    this.currentResolve = null;
                    resolve();
                })
                .start();
        });
    }

    public cancelAnim(): Promise<void> {
        return new Promise<void>((resolve) => {
            // kill toàn bộ tween trên node
            Tween.stopAllByTarget(this.expFillSprite);
            Tween.stopAllByTarget(this.bonusExp.node);

            if (this.currentResolve) {
                // gọi resolve promise cũ (tránh treo await)
                this.currentResolve();
                this.currentResolve = null;
            }

            // resolve luôn vì tween đã stop ngay lập tức
            resolve();
        });
    }
}


