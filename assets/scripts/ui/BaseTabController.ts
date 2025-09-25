import { _decorator, Component, Prefab, instantiate, Toggle, ToggleContainer, RichText, ScrollView, Vec3, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseTabController')
export class BaseTabController extends Component {
    @property({ type: ToggleContainer }) toggleContainer: ToggleContainer = null!;
    @property({ type: Prefab }) tabPrefab: Prefab = null!;
    @property({ type: ScrollView }) protected scrollView: ScrollView = null!;

    private callback: (tabName: string) => void = null;

    protected resetScroll() {
        if (this.scrollView?.content) {
            this.scrollView.content.setPosition(new Vec3(0, 0, 0));
        }
    }

    protected onEnable(): void {
        const toggles = this.toggleContainer.getComponentsInChildren(Toggle);
        if (toggles.length > 0) {
            this.resetScroll();
            toggles[0].isChecked = true;
        }
    }

    public initTabs(tabs: string[], displayMap?: Map<string, string>, onTabChanged?: (tabName: string) => void) {
        this.toggleContainer.node.removeAllChildren();
        this.callback = onTabChanged ?? null;

        tabs.forEach((tab, index) => {
            const tabNode = instantiate(this.tabPrefab);
            tabNode.name = tab;

            const label = tabNode.getComponentInChildren(RichText);
            if (label) {
                label.string = displayMap?.get(tab) ?? tab;
            }
            tabNode.setParent(this.toggleContainer.node);
            this.setupToggle(tabNode, tab, index);
        });
    }

    private setupToggle(tabNode: Node, tab: string, index: number) {
        const toggle = tabNode.getComponent(Toggle);
        if (!toggle) return;
        toggle.isChecked = index === 0;
        tabNode.on('toggle', () => {
            if (toggle.isChecked && this.callback) {
                this.callback(tab);
            }
        });
    }
}
