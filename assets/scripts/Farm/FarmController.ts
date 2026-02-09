import { _decorator, Component, Prefab, Node, instantiate, game, Game } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { FarmSlot } from './FarmSlot';
import { WebRequestManager } from '../network/WebRequestManager';
import { FarmDTO, FarmSlotDTO, PlantDataDTO, InteractToSlotPayload, SlotActionType } from './EnumPlant';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { UserMeManager } from '../core/UserMeManager';
import { Constants } from '../utilities/Constants';
import { PopupChooseItem, PopupChooseItemParam } from '../PopUp/PopupChooseItem';
import { InventoryClanType, ItemClanType } from '../Model/Item';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('FarmController')
export class FarmController extends Component {
  @property(Prefab) landSlotPrefab: Prefab = null!;
  @property(Node) landParent1: Node = null!;
  @property(Node) landParent2: Node = null!;
  private landSlots: FarmSlot[] = [];
  static instance: FarmController;

  onDestroy(): void {
     FarmController.instance = null;
     game.off(Game.EVENT_SHOW, this.onAppResume, this);
  }

  onLoad() {
    FarmController.instance = this;
    game.on(Game.EVENT_SHOW, this.onAppResume, this);
  }

  private onAppResume() {
    const now = Date.now();

    const hasUpdatedPlant = this.landSlots.some(slot => {
      const plant = slot.plant;
      if (!plant) return false;
      const elapsed = (now - plant.getLastTickTime()) / 1000;
      return elapsed > 0 && plant.getGrowthTime() > 0;
    });

    if (hasUpdatedPlant) {
      ServerManager.instance.sendUpdateSlot();
    }
  }

  public InitFarmSlot(data: FarmSlotDTO[]) {
    this.landParent1.removeAllChildren();
    this.landParent2.removeAllChildren();
    this.landSlots = [];

    data.forEach((slotData, index) => {
      const slotNode = instantiate(this.landSlotPrefab);
      const slot = slotNode.getComponent(FarmSlot)!;
      if (index < 30) {
        slotNode.setParent(this.landParent1);
      } else {
        slotNode.setParent(this.landParent2);
      }
      slot.setup(slotData);
      this.landSlots.push(slot);
    });
    GameManager.instance.playerHubController.updatePetSlotInfo();
  }

  public async openPlantMenu(slot: FarmSlot) {
    
    if (!UserMeManager.Get.clan || !UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
      PopupManager.getInstance().closeAllPopups();
      Constants.showConfirm("Bạn cần thuộc văn phòng để trồng cây tại nông trại của văn phòng");
      return;
    }

    const inventory = await WebRequestManager.instance.getClanWarehousesAsync(UserMeManager.Get.clan.id, { type: InventoryClanType.PLANT, is_harvested: false});
    if (!inventory || inventory.length === 0) {
      Constants.showConfirm("Hiện tại bạn không có cây nào trong kho để trồng.");
      return;
    }

    const param: PopupChooseItemParam = {
      slotFarm: slot,
      inventory: inventory,
      filterType: ItemClanType.PLANT,
      titlert:'Danh Sách Cây trồng'
    };
    
    await UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    await PopupManager.getInstance().openAnimPopup('PopupChooseItem', PopupChooseItem, param);
  }

  private findSlotById(slotId: string): FarmSlot | null {
    if (!this.landSlots || this.landSlots.length === 0) return null;
    return this.landSlots.find(s => s.data?.id === slotId) ?? null;
  }

  public UpdateSlotAction(slotId: string, type: SlotActionType, isDone: boolean = false, typeTool : string='') {
    const slot = this.findSlotById(slotId);
    if (!slot) return;
    switch (type) {
      case SlotActionType.Water:
        slot.PlayWaterPlantAnim(isDone);
        break;
      case SlotActionType.CatchBug:
        slot.PlayCatchBugAnim(isDone);
        break;
      case SlotActionType.Harvest:
        slot.PlayHarvestAnim(isDone);
        break;
      case SlotActionType.growth_plant:
        slot.PlayGrowthPlantAnim(isDone, typeTool);
        break;
    }
  }

  public UpdateSlot(slotData: FarmSlotDTO) {
    if (!this.landSlots || this.landSlots.length === 0) return;
    const slot = this.findSlotById(slotData.id);
    if (!slot) return;
    slot.setup(slotData);
  }

  public hideAllInteractActions() {
    if (!this.landSlots) return;
    this.landSlots.forEach(slot => {
      if (slot.interactAction) slot.interactAction.active = false;
    });
  }
}
