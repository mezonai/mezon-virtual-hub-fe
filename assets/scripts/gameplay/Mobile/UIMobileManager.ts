import { _decorator, Component, Node } from 'cc';
import { LoadingManager } from '../../PopUp/LoadingManager';
import { Button } from 'cc';
import { sys } from 'cc';
import { EVENT_NAME } from '../../network/APIConstant';
const { ccclass, property } = _decorator;

@ccclass('UIMobileManager')
export class UIMobileManager extends Component {
    private static _instance: UIMobileManager;
    @property({ type: Button }) buttonA: Button = null;
    @property({ type: Button }) buttonB: Button = null;
    @property({ type: Button }) buttonChat: Button = null;
    @property({ type: Button }) buttonAnim: Button = null;
    public static get instance() {
        return UIMobileManager._instance;
    }

    onLoad() {
        this.node.active = sys.isMobile
        if (!sys.isMobile) return;
        if (UIMobileManager._instance == null) {
            UIMobileManager._instance = this;
        }
        this.buttonA.addAsyncListener(async () => {
            this.node.emit(EVENT_NAME.ON_CLICK_BUTTON_A_MOBILE);
        });
        this.buttonB.addAsyncListener(async () => {
            this.node.emit(EVENT_NAME.ON_CLICK_BUTTON_B_MOBILE);
        });

        this.buttonChat.addAsyncListener(async () => {
            this.node.emit(EVENT_NAME.ON_CLICK_BUTTON_CHAT_MOBILE);
        });
        this.buttonAnim.addAsyncListener(async () => {
            this.node.emit(EVENT_NAME.ON_CLICK_BUTTON_CHANGE_ANIM_MOBILE);
        });
    }
    removeListnerButtonInteract() {
        this.buttonA?.node.off(Button.EventType.CLICK);
    }

    protected onDestroy(): void {
        UIMobileManager._instance = null;
    }

}


