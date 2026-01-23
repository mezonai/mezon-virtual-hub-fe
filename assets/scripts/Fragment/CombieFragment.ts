import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ItemFragmentCombine } from '../gameplay/Upgrade/ItemFragmentCombine';
import { RichText } from 'cc';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { Sprite } from 'cc';
import { Vec3 } from 'cc';
import { FragmentDTO } from '../Model/Item';
import { tween } from 'cc';
import { UITransform } from 'cc';
import { WebRequestManager } from '../network/WebRequestManager';
import { PopupCombieFragmentParam } from '../PopUp/PopupCombieFragment';
const { ccclass, property } = _decorator;

@ccclass('CombieFragment')
export class CombieFragment extends Component {
    @property({ type: [ItemFragmentCombine] }) itemCombine: ItemFragmentCombine[] = [];
    @property({ type: ItemFragmentCombine }) itemResult: ItemFragmentCombine = null;
    @property({ type: Node }) chest: Node = null;
    @property({ type: RichText }) labelButtonCombine: RichText = null;
    @property({ type: RichText }) labelButtonCombineX10: RichText = null;
    @property({ type: SlotPetDetail }) petDetail: SlotPetDetail = null;
    @property({ type: Button }) buttonCombieX1: Button = null;
    @property({ type: Button }) buttonCombieX10: Button = null;
    @property({ type: Button }) buttonContinue: Button = null;
    @property({ type: Sprite }) closeChestSprite: Sprite = null;
    @property({ type: Sprite }) openChestSprite: Sprite = null;
    @property({ type: Node }) optionCombine: Node = null;
    @property({ type: Node }) optionContinue: Node = null;
    //Tab
    private positionItemCombine1: Vec3 = new Vec3(-25, 30, 0);
    private positionItemCombine2: Vec3 = new Vec3(35, 30, 0);
    private positionItemCombine3: Vec3 = new Vec3(-25, -30, 0);
    private positionItemCombine4: Vec3 = new Vec3(35, -30, 0);
    private positionItemResult: Vec3 = new Vec3(0, 0, 0);

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
        this.petDetail.node.active = false;
        this.itemResult.resetUI();
        this.itemResult.node.setPosition(this.positionItemResult);

        this.chest.setPosition(this.positionItemResult);

        this.openChestSprite.node.active = false;
        this.closeChestSprite.node.active = true;

        this.setUI(false, false);

        this.optionCombine.active = true;
        this.optionContinue.active = false;
        this.setDataItemFragment(fragmentData);
    }

    public setData(param?: PopupCombieFragmentParam, onClose?: () => void){
        this.resetUI(param.fragmentData);
        
                this.buttonCombieX1.addAsyncListener(async () => {
                    this.onClickCombine(1, param.fragmentData);
                });
                this.buttonCombieX10.addAsyncListener(async () => {
                    this.onClickCombine(10, param.fragmentData);
                });
                this.buttonContinue.addAsyncListener(async () => {
                    const data = await WebRequestManager.instance.getItemFragmentAsync(param.typeFrament);
                    if (data == null) {
                        if(onClose) onClose();
                        return;
                    }
                    this.resetUI(data);
                });
    }

    async onClickCombine(times: number, fragmentData: FragmentDTO) {
        let check = await WebRequestManager.instance.postCombieFragmentAsync(fragmentData.recipeId, times);
        if (!check) return; // doi be sua data chinh lai
        this.optionCombine.active = false;
        this.itemResult.setDataResult(fragmentData.species, times);
        this.playCombineAnimation();
        await WebRequestManager.instance.getUserProfileAsync();
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
        this.setUI(totalFragmentsCanCombine > 0, totalFragmentsCanCombine >= 10);
    }

    private setUI(canCombie: boolean, canCombieX10: boolean) {
        this.buttonCombieX1.interactable = canCombie;
        this.buttonCombieX10.interactable = canCombieX10;
    }

    private async playCombineAnimation(): Promise<void> {
        const resultNode = this.itemResult?.node;
        if (!resultNode) return;
        await this.showCombineItemsSequentially();
        await this.playCombineItemsImpact(resultNode);
        await this.moveToCenterAndScale(resultNode);
        await this.OpenChest();
        await this.itemResult.showResult();
        this.optionContinue.active = true;
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
        await this.itemResult?.fadeIn();
    }

    private OpenChest(): Promise<void> {
        return new Promise((resolve) => {

            this.openChestSprite.node.active = false;
            this.itemResult.node.active = false;

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

    moveToWorldPosition(node: Node, targetWorldPos: Vec3, duration: number = 0.3): Promise<void> {
        return new Promise((resolve) => {
            const localPos = node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(targetWorldPos);
            tween(node)
                .to(duration, { position: localPos }, { easing: 'quadOut' })
                .call(() => resolve())
                .start();
        });
    }
}


