import { _decorator, Component, Label, Sprite } from 'cc';
import { PetDTO } from '../../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('CombatPetHUD')
export class CombatPetHUD extends Component {
    @property(Label) nameLabel: Label = null;
    @property(Label) lvlLabel: Label = null;
    @property(Label) hpLabel: Label = null;
    @property(Label) expLabel: Label = null;

    @property(Sprite) hpFillSprite: Sprite = null;
    @property(Sprite) expFillSprite: Sprite = null;

    public updateHUD(info: PetDTO) {
        if (!info) return;

        this.nameLabel.string = info.name;
        this.hpLabel.string = `${info.currentHp}/${info.maxHp}`;
        this.lvlLabel.string = `Lvl ${info.lvl}`;
        this.expLabel.string = `${info.currentExp}/${info.maxExp}`;
        this.hpFillSprite.fillRange = Math.min(info.currentHp / info.maxHp, 1);
        this.expFillSprite.fillRange = Math.min(info.currentExp / info.maxExp, 1);
    }
}
