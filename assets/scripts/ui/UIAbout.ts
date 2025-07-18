import { _decorator, Button, Component, Node } from 'cc';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupManager } from '../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('UIAbout')
export class UIAbout extends BasePopup {
    @property(Button) closeButton: Button = null;

    public init(param?: any): void {
        this.closeButton.node.on('click', this.onClosePopup, this);
    }
    private onClosePopup() {
        PopupManager.getInstance().closePopup(this.node.uuid);
    }
}