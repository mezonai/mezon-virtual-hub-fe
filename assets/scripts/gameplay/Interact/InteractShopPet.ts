import { _decorator} from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { PopupManager } from '../../PopUp/PopupManager';
import { InteractShopPetParam, ShopPetController } from '../shop/ShopPetController';
const { ccclass, property } = _decorator;

@ccclass('InteractShopPet')
export class InteractShopPet extends MapItemController {
  
    protected override async interact(playerSessionId: string) {
         if(this.isOpenPopUp) return;
                this.isOpenPopUp = true;
        
                const param: InteractShopPetParam = {
                     onActionClose:()=>{
                        this.isOpenPopUp = false;
                     }          
                };
        PopupManager.getInstance().openAnimPopup("UIShopPet", ShopPetController, param);
        this.handleEndContact(null, null, null);
    }

    protected override canShowPopup(): boolean {
        return true;
    }
}