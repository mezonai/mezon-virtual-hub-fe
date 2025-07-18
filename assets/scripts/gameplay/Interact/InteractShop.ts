import { _decorator } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { PopupManager } from '../../PopUp/PopupManager';
import { ShopController } from '../shop/ShopController';
import { InventoryParam } from '../../PopUp/BasePopup';
const { ccclass, property } = _decorator;

@ccclass('InteractShop')
export class InteractShop extends MapItemController {
  
    protected override async interact(playerSessionId: string) {
        if(this.isOpenPopUp) return;
        this.isOpenPopUp = true;

        const param: InventoryParam = {
             onActionClose:()=>{
                this.isOpenPopUp = false;
             }          
        };
        PopupManager.getInstance().openAnimPopup("UIShop", ShopController, param);
        this.handleEndContact(null, null, null);
    }

    protected override canShowPopup(): boolean {
        return true;
    }
}