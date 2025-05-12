import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle, tween, Vec3 } from 'cc';
import { Item } from '../../../Model/Item';
import { EVENT_NAME } from '../../../network/APIConstant';
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
        if (Date.now() > (this.lastTriggerTime + 500)) {
            this.lastTriggerTime = Date.now();
            if (this.data) {
                this.node.emit(EVENT_NAME.ON_ITEM_CLICK, this, this.data);
            }
        }
    }

    public init(data) {
        this.data = data;
    }
}