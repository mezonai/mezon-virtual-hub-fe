import { _decorator, Component, Node, Sprite, Label, tween, Tween } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../../PopUp/PopupSelectionMini';
import { ServerManager } from '../../core/ServerManager';
import { UserManager } from '../../core/UserManager';
import { PopupActionInterruptHarvest, PopupActionInterruptHarvestParam } from '../../PopUp/PopupActionInterruptHarvest';
import { WebRequestManager } from '../../network/WebRequestManager';
import { UserMeManager } from '../../core/UserMeManager';
import { InventoryClanType } from '../../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('PlayerInteractFarm')
export class PlayerInteractFarm extends Component {
    @property(Node) harvestProgressBar: Node | null = null;
    @property(Sprite) harvestFillSprite: Sprite | null = null;
    @property(Label) contentBubbleChat: Label = null;
    private harvestTween: Tween<Sprite> | null = null;
    public isHarvesting: boolean;
    public currentHarvestSlotId: string | null = null;


    public showHarvestingBar(endTime?: number, slotId?: string) {
        if (!slotId || !this.harvestProgressBar || !this.harvestFillSprite) return;
        this.currentHarvestSlotId = slotId;
        this.isHarvesting = true;
        this.playAnimHarvest(endTime)
    }
    public playAnimHarvest(endTime?: number): Promise<void> {
        return new Promise((resolve) => {
            const now = Date.now();
            const duration = endTime ? Math.max(endTime - now, 0) : 10000;

            if (duration <= 0) {
                this.hideHarvestingBar();
                resolve();
                return;
            }

            this.harvestProgressBar.active = true;
            this.harvestFillSprite.fillRange = 0;

            let lastPercent = -1;

            this.harvestTween = tween(this.harvestFillSprite)
                .to(duration / 1000, { fillRange: 1 }, {
                    onUpdate: (target: Sprite) => {
                        const percent = Math.floor(target.fillRange * 100);
                        if (percent !== lastPercent) {
                            lastPercent = percent;
                            this.contentBubbleChat.string = `Thu hoạch:${percent}%`;
                        }
                    },
                })
                .call(() => {
                    this.hideHarvestingBar();
                    resolve();
                })
                .start();
        });
    }

    public showHarvestingComplete() {
        this.isHarvesting = false;
        this.hideHarvestingBar();
    }

    public hideHarvestingBar() {
        this.contentBubbleChat.string = '';
        if (this.harvestTween) {
            this.harvestTween.stop();
            this.harvestTween = null;
        }

        if (this.harvestProgressBar) {
            this.harvestProgressBar.active = false;
        }
    }

    public async OnActionInterruptHarvest() {
        if (!this.currentHarvestSlotId) return;
        const inventory = await WebRequestManager.instance.getClanWarehousesAsync(
            UserMeManager.Get.clan.id,
            { type: InventoryClanType.TOOLS }
        );
        const param: PopupActionInterruptHarvestParam = {
            fromPlayerId: UserManager.instance.GetMyClientPlayer.myID,
            farm_slot_id: this.currentHarvestSlotId,
            inventory:inventory
        };
        PopupManager.getInstance().openAnimPopup("PopupActionInterruptHarvest", PopupActionInterruptHarvest, param);
    }
}


