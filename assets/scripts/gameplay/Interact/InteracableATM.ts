import { _decorator, Collider2D, IPhysics2DContact, randomRangeInt } from 'cc';
import { MapItemController } from '../MapItem/MapItemController';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { SendActionType, SendTokenPanel } from '../../ui/SendTokenPanel';
import { ServerManager } from '../../core/ServerManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { UserManager } from '../../core/UserManager';
import { UserMeManager } from '../../core/UserMeManager';
import { ResourceManager } from '../../core/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('InteractATM')
export class InteractATM extends MapItemController {
    private readonly invalidGoldResponse = [
        "0đ, thiệc luôn???",
        "Số tiền phải lớn hơn 0",
        "Có tâm nhưng không có tiền"
    ];

    protected override async interact(playerSessionId: string) {
        let panel = UIManager.Instance.showUI(UIID.SendToken);
        let panelComp = panel.getComponent(SendTokenPanel);

        panelComp.setBuyCallback((data) => {
            this.onBuyClick(data);
        });
        
        panelComp.setWithdrawCallback((data) => {
            this.onWithdrawClick(data);
        });

        panelComp.setChangeGoldToDiamondCallback((data) => {
            this.onChangeGoldToDiamondClick(data);
        });
    
        this.handleEndContact(null, null, null);
    }

    private onBuyClick(data) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
        
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME.ON_BUY_TOKEN, data);
        }
    }

    private onWithdrawClick(data: number) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
    
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME.ON_WITHDRAW_TOKEN, data);
        }
    }

      private onChangeGoldToDiamondClick(data: number) {
        if (data <= 0) {
            let chatContent = this.invalidGoldResponse[randomRangeInt(0, this.invalidGoldResponse.length)];
            UserManager.instance.GetMyClientPlayer.zoomBubbleChat(chatContent);
            return;
        }
    
        if (ServerManager.instance) {
            ServerManager.instance.node.emit(EVENT_NAME. ON_CHANGE_GOLD_TO_DIAMOND, data);
        }
    }
   

    protected override canShowPopup(): boolean {
        return true;
    }
}