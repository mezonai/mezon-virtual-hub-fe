import { _decorator, CCString, Component, Label, Node, Prefab, ScrollView, ToggleContainer, instantiate, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TabData')
export class TabData {
    @property({ type: CCString }) tabName: string = "";
    @property({ type: Node }) contentContainer: Node = null;
}

@ccclass('TabController')
export class TabController extends Component {
    @property({ type: ToggleContainer }) toggleContainer: ToggleContainer = null;
    @property({ type: [TabData] }) contentContainers: TabData[] = [];
    @property({ type: Label }) globalName: Label = null;
    @property({ type: CCString }) beforeTabName: string = "";
    @property({ type: ScrollView }) scrollview: ScrollView = null;

    @property({ type: Prefab }) prefSkin: Prefab = null;
    @property({ type: Node }) contentSkinParent: Node = null;


    @property({ type: Prefab }) prefToggle: Prefab = null;
    @property({ type: Node }) contentParent: Node = null;

    private isFirstTimeOpen = true;

    private currentToggleActive = "";

    private lengthSkin = 6;

    private onToggle(event: Event, customEventData: string) {
        this.checkShowData();
    }

    protected onEnable(): void {
        if (this.isFirstTimeOpen) {
            this.isFirstTimeOpen = false;
            setTimeout(() => {
                this.checkShowData();
            }, 1000);
        }
        else {
            // this.checkTabContainer();
        }
    }

    private checkShowData() {
        for (let i = 0; i < this.toggleContainer.toggleItems.length; i++) {
            if (this.toggleContainer.toggleItems[i].isChecked) {
                this.contentContainers[i].contentContainer.active = true;
                if (this.globalName) {
                    this.globalName.string = this.beforeTabName + this.contentContainers[i].tabName;
                }
                if (this.scrollview) {
                    this.scrollview.content = this.contentContainers[i].contentContainer;
                }
                this.contentContainers[i].contentContainer.emit("toggle_active");
            }
            else {
                this.contentContainers[i].contentContainer.active = false;
            }
        }
    }

}


