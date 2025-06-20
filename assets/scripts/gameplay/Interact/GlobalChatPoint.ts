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

        if (UIManager.Instance.FindUIIndetify(UIID.GlobalChat).node.active) return;
        UIManager.Instance.showYesNoPopup("Chú Ý", `Bỏ ${Constants.WiSH_FEE} đồng để thực hiện điều ước của bạn?`,
            () => {
                UserMeManager.playerCoin -= Constants.WiSH_FEE;
                this.ShowGlobalChat();
            }, null, "OK", "Thôi")
        this.handleEndContact(null, null, null);
    }

    private async ShowGlobalChat() {
        await this.delay(600);
        UIManager.Instance.showUI(UIID.GlobalChat);
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    protected override canShowPopup(): boolean {
        return true;
    }
}