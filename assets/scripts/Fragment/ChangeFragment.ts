import { _decorator, Component, Node } from 'cc';
import { ItemFragmentCombine } from '../gameplay/Upgrade/ItemFragmentCombine';
import { Sprite } from 'cc';
import { Vec3 } from 'cc';
import { FragmentDTO } from '../Model/Item';
import { WebRequestManager } from '../network/WebRequestManager';
import { tween } from 'cc';
import { PopupCombieFragmentParam } from '../PopUp/PopupCombieFragment';
import { Button } from 'cc';
import { PopupReward, PopupRewardParam, RewardStatus } from '../PopUp/PopupReward';
import { PopupManager } from '../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('ChangeFragment')
export class ChangeFragment extends Component {
    @property({ type: [ItemFragmentCombine] }) itemCombine: ItemFragmentCombine[] = [];
    @property({ type: ItemFragmentCombine }) itemResult: ItemFragmentCombine = null;
    @property({ type: Node }) chest: Node = null;
    @property({ type: Sprite }) closeChestSprite: Sprite = null;
    @property({ type: Sprite }) openChestSprite: Sprite = null;
    @property({ type: Button }) buttonChange: Button = null;
    private positionItemCombine1: Vec3 = new Vec3(-45, 30, 0);
    private positionItemCombine2: Vec3 = new Vec3(-15, 30, 0);
    private positionItemCombine3: Vec3 = new Vec3(15, 30, 0);
    private positionItemCombine4: Vec3 = new Vec3(45, 30, 0);
    resetUI(fragmentData: FragmentDTO) {
        const positions = [
            this.positionItemCombine1,
            this.positionItemCombine2,
            this.positionItemCombine3,
            this.positionItemCombine4,
        ];

        this.itemCombine.forEach((item, index) => {
            if (!item) return;
            item.node.setPosition(positions[index]);
            item.resetUI();
        });
        this.itemResult.resetUI();
        this.openChestSprite.node.active = false;
        this.closeChestSprite.node.active = true;
        this.setDataItemFragment(fragmentData);
    }

    public setData(param?: PopupCombieFragmentParam, onClose?: () => void) {
        this.resetUI(param.fragmentData);
        this.buttonChange.addAsyncListener(async () => {
            await this.playChangeAnimation();
            const data = await WebRequestManager.instance.getItemFragmentAsync(param.typeFrament);
            if (data == null) {
                if (onClose) onClose();
                return;
            }
            this.resetUI(data);
        });
    }

    private setDataItemFragment(fragmentData: FragmentDTO) {
        if (fragmentData == null || fragmentData.fragmentItems == null) return;
        let totalFragmentsCanCombine: number = 0;
        fragmentData.fragmentItems.sort((a, b) => a.index - b.index);
        for (let i = 0; i < this.itemCombine.length; i++) {
            const fragment = fragmentData.fragmentItems[i];
            if (!fragment) {
                this.itemCombine[i].setData(fragmentData.species, null);
                continue;
            }
            totalFragmentsCanCombine = totalFragmentsCanCombine === 0 ? fragment.quantity : Math.min(totalFragmentsCanCombine, fragment.quantity);
            this.itemCombine[i].setData(fragmentData.species, fragment);
        }
    }

    async onClickChange(fragmentData: FragmentDTO) {
        let fragments = await WebRequestManager.instance.postChangeFragmentAsync(fragmentData.recipeId, 3);// sau gọi thằng này
        if (!fragments) return;
         WebRequestManager.instance.getUserProfileAsync();// cập nhật data user
        await this.playChangeAnimation();     
        for (let i = 0; i < fragments.length; i++) {
            const content = `Chúc mừng bạn nhận thành công ${fragments[i].item.name}`;
            const paramPopup: PopupRewardParam = {
                status: RewardStatus.GAIN,
                content: content,
                fragmentDTO: fragments[i]
            };
            const popup = await PopupManager.getInstance().openPopup('PopupReward', PopupReward, paramPopup);
            await PopupManager.getInstance().waitCloseAsync(popup.node.uuid);
        }
    }

    private async playChangeAnimation(): Promise<void> {
        const resultNode = this.itemResult?.node;
        if (!resultNode) return;
        await this.showCombineItemsSequentially();
        await this.playCombineItemsImpact(resultNode);
        await this.moveToCenterAndScale(resultNode);
        await this.OpenChest();
    }

    private async playCombineItemsImpact(resultNode: Node): Promise<void> {
        const positionMove = resultNode.position;
        for (const item of this.itemCombine) {
            await this.moveToPosition(item.node, positionMove);
            await this.itemResult?.playImpact();
        }
    }
    async showCombineItemsSequentially(delayStep: number = 0.5): Promise<void> {
        for (let i = 0; i < this.itemCombine.length; i++) {
            const item = this.itemCombine[i];
            if (!item) continue;
            await item.fadeIn();
            await this.delay(delayStep);
        }
    }

    moveToCenterAndScale(node: Node, duration: number = 0.4): Promise<void> {
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

    private OpenChest(): Promise<void> {
        return new Promise((resolve) => {

            this.openChestSprite.node.active = false;
            let chestNode = this.closeChestSprite.node;
            const originPos = chestNode.position.clone();

            tween(chestNode)
                .repeat(
                    5,
                    tween(chestNode)
                        .to(0.2, { position: new Vec3(originPos.x + 8, originPos.y, originPos.z) })
                        .to(0.2, { position: new Vec3(originPos.x - 8, originPos.y, originPos.z) })
                )
                .call(() => {
                    chestNode.setPosition(originPos);
                    this.closeChestSprite.node.active = false;
                    this.openChestSprite.node.active = true;
                    resolve();
                })
                .start();
        });
    }

    private delay(sec: number): Promise<void> {
        return new Promise((resolve) => this.scheduleOnce(resolve, sec));
    }

    moveToPosition(node: Node, targetPos: Vec3, duration: number = 0.3): Promise<void> {
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
}


