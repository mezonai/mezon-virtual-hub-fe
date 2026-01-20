import {_decorator,Button, instantiate, Label, Node, Prefab, SpriteFrame, Vec3, Toggle} from "cc"; 
import { WebRequestManager } from "../network/WebRequestManager";
import {Food, Item, ItemGenderFilter, ItemType, RewardDisplayData, RewardItemDTO, RewardType, SlotWheelType, StatsConfigDTO, WheelDTO} from "../Model/Item";
import { BubbleRotation } from "./BubbleRotation";
import { UserMeManager } from "../core/UserMeManager";
import { RewardUIController } from "./RewardUIController";
import { RewardFloatingText } from "./RewardFloatingText";
import { UserManager } from "../core/UserManager";
import { AudioType, SoundManager } from "../core/SoundManager";
import { ResourceManager } from "../core/ResourceManager";
import { ObjectPoolManager } from "../pooling/ObjectPoolManager";
import { SlotItem } from "./SlotItem";
import { LoadBundleController } from "../bundle/LoadBundleController";
import { UIPanelSliderEffect } from "../utilities/UIPanelSliderEffect";
import { BasePopup } from "../PopUp/BasePopup";
import { PopupManager } from "../PopUp/PopupManager";
import { Constants } from "../utilities/Constants";
import ConvetData from "../core/ConvertData";
import { ItemIconManager } from "../utilities/ItemIconManager";

const { ccclass, property } = _decorator;
enum SpinUIState {
  IDLE,   
  SPINNING,
  RESULT 
}

@ccclass("SlotMachineController")
export class SlotMachineController extends BasePopup {
    @property(Node) slotMachinePopUp: Node = null;
    @property(Node) noticeSpin: Node = null;
    @property(RewardUIController) rewardPopUp: RewardUIController = null;
    @property(BubbleRotation) bubbleRotation: BubbleRotation = null;
    @property(Button) closeButton: Button = null;
    @property(Button) spinX1Button: Button = null;
    @property(Button) spinX5Button: Button = null;
    @property(Node) waitingNode: Node = null;
    @property(Toggle) rateButton: Toggle = null;
    @property(Label) spinButtonLabel: Label = null;
    @property(Prefab) rewardTextPrefab: Prefab = null;
    @property(Node) container: Node = null;
    @property(Label) minusCoinX1Text: Label = null;
    @property(Label) minusCoinX5Text: Label = null;
    @property(Node) minusCoinicon: Node = null;
    @property({ type: Node }) itemContainer: Node = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property(Node) parentHover: Node = null;
    private minusCoin: number = 0;
    private listWheels: WheelDTO[];
    private wheel: WheelDTO;

    @property(UIPanelSliderEffect) slotMachineRate: UIPanelSliderEffect = null;

    public init(param: SlotmachineParam): void {
        if (param == null) {
            PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.initUI(param);
    }

    private async initUI(param: SlotmachineParam) {
        this.slotMachinePopUp.active = false;
        await this.showNoticeSpin();
        if (param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
        this.registerEventListeners();
    }

    private registerEventListeners() {
        this.spinX1Button.addAsyncListener(async () => {
            this.spinX1Button.interactable = false;
            this.spinMachine(1);
        });
        this.spinX5Button.addAsyncListener(async () => {
            this.spinX5Button.interactable = false;
            this.spinMachine(5);
        });
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.endSpinSlotMachine();
        });
    }

