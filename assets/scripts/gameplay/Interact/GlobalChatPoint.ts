import { _decorator } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { UserMeManager } from '../../core/UserMeManager';
import { UserManager } from '../../core/UserManager';
import { Constants } from '../../utilities/Constants';

const { ccclass, property } = _decorator;

@ccclass('GlobalChatPoint')
export class GlobalChatPoint extends MapItemController {

    protected override async interact(playerSessionId: string) {
        if (UserMeManager.Get) {
            if (UserMeManager.playerCoin < Constants.WiSH_FEE) {
                UserManager.instance.GetMyClientPlayer.zoomBubbleChat(`Cần ${Constants.WiSH_FEE} đồng để dùng tính năng này`)
                return;
            }
        }
        else {
            return;
        }

        UIManager.Instance.showYesNoPopup("Chú Ý", `Bỏ ${Constants.WiSH_FEE} đồng để thực hiện điều ước của bạn?`,
            () => {
                UIManager.Instance.showUI(UIID.GlobalChat);
            }, null, "OK", "Thôi")
    }

    protected override canShowPopup(): boolean {
        return true;
    }
}