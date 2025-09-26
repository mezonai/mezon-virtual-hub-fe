import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { Food, InventoryDTO, InventoryType, Item, ItemType, PurchaseMethod, RewardItemDTO } from '../../../Model/Item';
import { AudioType, SoundManager } from '../../../core/SoundManager';
import { IconItemUIHelper } from '../../../Reward/IconItemUIHelper';
const { ccclass, property } = _decorator;

@ccclass('BaseInventoryUIITem')
export class BaseInventoryUIITem extends Component {
    @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;
    public onClick?: (uiItem: this, data: Item | Food) => void;
    protected lastTriggerTime = 0;
    public data: Item = null;
    public dataFood: Food = null;

    protected start(): void {
        this.node.on(Node.EventType.TOUCH_END, this.onItemClick, this);
        this.toggle.node.on("toggle", this.onToggle, this);
    }

    public toggleActive(isActive) {
        this.stasSprite.spriteFrame = isActive ? this.stasFrame[1] : this.stasFrame[0];
        this.toggle.isChecked = isActive;
    }

    protected onToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.selectedMark.active = toggle.isChecked;
            this.selectedMark.scale = Vec3.ONE;
            tween(this.selectedMark)
                .to(0.1, { scale: new Vec3(1.3, 1.3, 1.3) })
                .to(0.1, { scale: Vec3.ONE })
                .start();
        }
    }

    protected onItemClick() {
        SoundManager.instance.playSound(AudioType.Toggle);
        const isFood = this.dataFood != null;
        const isItem = this.data != null;
        if (!isFood && !isItem) {
            return;
        }
        const now = Date.now();
        if (now - this.lastTriggerTime < 500) return;
        this.lastTriggerTime = now;

        if (this.onClick) {
            this.onClick(this, isFood ? this.dataFood : this.data);
        }
    }

    public resetData() {
        this.data = null;
        this.dataFood = null;
    }


    public init(data) {
        this.data = data;
    }

    public initFood(data) {
        this.dataFood = data;
    }
   
    public async updateAmountCardItem(data: Item): Promise<void> {

    }

    public setIconByReward (rewardItem: RewardItemDTO){
        this.iconItemUIHelper.setIconByReward(rewardItem);
    }

    public setIconByInventory (inventoryDTO: InventoryDTO){
        this.iconItemUIHelper.setIconByInventory(inventoryDTO);
    }

    public setIconByItem (item: Item){
        this.iconItemUIHelper.setIconByItem(item);
    }

    public setIconByFood (food: Food){
        this.iconItemUIHelper.setIconByFood(food);
    }

    public setIconByPurchaseMethod (purchaseMethod: PurchaseMethod){
        this.iconItemUIHelper.setIconByPurchaseMethod(purchaseMethod);
    }

    public setScaleByItemType (itemType: ItemType, sizeSpecial = 0.16, sizeDefault = 0.3){
        this.iconItemUIHelper.setSizeIconByItemType(itemType, sizeSpecial, sizeDefault);
    }

    public setScaleByInventoryType (inventoryType: InventoryType, sizeSpecial = 0.3, sizeDefault = 0.3){
        this.iconItemUIHelper.setSizeIconByInventoryType(inventoryType, sizeSpecial, sizeDefault);
    }

}