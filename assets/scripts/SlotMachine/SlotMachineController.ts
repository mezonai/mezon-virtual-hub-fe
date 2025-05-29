import { _decorator, Button, Component, instantiate, Label, Node, Prefab } from 'cc';
import { WebRequestManager } from '../network/WebRequestManager';
import { Food, Item, RewardItemDTO, RewardType } from '../Model/Item';
import { BubbleRotation } from './BubbleRotation';
import { UserMeManager } from '../core/UserMeManager';
import { RewardUIController } from './RewardUIController';
import { RewardFloatingText } from './RewardFloatingText';
import { UserManager } from '../core/UserManager';
import { AudioType, SoundManager } from '../core/SoundManager';
import { UIManager } from '../core/UIManager';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('SlotMachineController')
export class SlotMachineController extends Component {
    @property(Node) slotMachinePopUp: Node = null;
    @property(Node) noticeSpin: Node = null;
    @property(RewardUIController) rewardPopUp: RewardUIController = null;
    @property(BubbleRotation) bubbleRotation: BubbleRotation = null;
    @property(Node) playerHub: Node = null;
    @property(Button) closeButton: Button = null;
    @property(Button) spinButton: Button = null;
    @property(Label) spinButtonLabel: Label = null;
    @property(Prefab) rewardTextPrefab: Prefab = null;
    @property(Node) container: Node = null;
    @property(Label) minusCoinText: Label = null;
    @property(Node) minusCoinicon: Node = null;

    private minusCoin: number = 10;
    private hasSpin: boolean = false;

    protected start(): void {
        this.initUI();
        this.registerEventListeners();
    }

    private initUI() {
        this.slotMachinePopUp.active = false;
    }

    private registerEventListeners() {
        this.spinButton.node.on('click', this.spinMachine, this);
        this.closeButton.node.on('click', this.endSpinSlotMachine, this);
    }

    private endSpinSlotMachine() {
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        this.rewardPopUp.show(false, null);
        this.slotMachinePopUp.active = false;
        this.playerHub.active = true;
        this.refreshUserData();
    }

    public showNoticeSpin(isShow: boolean) {
        this.slotMachinePopUp.active = isShow;
        this.rewardPopUp.node.active = !isShow;
        this.spinButton.interactable = isShow;
        this.spinButtonLabel.string = 'Quay';
        this.hasSpin = false;
        this.closeButton.node.active = true;
        this.rewardPopUp.HideNode();

        this.showMinusCoinInfo(true);
        
        if (isShow) {
            UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
        }
    }

    private showMinusCoinInfo(show: boolean) {
        this.minusCoinText.node.active = show;
        this.minusCoinicon.active = show;
        if (show) {
            this.minusCoinText.string = `-${this.minusCoin}`;
        }
    }

    private async spinMachine() {
        if (UserMeManager.playerCoin < this.minusCoin) {
            UIManager.Instance.showNoticePopup('Chú ý', 'Bạn cần 10 coin để quay vòng quay may mắn');
            return;
        }

        this.prepareSpinUI();

        this.rewardPopUp.setOnRewardsShownCallback(() => {
            this.restoreSpinUI();
        });

        WebRequestManager.instance.getRewardsSpin(
            async (response) => {
                try {
                    UserMeManager.playerCoin -= this.minusCoin;
                    this.bubbleRotation.startRotation();
                    SoundManager.instance.playSound(AudioType.SlotMachine);
                    await this.delay(2000);
                    this.handleRewardResponse(response);
                } catch (error) {
                    this.onError(error);
                }
            },
            this.onError.bind(this)
        );
    }

    private prepareSpinUI() {
        this.rewardPopUp.node.active = false;
        this.rewardPopUp.HideNode();
        this.closeButton.node.active = false;
        this.spinButton.interactable = false;
        this.spinButtonLabel.string = 'Xin chờ...';
        this.showMinusCoinInfo(false);
        this.hasSpin = true;
    }

    private restoreSpinUI() {
        this.spinButton.node.active = true;
        this.spinButton.interactable = true;
        this.spinButtonLabel.string = this.hasSpin ? 'Quay tiếp' : 'Quay';
        this.closeButton.node.active = true;
        this.showMinusCoinInfo(true);
    }

    private handleRewardResponse(response: any) {
        this.bubbleRotation.stopRotation();
        const rewardsData = response?.data?.rewards ?? [];
        const userGold = response?.data?.user_gold ?? 0;

        if (UserMeManager.Get) {
            UserMeManager.playerCoin = userGold;
        }

        const rewardItems = this.parseRewardItem(rewardsData);
        const hasReward = rewardItems.length > 0;

        this.rewardPopUp.show(hasReward, rewardItems);
    }

    private showMinusCoinEffect(coin: number) {
        const rewardTextNode = instantiate(this.rewardTextPrefab);
        rewardTextNode.setParent(this.container);

        const floatingText = rewardTextNode.getComponent(RewardFloatingText);
        if (floatingText) {
            floatingText.showReward(`Mỗi lần quay bạn bị trừ -${coin}`, true, RewardType.GOLD);
        }
    }

    private parseRewardItem(data: any): RewardItemDTO[] {
        if (!Array.isArray(data)) return [];

        return data
            .filter((d: any) => d && typeof d === 'object')
            .map((entry: any) => {
                const rewardItem = new RewardItemDTO();

                switch (entry.type) {
                    case RewardType.ITEM:
                        rewardItem.type = RewardType.ITEM;
                        rewardItem.item = this.parseItem(entry.item);
                        rewardItem.quantity = 1;
                        break;

                    case RewardType.FOOD:
                        rewardItem.type = RewardType.FOOD;
                        rewardItem.food = this.parseFood(entry.food);
                        rewardItem.quantity = 1;
                        break;

                    case RewardType.GOLD:
                    default:
                        rewardItem.type = RewardType.GOLD;
                        rewardItem.amount = entry.amount ?? 0;
                        break;
                }

                return rewardItem;
            });
    }

    private parseFood(foodData: any): Food {
        const food = new Food();
        Object.assign(food, foodData);
        return food;
    }

    private parseItem(itemData: any): Item {
        const item = new Item();
        Object.assign(item, itemData);
        item.iconSF = [];
        item.mappingLocalData = null;
        return item;
    }

    private refreshUserData() {
        WebRequestManager.instance.getUserProfile(
            (response) => { 
                UserMeManager.Set = response.data; 
                GameManager.instance.inventoryController.addFoodToInventory(UserMeManager.GetFoods);
            },
            this.onApiError.bind(this)
        );
    }

    private onApiError(error: any) {
        UIManager.Instance.showNoticePopup('Warning', error.error_message);
    }

    private onError(error: any) {
        this.bubbleRotation.stopRotation();
        if (error?.message) {
            console.error('Error message:', error.message);
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}