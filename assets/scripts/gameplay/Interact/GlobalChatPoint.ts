import { _decorator } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { UserMeManager } from '../../core/UserMeManager';
import { UserManager } from '../../core/UserManager';
import { Constants } from '../../utilities/Constants';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../../PopUp/PopupSelectionMini';
import { GlobalChatParam, GlobalChatPopup } from '../../ui/GlobalChatPopup';

const { ccclass, property } = _decorator;

@ccclass('GlobalChatPoint')
export class GlobalChatPoint extends MapItemController {

    protected override async interact(playerSessionId: string) {
        if (this.isOpenPopUp) return;
        this.isOpenPopUp = true;

        if (UserMeManager.Get) {
            if (UserMeManager.playerCoin < Constants.WiSH_FEE) {
                UserManager.instance.GetMyClientPlayer.zoomBubbleChat(`Cần ${Constants.WiSH_FEE} đồng để dùng tính năng này`)
                return;
            }
        }
        else {
            return;
        }

        const param: SelectionMiniParam = {
            title:"Chú ý",
            content: `Bỏ ${Constants.WiSH_FEE} đồng để thực hiện điều ước của bạn?`,
            textButtonLeft: "OK",
            textButtonRight: "Thôi",
            textButtonCenter: "",
            onActionButtonLeft: () => {
                UserMeManager.playerCoin -= Constants.WiSH_FEE;
                this.ShowGlobalChat();
            },
            onActionButtonRight: () => {
                this.isOpenPopUp = false;
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
        this.handleEndContact(null, null, null);
    }

    private async ShowGlobalChat() {
        await this.delay(600);
         const param: GlobalChatParam = {
            onActionClose:()=>{
                this.isOpenPopUp = false;
            },  
        };
        PopupManager.getInstance().openAnimPopup("GlobalChatPanel", GlobalChatPopup, param);
        UIManager.Instance.showUI(UIID.GlobalChat);
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    protected override canShowPopup(): boolean {
        return true;
    }
}