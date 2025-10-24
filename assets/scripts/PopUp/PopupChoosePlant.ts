import { _decorator, Component, Node, Button, instantiate, Prefab } from 'cc';
import { PopupManager } from './PopupManager';
import { PlantData } from '../Farm/EnumPlant';
import { PlantInventoryItem } from '../gameplay/player/inventory/PlantInventoryItem';
import { BasePopup } from './BasePopup';
import { ScrollView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupChoosePlant')
export class PopupChoosePlant extends BasePopup {
    @property(ScrollView) plantListParent: ScrollView = null!;
    @property(Prefab) plantItemPrefab: Prefab = null!;
    @property(Button) closeButton: Button = null!;

    private onChoose: ((plant: PlantData) => void) | null = null;

    public async init(param: PopupChoosePlantParam) {
        this.closeButton.node.on('click', () => {
            PopupManager.getInstance().closePopup(this.node.uuid);
        });
        console.log("param.plantItems: ", param.plantItems);
        this.onChoose = param.onChoose;
        this.plantListParent.content.removeAllChildren();

        param.plantItems.forEach(plant => {
            const node = instantiate(this.plantItemPrefab);
            node.setParent(this.plantListParent.content);

            const itemUI = node.getComponent(PlantInventoryItem)!;
            itemUI.initPlant(plant);

            itemUI.onClick = (_uiItem, dataPlant) => {
                this.onChoose?.(dataPlant as PlantData);
                PopupManager.getInstance().closePopup(this.node.uuid);
            };
        });
     
    }

}

export interface PopupChoosePlantParam {
    slotId: number;
    plantItems: PlantData[];
    onChoose: (plant: PlantData) => void;
}

