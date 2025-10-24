import { _decorator, Component, Node, Sprite } from 'cc';
import { Plant } from './Plant';
import { FarmSlotDTO, PlantData } from './EnumPlant';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { FarmController } from './FarmController';

const { ccclass, property } = _decorator;

@ccclass('FarmSlot')
export class FarmSlot extends Component {
  @property(Sprite)landSprite: Sprite = null!;
  @property(Prefab) plantPrefab: Prefab = null!;
  @property(Node)plantSlot: Node = null!;

  private data: FarmSlotDTO = null!;
  private plant: Plant | null = null;

  public setup(data: FarmSlotDTO) {
    this.data = data;
    if (data.currentPlant) {
      this.spawnPlant(data.currentPlant);
    }
  }

  private spawnPlant(plantData: PlantData) {
    const prefab = instantiate(this.plantPrefab);
    prefab.setParent(this.plantSlot);
    const plant = prefab.getComponent(Plant)!;
    plant.setup(plantData);
    this.plant = plant;
  }

  public onClick() {
      if (this.plant) {
          console.log('Ô đất này đã có cây, không thể trồng thêm.');
          //FarmController.instance.openPlantMenu(this.plant);
      } else {
          console.log('Ô đất này chưa có cây,trồng thêm.');
          //FarmController.instance.showSeedMenu(this);
      }
  }

}
