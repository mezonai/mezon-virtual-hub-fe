import { _decorator, Component, Node, Sprite, Prefab, instantiate, Button, tween } from "cc";
import { Plant } from "./Plant";
import { FarmSlotDTO, PlantData, PlantState, InteractToSlotPayload } from "./EnumPlant";
import { FarmController } from "./FarmController";
import { Constants } from "../utilities/Constants";
import { ServerManager } from "../core/ServerManager";
import { UserMeManager } from "../core/UserMeManager";
import { UserManager } from "../core/UserManager";
import { GameManager } from "../core/GameManager";
import { PopupChooseItem, PopupChooseItemParam } from "../PopUp/PopupChooseItem";
import { WebRequestManager } from "../network/WebRequestManager";
import { InventoryClanType, ToolCategory } from "../Model/Item";
import { PopupManager } from "../PopUp/PopupManager";
import { ItemIconManager } from "../utilities/ItemIconManager";

const { ccclass, property } = _decorator;

@ccclass("FarmSlot")
export class FarmSlot extends Component {
  @property(Prefab) plantPrefab: Prefab = null!;
  @property(Node) plantParent: Node = null!;
  @property(Node) public interactAction: Node = null!;
  @property(Node) waterPlantAnim: Node = null!;
  @property(Node) growthPlantAnim: Node = null!;
  @property(Node) catchBugAnim: Node = null!;
  @property(Node) harvestAnim: Node = null!;

  @property(Button) public waterPlantBtn: Button = null!;
  @property(Button) public catchBugBTn: Button = null!;
  @property(Button) public harvestBtn: Button = null!;

  @property(Button) public harvestUpgradeBtn: Button = null!;
  @property(Button) public inventoryToolBtn: Button = null!;
  @property(Sprite) iconTool: Sprite = null;

  public data: FarmSlotDTO = null!;
  public plant: Plant | null = null;

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

    this.harvestUpgradeBtn.addAsyncListener(async () => {
      this.harvestUpgradeBtn.interactable = false;
      await this.harvestUpgrade();
      this.harvestUpgradeBtn.interactable = true;
    });

    this.inventoryToolBtn.addAsyncListener(async () => {
      this.inventoryToolBtn.interactable = false;
      await this.InventoryTool();
      this.inventoryToolBtn.interactable = true;
    });
  }

  private hasPlant(plantData: PlantData | null | undefined): boolean {
    return !!plantData && plantData.id && plantData.id.trim() !== "";
  }

  public spawnPlant(plantData: PlantData) {
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
    if (!this.checkCanInteract()) return;
    this.resetInteractButtons();
    this.interactAction.active = true;
    this.waterPlantBtn.node.active = need_water && stage !== PlantState.HARVESTABLE;
    this.catchBugBTn.node.active = has_bug && stage !== PlantState.HARVESTABLE;
    this.harvestBtn.node.active = can_harvest;
    this.harvestUpgradeBtn.node.active = can_harvest;
    this.inventoryToolBtn.node.active = !can_harvest;
  }

  private checkCanInteract(): boolean {
    if (!UserMeManager.Get.clan?.id) {
      Constants.showConfirm(
        "Bạn cần thuộc một văn phòng bất kì để có thể tương tác với nông trại tại các văn phòng"
      );
      this.interactAction.active = false;
      return false;
    }
    return true;
  }

  public waterPlant() {
    if (!this.checkCanInteract()) return;
    this.interactAction.active = false;
    if (!this.plant || this.plant.data.stage === PlantState.HARVESTABLE || !this.plant.data.need_water) {
      this.interactAction.active = false;
      return;
    }
    const param: InteractToSlotPayload = {
      farm_slot_id: this.data.id,
    }
    ServerManager.instance.sendWaterPlant(param);
  }

  public catchBug() {
    if (!this.checkCanInteract()) return;
    this.interactAction.active = false;

    if (!this.plant || this.plant.data.stage === PlantState.HARVESTABLE || !this.plant.data.has_bug) {
      this.interactAction.active = false;
      return;
    }
    const param: InteractToSlotPayload = {
      farm_slot_id: this.data.id,
    }
    ServerManager.instance.sendCatchBug(param);
  }

  public harvest() {
    if (!this.checkCanInteract()) return;
    this.interactAction.active = false;
    const param: InteractToSlotPayload = {
      farm_slot_id: this.data.id,
    }

    UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    GameManager.instance.playerHubController.showBlockInteractHarvest(true);
    ServerManager.instance.sendHarvest(param);
  }

  public async harvestUpgrade() {
    if (!this.checkCanInteract()) return;
    this.interactAction.active = false;
    const inventory = await WebRequestManager.instance.getClanWarehousesAsync(UserMeManager.Get.clan.id, { type: InventoryClanType.TOOLS});
    if (!inventory || inventory.length === 0) {
      Constants.showConfirm("Hiện tại bạn không có vật phẩm hỗ trợ để dùng thu hoạch hỗ trợ.");
      return;
    }

    const param: PopupChooseItemParam = {
      slotFarm: this,
      inventory: inventory,
      filterType: ToolCategory.HARVEST,
      titlert:`Công Cụ Hỗ Trợ Thu Hoạch`
    };

    await UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    await PopupManager.getInstance().openAnimPopup('PopupChooseItem', PopupChooseItem, param);
  }

  public async InventoryTool(){
    if (!this.checkCanInteract()) return;
    this.interactAction.active = false;
    const inventory = await WebRequestManager.instance.getClanWarehousesAsync(UserMeManager.Get.clan.id, { type: InventoryClanType.TOOLS});
    if (!inventory || inventory.length === 0) {
      Constants.showConfirm("Hiện tại bạn không có vật phẩm trong kho để sữ dụng");
      return;
    }

    const param: PopupChooseItemParam = {
      slotFarm: this,
      inventory: inventory,
      filterType: ToolCategory.GROWTH,
      titlert:`Công Cụ Hỗ Trợ Trồng Cây`
    };

    await UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    await PopupManager.getInstance().openAnimPopup('PopupChooseItem', PopupChooseItem, param);
  }

  private resetInteractButtons() {
    this.interactAction.active = false;
    this.harvestBtn.node.active = false;
    this.waterPlantBtn.node.active = false;
    this.catchBugBTn.node.active = false;
    this.harvestUpgradeBtn.node.active = false;
    this.inventoryToolBtn.node.active = false;
    this.harvestAnim.active = false;
    this.waterPlantAnim.active = false;
    this.catchBugAnim.active = false;
    this.growthPlantAnim.active = false;
  }

  public PlayHarvestAnim(isShow: boolean) {
    this.harvestAnim.active = isShow;
  }

  public PlayGrowthPlantAnim(isShow: boolean, typeTool: string) {
    this.iconTool.spriteFrame = ItemIconManager.getInstance().getIconToolFarm(typeTool);
    return this.playAnimWithDelay(this.growthPlantAnim, isShow);
  }

  public  PlayWaterPlantAnim(isShow: boolean) {
    return this.playAnimWithDelay(this.waterPlantAnim, isShow);
  }

  public PlayCatchBugAnim(isShow: boolean) {
    return this.playAnimWithDelay(this.catchBugAnim, isShow);
  }

  private playAnimWithDelay(node: Node, isShow: boolean, delaySec: number = 2): Promise<void> {
    return new Promise((resolve) => {
      node.active = isShow;

      if (!isShow) {
        resolve();
        return;
      }

      tween(node)
        .delay(delaySec)
        .call(() => {
          node.active = false;
          resolve();
        })
        .start();
    });
  }
}
