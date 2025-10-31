import { _decorator, Component, Node, Sprite, Label, tween, Tween} from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { PopupSelectionMini, SelectionMiniParam } from '../../PopUp/PopupSelectionMini';
import { ServerManager } from '../../core/ServerManager';
import { PlantToSlotPayload } from '../../Farm/EnumPlant';
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
        const now = Date.now();
        const duration = endTime ? Math.max(endTime - now, 0) : 10000;
        console.log(`🌾 Harvest started | now=${now}, endTime=${endTime}, duration=${duration}ms`);

        if (duration <= 0) {
            this.hideHarvestingBar();
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
            })
            .start();
    }

    public showHarvestingComplete(context: string) {
        this.isHarvesting = false;
        this.hideHarvestingBar();
        this.contentBubbleChat.string = context;
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

    public OnActionInterruptHarvest() {
        console.log("this.currentHarvestSlotId: ", this.currentHarvestSlotId);
        if(!this.currentHarvestSlotId) return;
        const param: SelectionMiniParam = {
            title: "Chú ý",
            content: `Bạn có chắc chắn muốn phá người chơi đang thu hoạch`,
            textButtonLeft: "Phá",
            textButtonRight: "Thôi",
            textButtonCenter: "",
            onActionButtonLeft: async () => {
                let data = {
                    farm_slot_id: this.currentHarvestSlotId,
                }
                ServerManager.instance.sendInterruptHarvest(data)
            },
            onActionButtonRight: () => {},
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }
}


