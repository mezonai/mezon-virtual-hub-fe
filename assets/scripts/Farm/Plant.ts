import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';
import { PlantData, PlantState } from './EnumPlant';
import Utilities from '../utilities/Utilities';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlantStageData')
export class PlantStageData {
  @property({ type: SpriteFrame }) sprite: SpriteFrame | null = null;
  @property({ type: Enum(PlantState) }) type: number = 0;
}

@ccclass('PlantData')
export class PlantDataIcon {
  @property({ type: String }) plantName: string = '';
  @property({ type: SpriteFrame }) icon: SpriteFrame | null = null;
  @property({ type: [PlantStageData] }) stages: PlantStageData[] = [];
}

@ccclass('Plant')
export class Plant extends Component {
  @property({ type: [PlantDataIcon] }) allPlantData: PlantDataIcon[] = [];
  @property(Label) timeLabel: Label = null!;
  @property(Node) bugInfestedIcon: Node = null!;
  @property(Node) needWaterIcon: Node = null!;
  @property(Node) harvestIcon: Node = null!;
  @property(Sprite) plantIcon: Sprite = null!;

  private data: PlantData = null!;
  private growthTime: number = 0;
  private elapsed: number = 0;
  private needWaterTimer: number = 0;
  private bugInfestedTimer: number = 0;

  public setup(data: PlantData) {
    this.data = data;
    this.growthTime = data.grow_time || 60;
    this.updateVisual(data.stage);

    this.schedule(this.onTick, 1);
  }

  private updateVisual(state: PlantState) {
    this.timeLabel.string = `${Utilities.secondsToHMSPlant(this.growthTime)}s`;
    this.timeLabel.node.active = !(this.growthTime <= 0);
    const plantData = this.allPlantData.find(p => p.plantName === this.data.plant_name);
    if (plantData) {
      const stage = plantData.stages.find(s => s.type === state);
      if (stage && stage.sprite) {
        const spriteComp = this.plantIcon;
        spriteComp.spriteFrame = stage.sprite;
      }
    }
    this.updateStatus();
  }

  private onTick() {
  //   if (!this.data) return;

  //   this.elapsed += 1;
  //   this.growthTime -= 1;
    
  //   if (this.growthTime <= 0) {
  //     this.data.stage = PlantState.HARVESTABLE;
  //     this.updateVisual(this.data.stage);
  //     this.unschedule(this.onTick);
  //     return;
  //   }
  //   this.updateVisual(this.getStageByTime());
  //   if (this.elapsed % 10 === 0) {
  //     const random = Math.random();
  //     if (random < 0.33) {
  //       this.data.needWater = true;
  //       this.data.bugInfested = false;
  //       this.needWaterTimer = 3;
  //     } else if (random < 0.66) {
  //       this.data.needWater = false;
  //       this.data.bugInfested = true;
  //       this.bugInfestedTimer = 3;
  //     } else {
  //       this.data.needWater = false;
  //       this.data.bugInfested = false;
  //     }
  //   }

  }

  // private getStageByTime(): PlantState {
  //   if (!this.data || !this.data.harvestTimes || !this.data.currentHarvestTime) return PlantState.SEED;

  //   const total = this.data.currentHarvestTime;
  //   const elapsed = total - this.growthTime;
  //   const percent = elapsed / total;
  //   if (percent < 0.25) return PlantState.SEED;
  //   if (percent < 0.5) return PlantState.SMALL;
  //   if (percent < 0.75) return PlantState.GROWING;
  //   return PlantState.GROWING;
  // }

  public updateStatus() {
    if (this.needWaterTimer > 0) {
      this.needWaterIcon.active = true;
      this.needWaterTimer -= 1;
    } else {
      this.needWaterIcon.active = false;
    }

    if (this.bugInfestedTimer > 0) {
      this.bugInfestedIcon.active = true;
      this.bugInfestedTimer -= 1;
    } else {
      this.bugInfestedIcon.active = false;
    }

    this.harvestIcon.active = this.data.stage === PlantState.HARVESTABLE;
  }


  public harvest() {
    if (this.data.stage === PlantState.HARVESTABLE) {
      this.plantIcon.node.active = false;
      tween(this.node)
        .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
        .to(0.2, { scale: new Vec3(0, 0, 0) })
        .call(() => this.node.destroy())
        .start();
    }
  }
}
