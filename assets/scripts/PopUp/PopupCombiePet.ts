import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemCombine } from '../gameplay/Upgrade/ItemCombine';
import { tween } from 'cc';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupCombiePet')
export class PopupCombiePet extends BasePopup {
    @property({ type: [ItemCombine] }) itemCombine: ItemCombine[] = [];
    @property({ type: ItemCombine }) itemResult: ItemCombine = null;
    public async init(param?: PopupCombiePetParam) {
        if (!param) {
            return;
        }
    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }

    private async playCombineAnimation(): Promise<void> {
        const positionMove = this.itemResult.node.position;
        for (let i = 0; i < this.itemCombine.length; i++) {
            await this.moveToPosition(this.itemCombine[i].node, positionMove);
            if (this.itemResult != null) await this.itemResult.playImpact();
        }
        await this.moveToCenterAndScale(this.itemResult.node);
        if (this.itemResult != null) this.itemResult.startBlinkEffect(2);//=> nâng từ 1 -> 2 thì điền 1, từ 2-> 3 thì điền 2
        if (this.itemResult != null) await this.itemResult.playAbsorb();
        if (this.itemResult != null) this.itemResult.playCircleEffect(true);
        if (this.itemResult != null) this.itemResult.playStartFly();
        if (this.itemResult != null) this.itemResult.stopBlinkEffect(true)// check nâng cấp thành công hay không thì điền true or false

    }

    moveToPosition(node: Node, targetPos: Vec3, duration: number = 0.5): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(duration, { position: targetPos }, { easing: 'sineInOut' })
                .call(() => {
                    if (node != null) {
                        node.active = false;
                    }
                    resolve();
                })
                .start();
        });
    }

    moveToCenterAndScale(node: Node, duration: number = 0.6): Promise<void> {
        return new Promise((resolve) => {
            const targetPos = new Vec3(0, 0, 0); // giữa màn hình (theo local của parent)

            tween(node)
                .to(
                    duration,
                    {
                        position: targetPos,
                        scale: new Vec3(2, 2, 2),
                    },
                    { easing: 'quadOut' }
                )
                .call(() => resolve())
                .start();
        });
    }
}

export interface PopupCombiePetParam {

}


