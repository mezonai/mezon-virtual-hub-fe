import { _decorator, CCString, Component, Event, instantiate, Label, Node, Prefab, RichText, ScrollView, Toggle, ToggleContainer, Vec2, Vec3 } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
const { ccclass, property } = _decorator;
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { FoodType, ItemType } from '../Model/Item';

@ccclass('TabController')
export class TabController extends Component {
    @property({ type: ToggleContainer }) toggleContainer: ToggleContainer = null;
    @property({ type: Prefab }) tabPrefab: Prefab = null;
    @property(ScrollView) protected scrollView: ScrollView = null!;

    private tabNameMapping: Map<number, string> = new Map([
        [ItemType.EYES, 'Mắt'],
        [ItemType.FACE, 'Mặt'],
        [ItemType.GLASSES, 'Kính'],
        [ItemType.HAIR, 'Tóc'],
        [ItemType.HAT, 'Mũ'],
        [ItemType.LOWER, 'Quần'],
        [ItemType.UPPER, 'Áo'],
        [ItemType.PET_BAIT, "Mồi"]
    ]);

    private tabNameMappingString: Map<string, string> = new Map([
        [FoodType.NORMAL, 'Bình thường'],
        [FoodType.PREMIUM, 'Cao cấp'],
        [FoodType.ULTRA_PREMIUM, 'Siêu cao cấp']
    ]);

    protected reset() {
        this.scrollView.content.setPosition(new Vec3(0, 0, 0));
    }


    protected onEnable(): void {
        let toggles = this.toggleContainer.getComponentsInChildren(Toggle);
        if (toggles.length > 0) {
            this.reset();
            toggles[0].isChecked = true;
        }
    }

    public initTabData(tabs: string[]) {
        ObjectPoolManager.instance.returnArrayToPool(this.toggleContainer.node.children);
        tabs.forEach(tab => {
            let tabItem = instantiate(this.tabPrefab);
            tabItem.off("toggle", this.onToggleChanged, this);
            tabItem.setParent(this.toggleContainer.node);
            let tabName = tab;
            if (this.tabNameMapping.has(parseInt(tab))) {
                tabName = this.tabNameMapping.get(parseInt(tab));
            }
            else if (this.tabNameMappingString.has(tab)) {
                tabName = this.tabNameMappingString.get(tab);
            }

            tabItem.name = tab.toString();
            tabItem.getComponentInChildren(RichText).string = tabName;
            tabItem.on("toggle", this.onToggleChanged, this);
        });
    }

    private onToggleChanged(toggle: Toggle) {
        if (toggle.isChecked) {
            this.node.emit(EVENT_NAME.ON_CHANGE_TAB, toggle.node.name);
        }
    }
}


