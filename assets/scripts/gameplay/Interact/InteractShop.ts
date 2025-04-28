import { _decorator } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
const { ccclass, property } = _decorator;

@ccclass('InteractShop')
export class InteractShop extends MapItemController {
  
    protected override async interact(playerSessionId: string) {
        UIManager.Instance.showUI(UIID.Shop);
        this.handleEndContact(null, null, null);
    }

    protected override canShowPopup(): boolean {
        return true;
    }
}