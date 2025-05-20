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
const { ccclass, property } = _decorator;

@ccclass('ExchangeCoinController')
export class ExchangeCoinController extends Component {
    private static _instance: ExchangeCoinController;
    public static get instance() {
        return ExchangeCoinController._instance;
    }
    public buyAmount: number = -1;
    private currentAction: 'buy' | 'withdraw' | null = null;

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

        ServerManager.instance.node.on(EVENT_NAME.ON_CHANGE_GOLD_TO_DIAMOND, (amount) => {
            this.postChangeGoldToDiamond(amount);
        }, this)
    }

    public postExchangeDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.buyAmount = amount;
            console.log("post event")
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
            UIManager.Instance.showNoticePopup("Chú Ý", "Chỉ khả dụng trên Mezon");
        }
    }

    private onSendTokenSuccess(e, data) {
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        if (this.buyAmount > 0 && UserMeManager.Get) {
            UIManager.Instance.showNoticePopup("Thông báo", `<color=#FF0000>${Utilities.convertBigNumberToStr(this.buyAmount)} Diamond</color> được cộng vào tài khoản`, () => {
                UserMeManager.playerDiamond += this.buyAmount;
                this.buyAmount = -1;
            })
        }
    }

    private onSendTokenFail(data) {
        this.buyAmount = -1;
        UIManager.Instance.showNoticePopup("Chú ý", "Không thể mua Diamond");
        SoundManager.instance.playSound(AudioType.NoReward);
    }

    public postWithdrawDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.buyAmount = amount;
            let sendData = {
                amount: amount,
                note: "Rút Mezon VHub diamond",
            }
            ServerManager.instance.Withdraw(UserManager.instance?.GetMyClientPlayer.myID, sendData);
        }
        else {
            UIManager.Instance.showNoticePopup("Chú Ý", "Chỉ khả dụng trên Mezon");
        }
    }

    public postChangeGoldToDiamond(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.buyAmount = amount;
            let sendData = {
                coinAmount: amount
            }
            ServerManager.instance.exchangeCoinToDiamond(UserManager.instance?.GetMyClientPlayer.myID, sendData);
        }
        else {
            UIManager.Instance.showNoticePopup("Chú Ý", "Chỉ khả dụng trên Mezon");
        }
    }
}