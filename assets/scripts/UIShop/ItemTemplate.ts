import { _decorator, Component, Sprite, Button } from "cc";
import { Item } from "../Model/Item";
const { ccclass, property } = _decorator;

@ccclass('ItemTemplate')
export class ItemTemplate extends Component {
    @property(Sprite)
    public icon: Sprite = null!;
    @property(Button)
    public button: Button = null!;

    private itemData: Item = null!;

    init(data: Item, onClickCallback: (item: Item) => void) {
        this.itemData = data;
        this.icon.spriteFrame = data.iconSF;
        this.button.node.on("click", () => {
            onClickCallback(this.itemData);
        });
    }
}
