import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ElementNameMap, PetDTO } from '../Model/PetDTO';
import { ItemAnimalSlotDrag } from './ItemAnimalSlotDrag';
import { SpriteFrame } from 'cc';
import { RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotPetDetail')
export class SlotPetDetail extends Component {
    @property({ type: Label }) namePet: Label = null;
    @property({ type: Label }) expValue: Label = null;
    @property({ type: Label }) typeValue: Label = null;
    @property({ type: Label }) hpValue: Label = null;
    @property({ type: Label }) attackValue: Label = null;
    @property({ type: Label }) denfenseValue: Label = null;
    @property({ type: Label }) speedValue: Label = null;
    @property({ type: Label }) levelValue: Label = null;

    public showDetailPanel(pet: PetDTO) {
        this.namePet.string = `${pet.name}`;
        this.expValue.string = `${pet.exp} / ${pet.max_exp}`;
        this.hpValue.string = `${pet.hp}`;
        this.attackValue.string = `${pet.attack}`;
        this.denfenseValue.string = `${pet.defense}`;
        this.speedValue.string = ` ${pet.speed}`;
        this.levelValue.string = `${pet.level}`;
        const type = pet?.pet?.type ?? pet?.type;
        if (type) {
            this.typeValue.node.active = true;
            this.typeValue.string = this.getElementName(type);
        } else {
            this.typeValue.node.active = false;
        }
    }

    public clearPetDetail() {
        this.namePet.string = "---";
        this.expValue.string = "---";
        this.typeValue.string = "---";
        this.hpValue.string = "---";
        this.attackValue.string = "---";
        this.denfenseValue.string = "---";
        this.speedValue.string = "---";
        this.levelValue.string = "---";
    }
    
    private getElementName(element: string): string {
        return ElementNameMap[element] ?? "Không rõ";
    }
}