    private async endSpinSlotMachine() {
        const updateCompletetd = await WebRequestManager.instance.getUserProfileAsync();
        if (!updateCompletetd) return;
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        this._onActionClose?.();
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public showNoticeSpin() {
        this.spinX1Button.interactable = true;
        this.spinX5Button.interactable = true;
        this.rewardPopUp.node.active = false;
        this.waitingNode.active = false;
        this.slotMachinePopUp.active = true;
        this.spinX1Button.interactable = true;
        this.spinX5Button.interactable = true;
        this.closeButton.node.active = true;
        this.rewardPopUp.HideNode();
        this.getRewardsPercent();
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    }

    private async getRewardsPercent() {
        this.listWheels = await WebRequestManager.instance.getAllWheelAsync(SlotWheelType.NORMAL_WHEEL);
        for (const element of this.listWheels) {
            switch(element.type){
                case SlotWheelType.NORMAL_WHEEL:
                    this.wheel = element;
                    break;
                default:
                   this.endSpinSlotMachine();
            }
        }
        if (this.wheel == null) {
            this.endSpinSlotMachine();
            return;
        }
        await this.showItem(this.wheel);
        this.minusCoin = this.wheel.base_fee;
        this.minusCoinX1Text.string = this.wheel.base_fee.toString();
        this.minusCoinX5Text.string = (this.wheel.base_fee * 5).toString();
    }

    private async showItem(wheel: WheelDTO) {
        this.itemContainer.removeAllChildren();
        const NOT_ITEM_TYPES = [
            ItemType.PET_CARD,
            ItemType.PET_FOOD,
            ItemType.ITEM_CLAN
        ];
        for (const element of wheel.slots) {
            const itemNode = instantiate(this.itemPrefab);
            let slotItem = itemNode.getComponent(SlotItem);
            itemNode.setParent(this.itemContainer);
            let displayData: RewardDisplayData = {
                spriteFrame: await ItemIconManager.getInstance().getIconRewardSlot(element),
                name: this.getNameIconReward(element),
                rate: Math.floor(element.rate) ?? 0,
                isItem: element.type == RewardType.ITEM && !NOT_ITEM_TYPES.includes(element.item.type),
            };
            slotItem.setupIcon(displayData, this.parentHover);
        }
    }

    getNameIconReward(reward: RewardItemDTO): string {
        switch (reward.type_item) {
            case RewardType.ITEM:
                return reward.item.name;
            case RewardType.FOOD:
                return reward.food.name;
            case RewardType.GOLD:
                return 'Vàng';
            case RewardType.PET:
                return reward.pet?.species.toString();
            default:
                return 'Không rõ';
        }
    }

    private async spinMachine(quantity: number = 1) {
        if (UserMeManager.playerCoin < this.minusCoin) {
            Constants.showConfirm(`Bạn cần ${this.minusCoin} coin để quay vòng quay may mắn`, "Chú ý" );
            return;
        }

        this.prepareSpinUI();

        this.rewardPopUp.setOnRewardsShownCallback(() => {
            this.restoreSpinUI();
        });

        WebRequestManager.instance.getRewardsSlotWheel(this.wheel.id, quantity, async (response) => {
            try {
                UserMeManager.playerCoin -= this.minusCoin;
                this.bubbleRotation.startRotation();
                SoundManager.instance.playSound(AudioType.SlotMachine);
                await this.delay(2000);
                this.handleRewardResponse(response);
            } catch (error) {
                this.onError(error);
            }
        }, this.onError.bind(this));
    }

    private prepareSpinUI() {
        this.slotMachineRate.hide();
        this.rateButton.node.active = false;
        this.rewardPopUp.node.active = false;
        this.rewardPopUp.HideNode();
        this.closeButton.node.active = false;
        this.spinX1Button.interactable = false;
        this.spinX5Button.interactable = false;
        this.spinX5Button.node.active = false;
        this.spinX1Button.node.active = false;
        this.waitingNode.active = true;
    }

    private restoreSpinUI() {
        this.spinX1Button.interactable = true;
        this.spinX5Button.interactable = true;
        this.spinX5Button.node.active = true;
        this.spinX1Button.node.active = true;
        this.rateButton.node.active = true;
        this.rateButton.isChecked = false;
        this.waitingNode.active = false;
        this.closeButton.node.active = true;
    }

    private handleRewardResponse(response: any) {
        this.bubbleRotation.stopRotation();
        const rewardsData = response?.data?.rewards ?? [];
        const userGold = response?.data?.user_balance ?? 0;

        if (UserMeManager.Get) {
            UserMeManager.playerCoin = userGold;
        }

        const rewardItems = ConvetData.ConvertRewardsSlot(rewardsData);
        const hasReward = rewardItems.length > 0;
        this.rewardPopUp.show(hasReward, rewardItems);
    }

    private onError(error: any) {
        this.bubbleRotation.stopRotation();
        if (error?.message) {
            Constants.showConfirm(error.message, "Lỗi");
        } else {
            Constants.showConfirm("Có lỗi xảy ra, vui lòng thử lại.", "Lỗi");
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export interface SlotmachineParam {
    onActionClose?: () => void;
}
