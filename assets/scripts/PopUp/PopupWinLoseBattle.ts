import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { ResourceManager } from '../core/ResourceManager';
import { UserMeManager } from '../core/UserMeManager';
import { AnimationController } from '../gameplay/player/AnimationController';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupWinLoseBattle')
export class PopupWinLoseBattle extends BasePopup {
    @property({ type: AnimationEventController }) previewPlayer: AnimationEventController = null;
    @property({ type: AnimationController }) animationController: AnimationController = null;
    @property({ type: Button }) btnClose: Button = null;

    public init(param?: any) {
        console.log(UserMeManager.Get.user.skin_set);
        this.previewPlayer.init(UserMeManager.Get.user.skin_set);
        this.ActionHappy();
        this.btnClose.addAsyncListener(async () => {
            await PopupManager.getInstance().closePopup(this.node.uuid);
        });
    }

    public ActionHappy() {
        this.animationController.play("happy", true);
    }

    public ActionSad() {
        this.animationController.play("kneel", true);
    }

}


