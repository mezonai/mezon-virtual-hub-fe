import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('SlidingPopup')
export class SlidingPopup extends BasePopup {
    @property(Label)
    messageLabel: Label = null!;
    @property(Vec3)
    positionA: Vec3 = new Vec3(0, 0, 0); // Vị trí A

    @property(Vec3)
    positionB: Vec3 = new Vec3(0, 0, 0); // Vị trí B

    public async init(param?: { message: string }) {
        super.init(param);
        if (this.messageLabel && param?.message) {
            this.messageLabel.string = param?.message;
        }
        await this.setTextEffectAndMove();
    }

    protected onLoad(): void {

    }

    async onButtonClick() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    async setTextEffectAndMove() {
        this.messageLabel.node.position = new Vec3(this.positionA.x + this.messageLabel.string.length * 2, this.positionA.y, this.positionA.z);
        await new Promise<void>((resolve) => {
            tween(this.messageLabel.node)
                .to(5 + this.messageLabel.string.length * 0.05, { position: new Vec3(this.positionB.x - this.messageLabel.string.length * 2, this.node.position.y, this.node.position.z) })
                .call(() => {
                    resolve();
                })
                .start();
        });

        await PopupManager.getInstance().closePopup(this.node.uuid);
    }
}


