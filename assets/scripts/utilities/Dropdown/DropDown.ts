import { _decorator, Button, Component, instantiate, Label, Node, Prefab, Toggle, UITransform } from 'cc';
import { DropdownItem } from './DropdownItem';
const { ccclass, property } = _decorator;

@ccclass('DropDown')
export class DropDown extends Component {
    @property({ type: Node }) panel: Node = null!;
    @property({ type: Node }) content: Node = null!;
    @property({ type: Label }) selectedLabel: Label = null!;
    @property({ type: Prefab }) dropdownItemPrefab: Prefab = null!;
    @property({ type: Button }) btnItemSelectedDropDown: Button;
    onValueSelected: (value: string) => void = null!;
    private optionDatas: string[] = []; // Dữ liệu tùy ý
    private selectedIndex: number = -1;

    start() {
        this.panel.active = false;
        this.btnItemSelectedDropDown.node.on(Button.EventType.CLICK, async () => {
            await this.refreshDropdown();
            this.panel.active = true;
        });
    }

    // Gọi để cập nhật danh sách
    public async setOptions(options: string[], indexSelected: number = -1) {
        this.optionDatas = options;
        this.onSelected(indexSelected);
    }

    private refreshDropdown(): Promise<void> {
        return new Promise((resolve) => {
            // Xóa các item cũ (trừ template nếu có)
            this.content.children.forEach((child) => {
                child.destroy();
            });

            // Nếu không có option => resolve ngay
            if (this.optionDatas.length === 0) {
                resolve();
                return;
            }

            for (let i = 0; i < this.optionDatas.length; i++) {
                const data = this.optionDatas[i];
                const newItem = instantiate(this.dropdownItemPrefab);
                newItem.setParent(this.content);

                const item = newItem.getComponent(DropdownItem);
                if (item) {
                    item.setData(i, data, i == this.selectedIndex, this.onSelected.bind(this));
                }
                if (i === this.optionDatas.length - 1) {
                    setTimeout(() => resolve(), 0);
                }
            }
        });
    }

    private onSelected(index: number) {

        const currentIndex = index == -1 ? 0 : index
        this.selectedIndex = currentIndex;
        const value = this.optionDatas[currentIndex];
        this.selectedLabel.string = value;
        this.panel.active = false;
        if (this.onValueSelected) {
            this.onValueSelected(value);
        }
    }

    getValue(): string {
        return this.optionDatas[this.selectedIndex];
    }
}


