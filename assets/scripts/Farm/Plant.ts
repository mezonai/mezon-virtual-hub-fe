import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';
import { PlantData, PlantState } from './EnumPlant';
import Utilities from '../utilities/Utilities';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { Enum } from 'cc';
import { UITransform } from 'cc';
import { Vec2 } from 'cc';
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

  public data: PlantData = null!;
  private growthTime: number = 0;
  private elapsed: number = 0;

  public setup(data: PlantData) {
    if(!data) return;
    this.data = data;
    this.growthTime = data.grow_time_remain || 0;
    this.updateVisual(data.stage);

    this.schedule(this.onTick, 1);
  }

  public async updateVisual(state: PlantState) {
    const plantData = this.allPlantData.find(p => p.plantName === this.data.plant_name);
    if (plantData) {
      const stage = plantData.stages.find(s => s.type === state);
      if (stage?.sprite) {
        this.plantIcon.spriteFrame = stage.sprite;
      }
    }
    this.timeLabel.string = `${Utilities.secondsToHMSPlant(this.growthTime)}`;
    this.timeLabel.node.active = !(this.growthTime <= 0);
    this.updateStatusWater(this.data.need_water);
    this.updateStatusBug(this.data.has_bug);
    this.plantIcon.node.active = true;
  }

  private onTick() {
    if (!this.data) return;
    this.elapsed += 1;
    this.growthTime -= 1;
    if (this.growthTime <= 0) {
      this.updateHarvest();
      return;
    }
    this.updateVisual(this.data.stage);   
  }

  public updateStatusWater(isNeedWater: boolean){
    this.needWaterIcon.active = isNeedWater;
  }

  public updateStatusBug(hasBug: boolean){
    this.bugInfestedIcon.active = hasBug;
  }

  public updateHarvest() {
    this.harvestIcon.active = true;
    this.data.stage = PlantState.HARVESTABLE;
    this.updateVisual(this.data.stage);
    this.unschedule(this.onTick);
    this.needWaterIcon.active = false;
    this.bugInfestedIcon.active = false;
  }

}
