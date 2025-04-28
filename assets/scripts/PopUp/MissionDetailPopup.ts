import { _decorator, Button, Component, Node, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('MissionDetailPopup')
export class MissionDetailPopup extends BasePopup {
    @property(RichText)
        messageLabel: RichText = null!;
        @property(Button)
        closeButton: Button = null;
    
        public init(param?: { message: string }) {
            super.init(param);
            if (this.messageLabel && param?.message) {
                this.messageLabel.string = param?.message;
            }
        }
    
        protected onLoad(): void {
            this.closeButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    
        async onButtonClick() {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        }
}


