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
import { ConfirmParam, ConfirmPopup } from '../PopUp/ConfirmPopup';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
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
        if (window.Mezon) {
            window.Mezon.WebView.onEvent(MezonAppEvent.SendTokenSuccess, (e, t) => {
                this.onSendTokenSuccess(e, t);
            });
            window.Mezon.WebView.onEvent(MezonAppEvent.SendTokenFail, this.onSendTokenFail);
        }

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

    private onSendTokenSuccess(e, data) {
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        if (this.amount > 0 && UserMeManager.Get) {
            const param: SelectionMiniParam = {
                title: "Thông báo",
                content: `<color=#FF0000>${Utilities.convertBigNumberToStr(this.amount)} Diamond</color> được cộng vào tài khoản`,
                textButtonLeft: "",
                textButtonRight: "",
                textButtonCenter: "OK",
                onActionButtonCenter: () => {
                    UserMeManager.playerDiamond += this.amount;
                    this.amount = -1;
                },
            };
            PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
        }
    }

    private onSendTokenFail(data) {
        this.amount = -1;
        const param: ConfirmParam = {
            message: "Không thể nạp Diamond",
            title: "Chú Ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
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
        const param: ConfirmParam = {
            message: "Chỉ khả dụng trên Mezon",
            title: "Chú Ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }
}