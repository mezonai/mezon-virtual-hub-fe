import { _decorator, Button, Component, Node } from 'cc';
import { UIManager } from './UIManager';
import { MezonAppEvent, MezonWebViewEvent } from '../../webview';
import { APIConfig, EVENT_NAME } from '../network/APIConstant';
import { ServerManager } from './ServerManager';
import { ResourceManager } from './ResourceManager';
import { UserMeManager } from './UserMeManager';
import Utilities from '../utilities/Utilities';
import { AudioType, SoundManager } from './SoundManager';
import { UserManager } from './UserManager';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('ExchangeCoinController')
export class ExchangeCoinController extends Component {
    private static _instance: ExchangeCoinController;
    public static get instance() {
        return ExchangeCoinController._instance;
    }
    public amount: number = -1;
    protected onLoad(): void {
        if (ExchangeCoinController._instance == null) {
            ExchangeCoinController._instance = this;
        }
    }

    protected onDestroy(): void {
        ExchangeCoinController._instance = null;
    }

    protected start(): void {
        ServerManager.instance.node.on(EVENT_NAME.ON_BUY_TOKEN, (amount) => {
            this.postExchangeDiamond(amount);
        }, this)

        ServerManager.instance.node.on(EVENT_NAME.ON_WITHDRAW_TOKEN, (amount) => {
            this.postWithdrawDiamond(amount);
        }, this)

        ServerManager.instance.node.on(EVENT_NAME.ON_CHANGE_DIAMOND_TO_COIN, (amount) => {
            this.postChangeGoldToDiamond(amount);
        }, this)
    }

    public postExchangeDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.amount = amount;
            let sendData = {
                amount: amount,
                note: "Mua Mezon VHub diamond",
                receiver_name: "Virtual-Hub",
                receiver_id: APIConfig.recive_token_botid,
                sender_id: ResourceManager.instance.MezonUserData.user.id,
                sender_name: ResourceManager.instance.MezonUserData.user.display_name,
            }
            window.Mezon.WebView.postEvent(MezonWebViewEvent.SendToken, sendData, null);
        }
        else {
            this.showNoticeIfUsingMezon();
        }
    }

    public onSendTokenSuccess(data) {
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        if (data.amountChange > 0 && UserMeManager.Get) {
            const param: SelectionMiniParam = {
                title: "Thông báo",
                content: `<color=#FF0000>${Utilities.convertBigNumberToStr(data.amountChange)} Diamond</color> được cộng vào tài khoản`,
                textButtonLeft: "",
                textButtonRight: "",
                textButtonCenter: "OK",
                onActionButtonCenter: () => {
                    UserMeManager.playerDiamond = data.userDiamond;
                },
            };
            PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
        }
    }

    public onSendTokenFail(data) {
        Constants.showConfirm(data.reason, "Chú Ý");
        SoundManager.instance.playSound(AudioType.NoReward);
    }

    public postWithdrawDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.amount = amount;
            let sendData = {
                amount: amount,
                note: "Rút Mezon VHub diamond",
            }
            ServerManager.instance.Withdraw(UserManager.instance?.GetMyClientPlayer.myID, sendData);
        }
        else {
            this.showNoticeIfUsingMezon();
        }
    }

    public postChangeGoldToDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.amount = amount;
            let sendData = {
                diamondTransfer: amount
            }
            ServerManager.instance.exchangeCoinToDiamond(UserManager.instance?.GetMyClientPlayer.myID, sendData);
        }
        else {
            this.showNoticeIfUsingMezon();
        }
    }

    private showNoticeIfUsingMezon() {
        Constants.showConfirm("Chỉ khả dụng trên Mezon", "Chú Ý");
    }
}