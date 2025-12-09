import { _decorator, Component, Node, Button, instantiate, Prefab } from 'cc';
import { PopupManager } from './PopupManager';
import { ClanWarehouseSlotDTO, PlantDataDTO, PlantToSlotPayload } from '../Farm/EnumPlant';
import { BasePopup } from './BasePopup';
import { ScrollView } from 'cc';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { UserManager } from '../core/UserManager';
import { FarmSlot } from '../Farm/FarmSlot';
import { ServerManager } from '../core/ServerManager';
const { ccclass, property } = _decorator;

@ccclass('PopupChoosePlant')
export class PopupChoosePlant extends BasePopup {
    @property(ScrollView) plantListParent: ScrollView = null!;
    @property(Prefab) plantItemPrefab: Prefab = null!;
    @property(Button) closeButton: Button = null!;

    public async init(param: PopupChoosePlantParam) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await this.CloseUI();
            this.closeButton.interactable = true;
        });
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
        this.InitItemInventory(param);
    }

    private async CloseUI() {
        await UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public InitItemInventory(param: PopupChoosePlantParam) {
        if (!this.node.isValid || !this.plantListParent?.content) return;
        this.plantListParent.content.removeAllChildren();
        for (const element of param.cland) {
            if (element.is_harvested) continue;
            const slotNode = instantiate(this.plantItemPrefab);
            const plantItem = slotNode.getComponent(InventoryClanUIItem);
            if (plantItem) {
                plantItem.initPlant(element, () => {
                    if (param.slotFarm == null || param.slotFarm.data == null) return;
                    UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
                    const paramPlantToSlostPayLoad: PlantToSlotPayload = {
                        farm_slot_id: param.slotFarm.data.id,
                        plant_id: element.plant.id,
                    }
                    ServerManager.instance.sendPlantToSlot(paramPlantToSlostPayLoad);
                    this.scheduleOnce(async () => {
                        this.CloseUI();
                    }, 0);
                });
            }
            slotNode.setParent(this.plantListParent.content);
        }
    }
}

export interface PopupChoosePlantParam {
    slotFarm: FarmSlot;
    cland: ClanWarehouseSlotDTO[];
}

