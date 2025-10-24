import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupChoosePlant, PopupChoosePlantParam } from '../PopUp/PopupChoosePlant';
import { FarmSlot } from './FarmSlot';
import { WebRequestManager } from '../network/WebRequestManager';
import { UserMeManager } from '../core/UserMeManager';
import { FarmDTO, FarmSlotDTO } from './EnumPlant';
const { ccclass, property } = _decorator;

@ccclass('FarmController')
export class FarmController extends Component {
  @property(Prefab) landSlotPrefab: Prefab = null!;
  @property(Node) landParent1: Node = null!;
  @property(Node) landParent2: Node = null!;
  private landSlots: FarmSlot[] = [];
  private farm: FarmDTO;
  private isPopupOpen: boolean = false;
  static instance: FarmController;

  onLoad() {
    FarmController.instance = this;
    this.LoadFarmDataFromServer();
  }

  async LoadFarmDataFromServer() {
    // const fakePlant: PlantData = {
    //   id: "1",
    //   name: "Potato",
    //   state: PlantState.SEED,
    //   currentHarvestTime: 60,
    //   needWater: false,
    //   bugInfested: false,
    //   harvestTimes: 600,
    //   hasWager: false,
    //   needWaterRemain: 0,
    //   bugInfestedRemain: 0,
    //   harvestPoint: 1,
    //   buyPrice: 100,
    //   quantityRemain: 3
    // };

    // const data: LandSlotData[] = [];

    // for (let i = 0; i < 30; i++) {
    //   if (i < 2) {
    //     data.push({
    //       id: i,
    //       state: LandState.NORMAL,
    //       plantData: fakePlant
    //     });
    //   } else {
    //     data.push({
    //       id: i,
    //       state: LandState.EMPTY,
    //       plantData: null
    //     });
    //   }
    // }
    this.farm = await WebRequestManager.instance.GetListLandSlotAsync(UserMeManager.Get.clan.id);
    this.loadFromServer(this.farm.slots);
  }

  public loadFromServer(data: FarmSlotDTO[]) {
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

  // public openPlantMenu(plant) {
  //   console.log('Mở menu cây:', plant);
  // }

  // public showSeedMenu(slot: FarmSlot) {
  //   if (this.isPopupOpen) return;
  //   this.isPopupOpen = true;

  //   const plantItems: PlantData[] = [
  //     { id: '1', name: 'Potato', state: PlantState.NONE, currentHarvestTime: 60, needWater: false, bugInfested: false, harvestPoint: 10, buyPrice: 5, quantityRemain: 10 },
  //   ];

  //   const param: PopupChoosePlantParam = {
  //     slotId: slot['data'].id,
  //     plantItems,
  //     onChoose: (plant: PlantData) => {
  //       slot.setup({ ...slot['data'], plantData: plant });
  //       this.isPopupOpen = false;
  //     }
  //   };

  //   PopupManager.getInstance().openAnimPopup('PopupChoosePlant', PopupChoosePlant, param);
  // }


  public getPlantPrefab(id: number) {
    return null!;
  }
}
