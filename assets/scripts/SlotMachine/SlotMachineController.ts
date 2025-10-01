import {_decorator,Button, instantiate, Label, Node, Prefab, SpriteFrame, Vec3, Toggle} from "cc"; 
import { WebRequestManager } from "../network/WebRequestManager";
import {Food, Item, ItemGenderFilter, RewardDisplayData, RewardItemDTO, RewardType, StatsConfigDTO} from "../Model/Item";
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

const { ccclass, property } = _decorator;

@ccclass("SlotMachineController")
export class SlotMachineController extends BasePopup {
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
    @property(Node) parentHover: Node = null;
    private minusCoin: number = 0;
    private hasSpin: boolean = false;

    @property({ type: [SpriteFrame] }) iconValue: SpriteFrame[] = []; // 0: normal 1: rare 2: super
    @property({ type: [SpriteFrame] }) iconMoney: SpriteFrame[] = []; // 0: Gold 1: Diamond
    protected foodNameMap: Record<string, string>;
    protected foodIconMap: Record<string, SpriteFrame>;
    protected moneyIconMap: Record<string, SpriteFrame>;
    private rewardRateMap: StatsConfigDTO;

    @property(UIPanelSliderEffect) slotMachineRate: UIPanelSliderEffect = null;

    public init(param: SlotmachineParam): void {
        if (param == null) {
            PopupManager.getInstance().closePopup(this.node.uuid);
            return;
        }
        this.foodIconMap = {
            normal: this.iconValue[0],
            premium: this.iconValue[1],
            ultrapremium: this.iconValue[2],
        };
        this.foodNameMap = {
            normalFood: "Thức ăn sơ cấp",
            premiumFood: "Thức ăn cao cấp",
            ultraFood: "Thức ăn siêu cao cấp",
        };
        this.moneyIconMap = {
            gold: this.iconMoney[0],
            diamond: this.iconMoney[1],
        };
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
        this.spinButton.addAsyncListener(async () => {
            this.spinButton.interactable = false;
            this.spinMachine();
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
        this.slotMachinePopUp.active = true;
        this.rewardPopUp.node.active = false;
        this.spinButton.interactable = true;
        this.spinButtonLabel.string = "Quay";
        this.hasSpin = false;
        this.closeButton.node.active = true;
        this.rewardPopUp.HideNode();
        this.getRewardsPercent();
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    }

    private async getRewardsPercent() {
        this.rewardRateMap = await WebRequestManager.instance.getConfigRateAsync();
        if (this.rewardRateMap == null) {
            this.endSpinSlotMachine();
            return;
        }
        await this.showItem();
        this.minusCoin = this.rewardRateMap.costs.spinGold;
        this.showMinusCoinInfo(true);
    }

    private async showItem() {
        ObjectPoolManager.instance.returnArrayToPool(this.itemContainer.children);
        var userGender = UserMeManager.Get.user.gender as ItemGenderFilter;
        var skinLocalData = ResourceManager.instance.getFilteredSkins([
            userGender,
            ItemGenderFilter.UNISEX,
        ]);
        if (skinLocalData && skinLocalData.length > 0) {
            for (const item of skinLocalData) {
                let itemNode = ObjectPoolManager.instance.spawnFromPool(
                    this.itemPrefab.name
                );
                itemNode.setParent(this.itemContainer);

                let spriteFrameToSet: SpriteFrame | null = null;

                if (item instanceof SpriteFrame) {
                    spriteFrameToSet = item;
                } else if (
                    item &&
                    typeof item === "object" &&
                    "icons" in item &&
                    Array.isArray(item.icons) &&
                    item.icons.length > 0
                ) {
                    spriteFrameToSet = await this.setItemImage(
                        item.bundleName,
                        item.icons[0]
                    );
                }
                await this.registUIItemData(
                    itemNode,
                    spriteFrameToSet,
                    item.name,
                    this.rewardRateMap.percentConfig.spinRewards.item,
                    true
                );
            }
        }

        for (const spriteF of this.iconValue) {
            const key = spriteF.name.toLowerCase().replace("food", "");
            const rate = this.rewardRateMap.percentConfig.spinRewards.food[key] ?? 0;
            const displayName = this.foodNameMap[spriteF.name];
            if (rate <= 0) continue;
            let itemNode = ObjectPoolManager.instance.spawnFromPool(
                this.itemPrefab.name
            );
            itemNode.setParent(this.itemContainer);
            await this.registUIItemData(itemNode, spriteF, displayName, rate);
        }

        let goldNode = ObjectPoolManager.instance.spawnFromPool(
            this.itemPrefab.name
        );
        goldNode.setParent(this.itemContainer);
        await this.registUIItemData(
            goldNode,
            this.iconMoney[0],
            "Coin",
            this.rewardRateMap.percentConfig.spinRewards.gold
        );
    }

    protected async registUIItemData(
        itemNode: Node,
        spriteFrameToSet: SpriteFrame | null,
        name: string | null,
        rate: number | null,
        isItem: boolean = false
    ) {
        let slotItem = itemNode.getComponent(SlotItem);
        let displayData: RewardDisplayData = {
            spriteFrame: spriteFrameToSet,
            name: name ?? "",
            rate: rate ?? 0,
            isItem,
        };
        slotItem.setupIcon(displayData, this.parentHover);
        slotItem.iconFrame.node.scale = this.SetItemScaleValue(name);
    }

    protected SetItemScaleValue(
        itemType: string,
        sizeSpecial: number = 0.16,
        sizeClothes: number = 0.3
    ): Vec3 {
        const isSpecial = itemType.includes("Tóc") || itemType.includes("Mặt");
        const value = isSpecial ? sizeSpecial : sizeClothes;
        return new Vec3(value, value, 0);
    }

    protected async setItemImage(
        bundleName: string,
        bundlePath: string
    ): Promise<SpriteFrame | null> {
        let bundleData = {
            bundleName: bundleName,
            bundlePath: bundlePath,
        };
        return await LoadBundleController.instance.spriteBundleLoader.getBundleData(
            bundleData
        );
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
            Constants.showConfirm(`Bạn cần ${this.minusCoin} coin để quay vòng quay may mắn`, "Chú ý" );
            return;
        }

        this.prepareSpinUI();

        this.rewardPopUp.setOnRewardsShownCallback(() => {
            this.restoreSpinUI();
        });

        WebRequestManager.instance.getRewardsSpin(async (response) => {
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
        this.spinButton.interactable = false;
        this.spinButtonLabel.string = "Xin chờ...";
        this.showMinusCoinInfo(false);
        this.hasSpin = true;
    }

    private restoreSpinUI() {
        this.spinButton.node.active = true;
        this.spinButton.interactable = true;
        this.spinButtonLabel.string = this.hasSpin ? "Quay tiếp" : "Quay";
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
            floatingText.showReward(
                `Mỗi lần quay bạn bị trừ -${coin}`,
                true,
                RewardType.GOLD
            );
        }
    }

    private parseRewardItem(data: any): RewardItemDTO[] {
        if (!Array.isArray(data)) return [];

        return data
            .filter((d: any) => d && typeof d === "object")
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
                        rewardItem.quantity = entry.quantity ?? 0;
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
