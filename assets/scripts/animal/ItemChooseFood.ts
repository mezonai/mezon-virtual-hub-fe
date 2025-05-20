import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemChooseFood')
export class ItemChooseFood extends Component {
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Sprite }) spriteicon: Sprite = null;
    @property({ type: Label }) qualityFood: Label = null;
    @property({ type: [SpriteFrame] }) spriteFramesFood: SpriteFrame[] = [];
    private boundToggleCallback: () => void;

    setDataItem(type: number, onToggleClick: (type: number, quality: number) => void) {
        this.spriteicon.spriteFrame = this.spriteFramesFood[type];
        this.qualityFood.string = "0";
        this.boundToggleCallback = () => {
            if (onToggleClick) {
                if(!this.toggle.isChecked) return;
                onToggleClick(type, 0);
            }
        };
        this.toggle.node.on(Toggle.EventType.TOGGLE, this.boundToggleCallback, this);
    }

    // protected onDisable(): void {
    //     this.toggle.node.off(Toggle.EventType.TOGGLE, this.boundToggleCallback, this);
    // }
}


