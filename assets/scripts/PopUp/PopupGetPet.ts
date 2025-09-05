import { Sprite } from 'cc';
import { Color } from 'cc';
import { Label } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { AnimalRarity, PetDTO, Species } from '../Model/PetDTO';
import { PopupManager } from './PopupManager';
import { PetsDesignIcon } from '../animal/PetsDesignIcon';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { PetReward } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PopupGetPet')
export class PopupGetPet extends BasePopup {
    @property({ type: Button }) confirmButton: Button = null;
    @property({ type: PetsDesignIcon }) petsDesignIcon: PetsDesignIcon = null;
    @property({ type: Label }) rarityText: Label = null;
    @property({ type: Label }) namePetText: Label = null;
    @property({ type: Sprite }) borderRarity: Sprite = null;
    @property({ type: [Color] }) colorBorderRarity: Color[] = [];
    @property({ type: [Color] }) colorRarityText: Color[] = [];

    public async init(param?: PopupGetPetParam) {
        this.resetPopup();
        if (param == null) {
            await PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.initPopup(param.pet);
        this.confirmButton.addAsyncListener(async () => {
            this.confirmButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
        })
    }

    resetPopup() {
        this.rarityText.string = "";
        this.namePetText.string = "";
        this.borderRarity.node.active = false;
    }

    async initPopup(pet: PetReward) {
        await this.scalePet(pet, 1.5, 0.8, 1.4);
        const indexRarity = pet.rarity == AnimalRarity.COMMON ? 0 : pet.rarity == AnimalRarity.RARE ? 1 : pet.rarity == AnimalRarity.EPIC ? 2 : 3;
        this.borderRarity.color = this.colorBorderRarity[indexRarity];
        this.rarityText.color = this.colorRarityText[indexRarity];
        let rarity = pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1);
        this.rarityText.string = rarity;
        this.namePetText.string = Species[pet.species];
        this.borderRarity.node.active = true;

    }

    public async scalePet(
        pet: PetReward,
        duration: number,
        minScaleFactor: number = 0.8,
        maxScaleFactor: number = 1.2
    ): Promise<void> {
        const originalScale = this.petsDesignIcon.node.scale.clone();
        this.petsDesignIcon.node.setScale(Vec3.ZERO);
        const speciesName = Species[pet.species].charAt(0).toLowerCase() + Species[pet.species].slice(1);
        this.petsDesignIcon.setActivePetByName(speciesName);

        const smallScale = originalScale.clone().multiplyScalar(minScaleFactor);
        const bigScale = originalScale.clone().multiplyScalar(maxScaleFactor);

        return new Promise<void>((resolve) => {
            tween(this.petsDesignIcon.node)
                .to(duration * 0.2, { scale: bigScale }, { easing: "smooth" })
                .to(duration * 0.2, { scale: smallScale }, { easing: "smooth" })
                .to(duration * 0.3, { scale: bigScale }, { easing: "smooth" })
                .to(duration * 0.3, { scale: originalScale }, { easing: "smooth" })
                .call(() => resolve())
                .start();
        });
    }
}

export interface PopupGetPetParam {
    pet: PetReward;
}

