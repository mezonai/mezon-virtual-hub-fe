import { _decorator, Button, Component, Node } from 'cc';
import { UIManager } from './UIManager';
import { MezonAppEvent, MezonWebViewEvent } from '../../webview';
import { APIConfig, EVENT_NAME } from '../network/APIConstant';
import { ServerManager } from './ServerManager';
import { ResourceManager } from './ResourceManager';
import { UserMeManager } from './UserMeManager';
import Utilities from '../utilities/Utilities';
import { AudioType, SoundManager } from './SoundManager';
const { ccclass, property } = _decorator;

@ccclass('ExchangeCoinController')
export class ExchangeCoinController extends Component {
    private static _instance: ExchangeCoinController;
    public static get instance() {
        return ExchangeCoinController._instance;
    }
    public buyAmount: number = -1;

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
            this.postExchangeCoin(amount);
        }, this)
    }
    public postExchangeCoin(amount: number) {
        // amount: s, note: u, receiver_id: x, extra_attribute: w} = y.eventData || {};
        if (window.Mezon) {
            this.buyAmount = amount;
            console.log("post event")
            let sendData = {
                amount: amount,
                note: "Mua Mezon VHub coin",
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
            UIManager.Instance.showNoticePopup("Thông báo", `<color=#FF0000>${Utilities.convertBigNumberToStr(this.buyAmount)} đồng</color> được cộng vào tài khoản`, () => {
                UserMeManager.playerCoin += this.buyAmount;
                this.buyAmount = -1;
            })
        }
    }

    private onSendTokenFail(data) {
        this.buyAmount = -1;
        UIManager.Instance.showNoticePopup(null, "Không thể mua coin");
        SoundManager.instance.playSound(AudioType.NoReward);
    }
}


