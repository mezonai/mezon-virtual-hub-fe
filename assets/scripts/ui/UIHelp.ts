import { _decorator, Button, Component, Node } from 'cc';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupManager } from '../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('UIHelp')
export class UIHelp extends BasePopup {
    @property(Button) closeButton: Button = null;

    public init(param?: any): void {
        this.closeButton.node.on('click', this.onClosePopup, this);
         if(param != null && param.onActionClose != null){
            this._onActionClose = param.onActionClose;
        }
    }
    private onClosePopup() {
        PopupManager.getInstance().closePopup(this.node.uuid);
        this._onActionClose?.();
    }
}

export interface UIHelpParam {
    onActionClose?: () => void;
}