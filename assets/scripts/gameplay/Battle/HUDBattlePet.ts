import { _decorator, Component, Label, Sprite } from 'cc';
import { PetBattleInfo, PetDTO, PetDTO2 } from '../../Model/PetDTO';
import { SlideObject } from '../../utilities/SlideObject';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HUDBattlePet')
export class HUDBattlePet extends Component {
    @property(Label) nameLabel: Label = null;
    @property(Label) lvlLabel: Label = null;
    @property(Label) hpLabel: Label = null;
    @property(Label) expLabel: Label = null;

    @property(Sprite) hpFillSprite: Sprite = null;
    @property(Sprite) expFillSprite: Sprite = null;
    @property({ type: SlideObject }) slide: SlideObject = null;
    private timeEffect: number = 1;
    public updateHUD(petGotoBattle: PetBattleInfo) {
        this.nameLabel.string = petGotoBattle.name;
        this.hpLabel.string = `${petGotoBattle.currentHp}/${petGotoBattle.totalHp}`;
        this.lvlLabel.string = `Lvl ${petGotoBattle.level}`;
        this.expLabel.string = `${petGotoBattle.currentExp}/${petGotoBattle.totalExp}`;
        this.hpFillSprite.fillRange = Math.min(petGotoBattle.currentHp / petGotoBattle.totalHp, 1);
        this.expFillSprite.fillRange = Math.min(petGotoBattle.currentExp / petGotoBattle.totalExp, 1);
    }

    public async heal(healNumber: number, currentHp: number, maxHp: number): Promise<void> {
        // Tính toán máu mới
        currentHp = Math.min(maxHp, currentHp + healNumber);
        const newRatio = currentHp / maxHp;

        // Trả về Promise hoàn tất sau khi tween xong
        return new Promise<void>((resolve) => {
            tween(this.hpFillSprite)
                .to(this.timeEffect, { fillRange: newRatio })
                .call(() => {
                    this.hpLabel.string = `${currentHp}/${maxHp}`;
                    resolve(); // khi tween xong thì resolve
                })
                .start();
        });
    }

    public async takeDamage(damage: number, currentHp: number, maxHp: number): Promise<void> {
        // Tính toán máu mới
        currentHp = Math.max(0, currentHp - damage);
        const newRatio = currentHp / maxHp;

        // Trả về Promise hoàn tất sau khi tween xong
        return new Promise<void>((resolve) => {
            tween(this.hpFillSprite)
                .to(this.timeEffect, { fillRange: newRatio })
                .call(() => {
                    this.hpLabel.string = `${currentHp}/${maxHp}`;
                    resolve(); // khi tween xong thì resolve
                })
                .start();
        });
    }
}
