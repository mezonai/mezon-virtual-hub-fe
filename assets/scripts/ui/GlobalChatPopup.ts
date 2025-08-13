import { _decorator, Component, EditBox, Node } from 'cc';
import { ServerManager } from '../core/ServerManager';
import { UserManager } from '../core/UserManager';
import { UIManager } from '../core/UIManager';
import { UIIdentify } from './UIIdentify';
import { PopupManager } from '../PopUp/PopupManager';
import { BasePopup } from '../PopUp/BasePopup';
import { SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { ConfirmParam, ConfirmPopup } from '../PopUp/ConfirmPopup';
const { ccclass, property } = _decorator;

@ccclass('GlobalChatPopup')
export class GlobalChatPopup extends BasePopup {
    @property({ type: EditBox }) content: EditBox = null;
    @property({ type: Node }) sendButton: Node = null;
    @property({ type: Node }) closeButton: Node = null;

    public init(param?: SelectionMiniParam): void {
        this.content.string = "";
        this.sendButton.on(Node.EventType.TOUCH_START, this.onSend, this);
        this.closeButton.on(Node.EventType.TOUCH_START, this.onClose, this);
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
    }

    public onClose() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }

    public onSend() {
        let contentString = this.content.string.trim().replace(/\x00/g, '');
        if (contentString == "") {
            const param: ConfirmParam = {
                message: "Nội dung rỗng",
                title: "Chú ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            return;
        }

        let sender = UserManager.instance.GetMyClientPlayer.userName + "/" + UserManager.instance.GetMyClientPlayer.myID;
        ServerManager.instance.sendGlobalMessage(contentString, sender);
        this.onClose();
    }
}

export interface GlobalChatParam {
    onActionClose?: () => void;
}


