import { RichText } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { PetBattleInfo, Species } from '../Model/PetDTO';
import { PetsDesignIcon } from './PetsDesignIcon';
const { ccclass, property } = _decorator;

@ccclass('PetBattleResult')
export class PetBattleResult extends Component {
    @property({ type: PetsDesignIcon }) iconPet: PetsDesignIcon = null;
    @property(Sprite) expFillSprite: Sprite = null;
    @property({ type: RichText }) namePet: RichText = null;
    @property({ type: RichText }) levelPet: RichText = null;

    SetData(pet: PetBattleInfo) {
        this.namePet.string = `<outline color=#222222 width=1> ${pet.name} </outline>`;
        this.levelPet.string = `<outline color=#222222 width=1> LV. ${pet.level}</outline>`;
        this.expFillSprite.fillRange = Math.min(pet.currentExp / pet.totalExp, 1);
        this.iconPet.setActivePetByName(Species[pet.species]);
    }
}


