import { _decorator, Component, Node, Label, Button } from 'cc';
import { BasePopup } from './BasePopup';
import { PetDTO } from '../Model/PetDTO';
import { RichText } from 'cc';
import { PetsDesignIcon } from '../animal/PetsDesignIcon';

const { ccclass, property } = _decorator;

@ccclass('PopupPetMergeDetail')
export class PopupPetMergeDetail extends BasePopup {
    @property({ type: PetsDesignIcon }) petImage: PetsDesignIcon = null;
    @property(RichText) petNameLabel: RichText = null;
    @property(Button) closeButton: Button = null;
    @property({ type: [Node] }) stars: Node[] = [];

    private _param: PopupPetMergeDetailParam;

    public init(param: PopupPetMergeDetailParam) {
        this._param = param;
        if (param.pet) {
            this.petNameLabel.string = `<outline color=#222222 width=1> ${param.pet.name} </outline>`;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.close();
            this.closeButton.interactable = true;
        });
        this.petImage.setActivePetByName(param.pet.name);
        this.setStar(param.pet.stars);
    }

    public close() {
        this.node.active = false; 
        if (this._param?.onClose) {
            this._param.onClose();
        }
    }

    setStar(valueStar: number) {
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].active = i < valueStar;
        }
    }
}

export interface PopupPetMergeDetailParam {
    pet: PetDTO;
    onClose?: () => void;
}
