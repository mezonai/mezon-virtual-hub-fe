import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { Prefab } from 'cc';
import { ScrollView } from 'cc';
import { InventoryDTO } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PopupClanInventory')
export class PopupClanInventory extends BasePopup {
    @property(Button) closeButton: Button = null;
    @property(Node) noItemPanel: Node = null;
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(ScrollView) svInvenoryOffice: ScrollView = null!;

    public init(param?: any): void {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            await PopupManager.getInstance().closePopup(this.node.uuid);
            this.closeButton.interactable = true;
        });
        this.initList();
    }

    async initList() {
       
    }

    renderOfficeList(officeItems: InventoryDTO[]){
       
    }
}


