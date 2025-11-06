import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupChoosePlant, PopupChoosePlantParam } from '../PopUp/PopupChoosePlant';
import { FarmSlot } from './FarmSlot';
import { WebRequestManager } from '../network/WebRequestManager';
import { FarmDTO, FarmSlotDTO, PlantDataDTO, PlantToSlotPayload } from './EnumPlant';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { UserMeManager } from '../core/UserMeManager';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('FarmController')
export class FarmController extends Component {
  @property(Prefab) landSlotPrefab: Prefab = null!;
  @property(Node) landParent1: Node = null!;
  @property(Node) landParent2: Node = null!;
  private landSlots: FarmSlot[] = [];
  static instance: FarmController;

  onLoad() {
    FarmController.instance = this;
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
  }

  public async openPlantMenu(slot: FarmSlot) {
    await UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();

    if (!UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
      PopupManager.getInstance().closeAllPopups();
      Constants.showConfirm("Bạn cần thuộc một văn phòng để trồng cây tại nông trại của văn phòng");
      return;
    }

    const inventory = await WebRequestManager.instance.getClanWarehousesAsync(UserMeManager.CurrentOffice.idclan);
    if (!inventory || inventory.length === 0) {
      Constants.showConfirm("Hiện tại bạn không có cây nào trong kho để trồng.");
      return;
    }

    const param: PopupChoosePlantParam = {
      onChoose: (plant: PlantDataDTO) => {
        this.plantToslot(slot.data.id, plant.id);
      }
    };

    const popup = await PopupManager.getInstance().openAnimPopup('PopupChoosePlant', PopupChoosePlant, param);
    popup.InitItemInventory(inventory);
  }
  async plantToslot(farm_slot_id: string, plant_id: string) {
    UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
    const param: PlantToSlotPayload = {
      farm_slot_id: farm_slot_id,
      plant_id: plant_id
    }
    ServerManager.instance.sendPlantToSlot(param);
  }

  public UpdateSlot(slotData: FarmSlotDTO) {
    if (!this.landSlots || this.landSlots.length === 0) {
      return;
    }
    const slot = this.landSlots.find(s => s.data?.id === slotData.id);
    if (!slot) {
      return;
    }
    slot.setup(slotData);
  }

  public hideAllInteractActions() {
    if (!this.landSlots) return;
    this.landSlots.forEach(slot => {
      if (slot.interactAction) slot.interactAction.active = false;
    });
  }

}
