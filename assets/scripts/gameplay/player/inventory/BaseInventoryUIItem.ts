import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { Food, FoodType, Item } from '../../../Model/Item';
import { EVENT_NAME } from '../../../network/APIConstant';
import { AudioType, SoundManager } from '../../../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('BaseInventoryUIITem')
export class BaseInventoryUIITem extends Component {
    @property({ type: Sprite }) avatar: Sprite = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Label }) amountLabel: Label;

    protected lastTriggerTime = 0;
    public data: Item = null;
    public dataFood: Food = null;

    protected start(): void {
        this.node.on("click", this.onItemClick, this);
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

        if (isFood) {
            this.node.emit(EVENT_NAME.ON_FOOD_CLICK, this, this.dataFood);
        } else {
            this.node.emit(EVENT_NAME.ON_ITEM_CLICK, this, this.data);
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

}