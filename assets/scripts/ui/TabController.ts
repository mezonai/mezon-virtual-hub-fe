import { _decorator, Component, instantiate, Prefab, RichText, ScrollView, Toggle, ToggleContainer, Vec3 } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
const { ccclass, property } = _decorator;
import { Constants } from '../utilities/Constants';

@ccclass('TabController')
export class TabController extends Component {
    @property({ type: ToggleContainer }) toggleContainer: ToggleContainer = null;
    @property({ type: Prefab }) tabPrefab: Prefab = null;
    @property(ScrollView) protected scrollView: ScrollView = null!;

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
        tabs.forEach(tab => {
            let tabItem = instantiate(this.tabPrefab);
            tabItem.off("toggle", this.onToggleChanged, this);
            tabItem.setParent(this.toggleContainer.node);
            let tabName = tab;
            if (Constants.getTabShop.has(tab)) {
                tabName = Constants.getTabShop.get(tab);
            }
            else if (Constants.getTabShopPet.has(tab)) {
                tabName = Constants.getTabShopPet.get(tab);
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


