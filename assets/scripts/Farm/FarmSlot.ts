import { _decorator, Component, Node, Sprite, Prefab, instantiate, Button } from "cc";
import { Plant } from "./Plant";
import { FarmSlotDTO, PlantData, PlantState, PlantToSlotPayload } from "./EnumPlant";
import { FarmController } from "./FarmController";
import { Constants } from "../utilities/Constants";
import { ServerManager } from "../core/ServerManager";
import { UserMeManager } from "../core/UserMeManager";
import { UserManager } from "../core/UserManager";
import { GameManager } from "../core/GameManager";

const { ccclass, property } = _decorator;

@ccclass("FarmSlot")
export class FarmSlot extends Component {
  @property(Sprite) landSprite: Sprite = null!;
  @property(Prefab) plantPrefab: Prefab = null!;
  @property(Node) plantParent: Node = null!;
  @property(Node) interactAction: Node = null!;
  @property(Node) waterPlantAnim: Node = null!;
  @property(Node) catchBugAnim: Node = null!;
  @property(Node) harvestAnim: Node = null!;
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
    else {
      this.plantParent.removeAllChildren();
      this.plant = null;
      this.resetInteractButtons();
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
    FarmController.instance.hideAllInteractActions();

    if (!this.plant) {
      FarmController.instance.openPlantMenu(this);
      return;
    }

    const { need_water, has_bug, can_harvest, stage } = this.plant.data;
    if (this.interactAction.active) {
      this.interactAction.active = false;
      return;
    }

    if (!need_water && !has_bug && !can_harvest) {
      Constants.showConfirm("Ô đất này đã có cây, không thể trồng thêm.");
      this.resetInteractButtons();
      return;
    }

    this.interactAction.active = true;
    this.waterPlantBtn.node.active = need_water && stage !== PlantState.HARVESTABLE;
    this.catchBugBTn.node.active = has_bug && stage !== PlantState.HARVESTABLE;
    this.harvestBtn.node.active = can_harvest;
  }

  private canInteractSlot(): boolean {
    return !!UserMeManager.Get.clan?.id && UserMeManager.CurrentOffice.idclan == UserMeManager.Get.clan?.id;
  }

  public waterPlant() {
    if (!this.canInteractSlot()) {
      Constants.showConfirm("Bạn cần thuộc một văn phòng bất kì để có thể thu hoạch cây trồng tại các văn phòng");
      this.interactAction.active = false;
      return;
    }
    this.interactAction.active = false;
    if (!this.plant || this.plant.data.stage === PlantState.HARVESTABLE || !this.plant.data.need_water) {
      this.interactAction.active = false;
      return;
    }
    this.PlayWaterPlantAnim(true);
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
      this.interactAction.active = false;
      return;
    }
    this.PlayCatchBugAnim(true);
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
    const param: PlantToSlotPayload = {
      farm_slot_id: this.data.id,
    }
   
    UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    GameManager.instance.playerHubController.showBlockInteractHarvest(true);
    ServerManager.instance.sendHarvest(param);
  }

  private resetInteractButtons() {
    this.interactAction.active = false;
    this.harvestBtn.node.active = false;
    this.waterPlantBtn.node.active = false;
    this.catchBugBTn.node.active = false;
    this.harvestAnim.active = false;
    this.waterPlantAnim.active = false;
    this.catchBugAnim.active = false;
  }

  public PlayHarvestAnim(isShow: boolean) {
    this.harvestAnim.active = isShow;
  }

  public PlayWaterPlantAnim(isShow: boolean) {
    this.waterPlantAnim.active = isShow;
  }

  public PlayCatchBugAnim(isShow: boolean) {
    this.catchBugAnim.active = isShow;
  }

}
