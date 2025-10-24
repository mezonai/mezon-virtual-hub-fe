import { _decorator, Component, Node } from 'cc';
import { PlantData } from '../../../Farm/EnumPlant';
import { BaseInventoryUIITem } from './BaseInventoryUIItem';
import { Vec3 } from 'cc';
import { AudioType, SoundManager } from '../../../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('PlantInventoryItem')
export class PlantInventoryItem extends BaseInventoryUIITem {
    public dataPlant: PlantData = null;

    public initPlant(plant: PlantData) {
        this.dataPlant = plant;
        this.init(plant as any);
        this.setPlantIcon(plant);
        this.setPlantScale();
    }

    private setPlantIcon(plant: PlantData) {
        if (!this.iconItemUIHelper) return;
        const sprite = this.iconItemUIHelper.getPlantIcon(plant.name);
        if (sprite) this.iconItemUIHelper.icon.spriteFrame = sprite;
    }

    private setPlantScale() {
        if (!this.iconItemUIHelper) return;
        this.iconItemUIHelper.node.scale = new Vec3(0.2, 0.2, 0.2);
    }

    protected override onItemClick() {
        const now = Date.now();
        if (now - this.lastTriggerTime < 500) return;
        this.lastTriggerTime = now;
        SoundManager.instance.playSound(AudioType.Toggle);
        if (this.onClick && this.dataPlant) {
            this.onClick(this, this.dataPlant);
        }
    }

}



