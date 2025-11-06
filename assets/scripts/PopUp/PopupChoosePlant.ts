import { _decorator, Component, Node, Button, instantiate, Prefab } from 'cc';
import { PopupManager } from './PopupManager';
import { ClanWarehouseSlotDTO, PlantDataDTO } from '../Farm/EnumPlant';
import { BasePopup } from './BasePopup';
import { ScrollView } from 'cc';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { UserManager } from '../core/UserManager';
const { ccclass, property } = _decorator;

@ccclass('PopupChoosePlant')
export class PopupChoosePlant extends BasePopup {
    @property(ScrollView) plantListParent: ScrollView = null!;
    @property(Prefab) plantItemPrefab: Prefab = null!;
    @property(Button) closeButton: Button = null!;
    private clanWarehouseSlot: ClanWarehouseSlotDTO[];
    private onChoose: ((plant: PlantDataDTO) => void) | null = null;
    private _clanWarehouseSlot: InventoryClanUIItem[];
    
    public async init(param: PopupChoosePlantParam) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await this.CloseUI();
            this.closeButton.interactable = true;
        });
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
        this.onChoose = param.onChoose;
    }
    
    private async CloseUI() {
       await PopupManager.getInstance().closePopup(this.node.uuid);
       await UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
    }

    public InitItemInventory(data: ClanWarehouseSlotDTO[]) {
        if (!this.node.isValid || !this.plantListParent?.content) return;
        this.plantListParent.content.removeAllChildren();
        this._clanWarehouseSlot = [];

        for (const element of data) {
            if(element.is_harvested) continue;
            const slotNode = instantiate(this.plantItemPrefab);
            const plantItem = slotNode.getComponent(InventoryClanUIItem);
            if (plantItem) {
                plantItem.initPlant(element, async (item) => {
                    if (!item?.clanWarehouseSlotDTO?.plant) return;
                    const plantToSend = item.clanWarehouseSlotDTO.plant;
                    await this.onChoose?.(plantToSend);
                });
            }
            slotNode.setParent(this.plantListParent.content);
            this._clanWarehouseSlot.push(plantItem);
        }
    }
}

export interface PopupChoosePlantParam {
    onChoose?: (plant: PlantDataDTO) => void;
}

