import { _decorator, Button, Component, instantiate, Node, Prefab, ScrollView, Vec3 } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';

const { ccclass, property } = _decorator;

@ccclass('PopupChooseFoodPet')
export class PopupChooseFoodPet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null
    @property({ type: Node }) noFoodPanel: Node = null;

    public async init(param?) {
        if (!param) {
            return;
        }
        this.noFoodPanel.active = true;
        this.closeButton.node.on(Button.EventType.CLICK, () => {
            this.closePopup();
        }, this);
    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }
}


