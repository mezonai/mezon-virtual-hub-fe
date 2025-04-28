import { _decorator, Component, EditBox, Node } from 'cc';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { UIManager } from '../core/UIManager';
import { UIIdentify } from './UIIdentify';
const { ccclass, property } = _decorator;

@ccclass('GlobalChatPopup')
export class GlobalChatPopup extends Component {
    @property({type: EditBox}) content: EditBox = null;
    @property({type: Node}) sendButton: Node = null;
    @property({type: UIIdentify}) panel: UIIdentify = null;

    protected start(): void {
        this.sendButton.on(Node.EventType.TOUCH_START, this.onSend,this);
    }

    public onSend() {
        let contentString = this.content.string.trim().replace(/\x00/g, '');
        if (contentString == "") {
            UIManager.Instance.showNoticePopup(null, "Nội dung rỗng");
            return;
        }

        let sender = UserManager.instance.GetMyClientPlayer.userName + "/" + UserManager.instance.GetMyClientPlayer.myID;
        ServerManager.instance.sendGlobalMessage(contentString, sender);
        this.panel.hide();
    }

    protected onEnable(): void {
        this.content.string = "";
    }
}


