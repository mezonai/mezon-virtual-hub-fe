import { _decorator, Component, SpriteFrame, Enum } from 'cc';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { PlantStage, PlantType } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PlantIconStruct')
export class PlantIconStruct {
    @property({ type: PlantType, tooltip: 'Loại cây (dropdown)' })
    plantType: number = PlantType.NONE;

    @property([SpriteFrame])
    stageIcons: SpriteFrame[] = []; // SEED, SPROUT, GROWN, HARVEST
}

@ccclass('IconPlantHelper')
export class IconPlantHelper extends Component {
    @property([PlantIconStruct])
    plantIconList: PlantIconStruct[] = [];

    private plantMap: Record<number, Record<PlantStage, SpriteFrame>> = {} as any;

    @property(IconItemUIHelper)
    iconItemHelper: IconItemUIHelper = null;

    onLoad() {
        this.initPlantMap();
    }

    private initPlantMap() {
        this.plantMap = {} as any;
        for (const p of this.plantIconList) {
            if (!p.stageIcons.length) continue;

            this.plantMap[p.plantType] = {
                [PlantStage.SEED]: p.stageIcons[0] ?? null,
                [PlantStage.SPROUT]: p.stageIcons[1] ?? null,
                [PlantStage.GROWN]: p.stageIcons[2] ?? null,
                [PlantStage.HARVEST]: p.stageIcons[3] ?? null,
            };
        }
    }

    public setPlantIcon(plantType: number, stage: PlantStage) {
        const sf = this.plantMap[plantType]?.[stage];
        if (!sf || !this.iconItemHelper) return;
        this.iconItemHelper.icon.spriteFrame = sf;
    }

    public setRewardPlantIcon(plantType: number) {
        this.setPlantIcon(plantType, PlantStage.GROWN);
    }

    public setInventoryPlantIcon(plantType: number) {
        this.setPlantIcon(plantType, PlantStage.SEED);
    }
}
