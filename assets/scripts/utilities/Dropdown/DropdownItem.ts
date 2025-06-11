import { _decorator, Button, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DropdownItem')
export class DropdownItem extends Component {
    @property({ type: Button }) btnItemSelected: Button;
    @property({ type: Label }) content: Label = null!;
    @property({ type: Sprite }) colorBackground: Sprite;
    @property({ type: [Color] }) colorItem: Color[] = [];
    private _onClickCallback: () => void;
    selectedIndex: number = 0;

    setData(index: number, content: string, isItemSelected: boolean, onSelected: (index: number) => void) {
        this.selectedIndex = index;
        this.content.string = content;
        this.colorBackground.color = isItemSelected ? this.colorItem[0] : this.colorItem[1];
        if (this._onClickCallback) {
            this.btnItemSelected.node.off(Button.EventType.CLICK, this._onClickCallback, this);
        }
        this._onClickCallback = () => {
            this.selectedItem(onSelected);
        };
        this.btnItemSelected.node.on(Button.EventType.CLICK, this._onClickCallback, this);
    }

    selectedItem(onSelected: (index: number) => void) {
        console.log("this.selectedIndex", this.selectedIndex);
        onSelected(this.selectedIndex);
    }
}


