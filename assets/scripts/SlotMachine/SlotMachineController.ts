import { _decorator, Button, Component, instantiate, Label, Node, Prefab, SpriteFrame, assetManager, Vec3, UITransform, tween, Toggle } from 'cc'; // Thêm assetManager
import { WebRequestManager } from '../network/WebRequestManager';
import { Food, InventoryDTO, Item, ItemGenderFilter, ItemType, RewardDisplayData, RewardItemDTO, RewardPecent, RewardType } from '../Model/Item';
import { BubbleRotation } from './BubbleRotation';
import { UserMeManager } from '../core/UserMeManager';
import { RewardUIController } from './RewardUIController';
import { RewardFloatingText } from './RewardFloatingText';
import { UserManager } from '../core/UserManager';
import { AudioType, SoundManager } from '../core/SoundManager';
import { UIManager } from '../core/UIManager';
import { GameManager } from '../core/GameManager';
import { ResourceManager } from '../core/ResourceManager';
import { LocalItemConfig, LocalItemDataConfig, LocalItemPartDataConfig } from '../Model/LocalItemConfig';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { SlotItem } from './SlotItem'; // Đảm bảo đường dẫn này đúng
import { LoadBundleController } from '../bundle/LoadBundleController';
import { TooltipManager } from '../ui/TooltipManager';
import { UIPanelSliderEffect } from '../utilities/UIPanelSliderEffect';

const { ccclass, property } = _decorator;

@ccclass('SlotMachineController')
export class SlotMachineController extends Component {
    @property(Node) slotMachinePopUp: Node = null;
    @property(Node) noticeSpin: Node = null;
    @property(RewardUIController) rewardPopUp: RewardUIController = null;
    @property(BubbleRotation) bubbleRotation: BubbleRotation = null;
    @property(Button) closeButton: Button = null;
    @property(Button) spinButton: Button = null;
    @property(Toggle) rateButton: Toggle = null;
    @property(Label) spinButtonLabel: Label = null;
    @property(Prefab) rewardTextPrefab: Prefab = null;
    @property(Node) container: Node = null;
    @property(Label) minusCoinText: Label = null;
    @property(Node) minusCoinicon: Node = null;
    @property({ type: Node }) itemContainer: Node = null;
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: TooltipManager }) tooltipManager: TooltipManager = null;

    private minusCoin: number = 10;
    private hasSpin: boolean = false;
    private localSkinConfig: LocalItemConfig;

    @property({ type: [SpriteFrame] }) iconValue: SpriteFrame[] = []; // 0: normal 1: rare 2: super
    @property({ type: [SpriteFrame] }) iconMoney: SpriteFrame[] = []; // 0: Gold 1: Diamond
    protected foodNameMap: Record<string, string>;
    protected foodIconMap: Record<string, SpriteFrame>;
    protected moneyIconMap: Record<string, SpriteFrame>;
    private rewardRateMap: RewardPecent;

    @property(UIPanelSliderEffect) slotMachineRate: UIPanelSliderEffect = null;

    protected onLoad(): void {
        this.foodIconMap = {
            normal: this.iconValue[0],
            premium: this.iconValue[1],
            ultrapremium: this.iconValue[2]
        };
        this.foodNameMap = {
            "normalFood": "Thức ăn sơ cấp",
            "premiumFood": "Thức ăn cao cấp",
            "ultraFood": "Thức ăn siêu cao cấp",
        };
        this.moneyIconMap = {
            gold: this.iconMoney[0],
            diamond: this.iconMoney[1]
        };
    }

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
        this.slotMachineRate.hide();
        this.rateButton.isChecked = false;
        this.rewardPopUp.show(false, null);
        this.slotMachinePopUp.active = false;
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

        this.getRewardsPercent();
    }

    private parseRewardsPercent(response: any): RewardPecent {
        return {
            item: response.item,
            gold: response.gold,
            normalFood: response.normalFood,
            premiumFood: response.premiumFood,
            ultraFood: response.ultraFood,
            none: response.none
        };
    }

    private async getRewardsPercent() {
        WebRequestManager.instance.getRewardsPercent(
            async (response) => {
                try {
                    this.rewardRateMap = this.parseRewardsPercent(response.data);
                    await this.showItem();
                } catch (error) {
                    this.onError(error);
                }
            },
            this.onError.bind(this)
        );
    }

    private async showItem() {
        ObjectPoolManager.instance.returnArrayToPool(this.itemContainer.children);
        var userGender = UserMeManager.Get.user.gender as ItemGenderFilter;
        var skinLocalData = ResourceManager.instance.getFilteredSkins([userGender, ItemGenderFilter.UNISEX]);
        if (skinLocalData && skinLocalData.length > 0) {
            for (const item of skinLocalData) {
                let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
                itemNode.setParent(this.itemContainer);

                let spriteFrameToSet: SpriteFrame | null = null;

                if (item instanceof SpriteFrame) {
                    spriteFrameToSet = item;
                } else if (item && typeof item === 'object' && 'icons' in item && Array.isArray(item.icons) && item.icons.length > 0) {
                    spriteFrameToSet = await this.setItemImage(item.bundleName, item.icons[0]);
                }
                await this.registUIItemData(itemNode, spriteFrameToSet, item.name, this.rewardRateMap.item, true);
            }
        }

        for (const spriteF of this.iconValue) {
            const rate = this.rewardRateMap[spriteF.name] ?? 0;
            const displayName = this.foodNameMap[spriteF.name]
            if(rate <= 0) continue;
            let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
            itemNode.setParent(this.itemContainer);
            await this.registUIItemData(itemNode, spriteF, displayName, rate);
        }

        let goldNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
        goldNode.setParent(this.itemContainer);
        await this.registUIItemData(goldNode, this.iconMoney[0], "Coin", this.rewardRateMap.gold);

        let emptyNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
        emptyNode.setParent(this.itemContainer);
        await this.registUIItemData(emptyNode, null, "Không có vật phẩm", this.rewardRateMap.none);
    }

    protected async registUIItemData(itemNode: Node, spriteFrameToSet: SpriteFrame | null, name: string | null, rate: number | null, isItem: boolean = false) {
        var slotItem = itemNode.getComponent(SlotItem);
        var displayData: RewardDisplayData = {
            spriteFrame: spriteFrameToSet,
            name: name ?? '',
            rate: rate ?? 0,
            isItem
        };
        slotItem.setupIcon(this.tooltipManager, displayData);
        slotItem.iconFrame.node.scale = this.SetItemScaleValue(name);
    }

    protected SetItemScaleValue(itemType: string, sizeSpecial: number = 0.16, sizeClothes: number = 0.3): Vec3 {
        const isSpecial = itemType.includes("Tóc") || itemType.includes("Mặt");
        const value = isSpecial ? sizeSpecial : sizeClothes;
        return new Vec3(value, value, 0);
    }

    protected async setItemImage(bundleName: string, bundlePath: string): Promise<SpriteFrame | null> {
        let bundleData = {
            bundleName: bundleName,
            bundlePath: bundlePath
        };
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
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
        this.slotMachineRate.hide();
        this.rateButton.node.active = false;
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
        this.rateButton.node.active = true;
        this.rateButton.isChecked = false;
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
            UIManager.Instance.showNoticePopup('Lỗi', error.message);
        } else {
            UIManager.Instance.showNoticePopup('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}