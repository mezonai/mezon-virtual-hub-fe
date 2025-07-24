import { _decorator, Component, Label, Sprite } from 'cc';
import { PetBattleInfo, PetDTO, PetDTO2 } from '../../Model/PetDTO';
import { SlideObject } from '../../utilities/SlideObject';
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

    public updateHUD(petGotoBattle: PetBattleInfo, id: string) {
        this.nameLabel.string = id;
        this.hpLabel.string = `${petGotoBattle.currentHp}/${petGotoBattle.totalHp}`;
        this.lvlLabel.string = `Lvl ${petGotoBattle.level}`;
        this.expLabel.string = `${petGotoBattle.currentExp}/${petGotoBattle.totalExp}`;
        this.hpFillSprite.fillRange = Math.min(petGotoBattle.currentHp / petGotoBattle.totalHp, 1);
        this.expFillSprite.fillRange = Math.min(petGotoBattle.currentExp / petGotoBattle.totalExp, 1);
    }
}
