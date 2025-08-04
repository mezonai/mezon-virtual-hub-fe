import { _decorator, Component, Label, Sprite, Node } from 'cc';
import { PetBattleInfo, TypeSkill } from '../../Model/PetDTO';
import { SlideObject } from '../../utilities/SlideObject';
import { tween } from 'cc';
import { Color } from 'cc';
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
    @property({ type: Node }) nodeValue: Node = null;
    @property({ type: [Node] }) nodeChange: Node[] = [];// 1:IncreaseAttack, 2:DecreaseAttack, 3:DecreaseDefense, 4:Healing
    @property({ type: [Color] }) colorValueChange: Color[] = [];
    @property({ type: Label }) valueChange: Label = null;
    private timeEffect: number = 1;
    public updateHUD(petGotoBattle: PetBattleInfo) {
        this.nameLabel.string = petGotoBattle.name;
        this.hpLabel.string = `${petGotoBattle.currentHp}/${petGotoBattle.totalHp}`;
        this.lvlLabel.string = `Lvl ${petGotoBattle.level}`;
        this.expLabel.string = `${petGotoBattle.currentExp}/${petGotoBattle.totalExp}`;
        this.hpFillSprite.fillRange = Math.min(petGotoBattle.currentHp / petGotoBattle.totalHp, 1);
        this.expFillSprite.fillRange = Math.min(petGotoBattle.currentExp / petGotoBattle.totalExp, 1);
        this.nodeValue.active = false;
    }

    async showEffectChangeValue(typeSkill: TypeSkill): Promise<void> {
        const isIncrease = typeSkill === TypeSkill.INCREASE_ATTACK;
        const isDecrease = typeSkill === TypeSkill.DECREASE_ATTACK;
        const isHeal = typeSkill === TypeSkill.HEAL;
        const showValueChange = isIncrease || isDecrease || isHeal;
        this.valueChange.node.active = showValueChange;
        this.nodeChange[0].active = isIncrease;
        this.nodeChange[1].active = isDecrease;
        this.nodeChange[2].active = false;
        this.nodeChange[3].active = isHeal;

        if (!showValueChange) return;
        if (isIncrease || isDecrease) {
            this.valueChange.color = this.colorValueChange[0]; // tăng hoặc giảm => cùng 1 màu
        } else if (isHeal) {
            this.valueChange.color = this.colorValueChange[2]; // hồi máu
        } else {
            this.valueChange.color = this.colorValueChange[1]; // fallback (nếu có)
        }
        await this.playBounceTween(1.2, 0.5);
    }

    async playBounceTween(scaleUp: number = 1.3, duration: number = 0.15): Promise<void> {
        return new Promise<void>((resolve) => {
            const originalPos = this.nodeValue.position.clone();
            this.nodeValue.active = true;

            tween(this.nodeValue)
                .to(duration, { position: originalPos.clone().add3f(0, 50, 0) }, { easing: 'quadOut' })
                .to(duration, { position: originalPos }, { easing: 'quadIn' })
                .call(() => {
                    this.nodeValue.active = false;
                    this.nodeValue.setPosition(originalPos); // reset chắc chắn
                    resolve();
                })
                .start();
        });
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
