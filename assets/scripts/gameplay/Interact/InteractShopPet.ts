import { _decorator, Component, Node } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { PopupManager } from '../../PopUp/PopupManager';
import { ShopPetController } from '../shop/ShopPetController';
const { ccclass, property } = _decorator;

@ccclass('InteractShopPet')
export class InteractShopPet extends MapItemController {
  
    protected override async interact(playerSessionId: string) {
        PopupManager.getInstance().openAnimPopup("UIShopPet", ShopPetController);
        this.handleEndContact(null, null, null);
    }

    protected override canShowPopup(): boolean {
        return true;
    }
}


