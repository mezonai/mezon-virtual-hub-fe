import { _decorator, Component, Node, Sprite, Prefab, instantiate, Button } from "cc";
import { Plant } from "./Plant";
import { FarmSlotDTO, PlantData, PlantState, PlantToSlotPayload } from "./EnumPlant";
import { FarmController } from "./FarmController";
import { Constants } from "../utilities/Constants";
import { ServerManager } from "../core/ServerManager";
import { UserMeManager } from "../core/UserMeManager";

const { ccclass, property } = _decorator;

@ccclass("FarmSlot")
export class FarmSlot extends Component {
  @property(Sprite) landSprite: Sprite = null!;
  @property(Prefab) plantPrefab: Prefab = null!;
  @property(Node) plantParent: Node = null!;
  @property(Node) interactAction: Node = null!;

  @property(Button) waterPlantBtn: Button = null!;
  @property(Button) catchBugBTn: Button = null!;
  @property(Button) harvestBtn: Button = null!;

  public data: FarmSlotDTO = null!;
  public plant: Plant | null = null;

  start(): void {
    this.waterPlantBtn.addAsyncListener(async () => {
      this.waterPlantBtn.interactable = false;
      await this.waterPlant();
      this.waterPlantBtn.interactable = true;
    });
    this.catchBugBTn.addAsyncListener(async () => {
      this.catchBugBTn.interactable = false;
      await this.catchBug();
      this.catchBugBTn.interactable = true;
    });
    this.harvestBtn.addAsyncListener(async () => {
      this.harvestBtn.interactable = false;
      await this.harvest();
      this.harvestBtn.interactable = true;
    });
  }

  public setup(data: FarmSlotDTO) {
    this.data = data;
    if (this.hasPlant(data.currentPlant)) {
      if (this.plant) {
        this.plant.unscheduleAllCallbacks();
        this.plant.setup(data.currentPlant);
      } else {
        this.spawnPlant(data.currentPlant);
      }
    }
  }

  private hasPlant(plantData: PlantData | null | undefined): boolean {
    return !!plantData && plantData.id && plantData.id.trim() !== "";
  }

  private spawnPlant(plantData: PlantData) {
    const prefab = instantiate(this.plantPrefab);
    prefab.setParent(this.plantParent);
    const plant = prefab.getComponent(Plant)!;
    plant.setup(plantData);
    this.plant = plant;
  }

  public onClick() {
    const wasActive = this.interactAction.active;
    FarmController.instance.hideAllInteractActions();
    if (this.plant) {
      if (wasActive) {
        this.interactAction.active = false;
        return;
      }
      const { need_water, has_bug, can_harvest } = this.plant.data;
      if (need_water || has_bug || can_harvest) {
        this.interactAction.active = true;
        this.waterPlantBtn.node.active = need_water && this.data.currentPlant.stage !== PlantState.HARVESTABLE;
        this.catchBugBTn.node.active = has_bug && this.data.currentPlant.stage !== PlantState.HARVESTABLE;
        this.harvestBtn.node.active = can_harvest;
      } else {
        Constants.showConfirm("Ô đất này đã có cây, không thể trồng thêm.");
        this.interactAction.active = false;
      }
    } else {
      FarmController.instance.openPlantMenu(this);
    }
  }

  private canInteractSlot(): boolean {
      return !!UserMeManager.Get.clan?.id;
  }

  public waterPlant() {
    if (!this.canInteractSlot()) {
        Constants.showConfirm("Bạn cần thuộc một văn phòng bất kì để có thể thu hoạch cây trồng tại các văn phòng");
        this.interactAction.active = false;
        return;
    }
    this.interactAction.active = false;
    if (!this.plant || this.plant.data.stage === PlantState.HARVESTABLE || !this.plant.data.need_water) {
      console.log("Cây không thể tưới nữa!");
      this.interactAction.active = false;
      return;
    }
    console.log("Tưới nước cho cây");
    const param: PlantToSlotPayload = {
      farm_slot_id: this.data.id,
    }
    ServerManager.instance.sendWaterPlant(param);
  }

  public catchBug() {
    if (!this.canInteractSlot()) {
        Constants.showConfirm("Bạn cần thuộc một văn phòng bất kì để có thể thu hoạch cây trồng tại các văn phòng");
        this.interactAction.active = false;
        return;
    }
    this.interactAction.active = false;

    if (!this.plant || this.plant.data.stage === PlantState.HARVESTABLE || !this.plant.data.has_bug) {
      console.log("Không có bọ để bắt hoặc cây đã thu hoạch!");
      this.interactAction.active = false;
      return;
    }

    console.log("Bắt bọ cho cây");
    const param: PlantToSlotPayload = {
      farm_slot_id: this.data.id,
    }
    ServerManager.instance.sendCatchBug(param);
  }

  public harvest() {
    if (!this.canInteractSlot()) {
       Constants.showConfirm("Bạn cần thuộc một văn phòng bất kì để có thể thu hoạch cây trồng tại các văn phòng");
        this.interactAction.active = false;
        return;
    }
    this.interactAction.active = false;
    console.log("Thu hoạch cây");
    const param: PlantToSlotPayload = {
      farm_slot_id: this.data.id,
    }
    ServerManager.instance.sendHarvest(param);
  }
}
