import { _decorator, randomRangeInt } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import {SendTokenPanel, SendTokenParam } from '../../ui/SendTokenPanel';
import { ServerManager } from '../../core/ServerManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { UserManager } from '../../core/UserManager';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupClanInventory, PopupClanInventoryParam } from '../../PopUp/PopupClanInventory';
import { UserMeManager } from '../../core/UserMeManager';
import { Constants } from '../../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('InteractInventoryFarm')
export class InteractInventoryFarm extends MapItemController {
    protected override async interact(playerSessionId: string) {
        if (this.isOpenPopUp) return;
        if (!UserMeManager.Get.clan || !UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
            PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm("Bạn cần thuộc văn phòng để tương tác với cửa hàng của cây trồng");
            return;
        }
        this.isOpenPopUp = true;
        const param: PopupClanInventoryParam =
        {
            clanDetailId: UserMeManager.Get.clan.id,
            onActionClose: () => {
                this.isOpenPopUp = false;
            }
        }
        await PopupManager.getInstance().openAnimPopup("UI_ClanInventory", PopupClanInventory, param);
        this.handleEndContact(null, null, null);
    }

}