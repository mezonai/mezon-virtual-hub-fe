import { _decorator, Component, Prefab, instantiate, Node, ScrollView, resources, SpriteFrame } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export abstract class AbstractItemList extends Component {
    @property(Prefab)
    protected itemPrefab: Prefab = null!;

    @property(Node)
    protected contentContainer: Node = null!;

    @property(ScrollView)
    protected scrollView: ScrollView = null!;

    protected createItemNode(): Node {
        const itemNode = instantiate(this.itemPrefab);
        this.contentContainer.addChild(itemNode);
        return itemNode;
    }

    protected abstract setItemInfo(itemNode: Node, data: any): void;

    public loadItems(dataList: any[]) {
        this.contentContainer.removeAllChildren();
        dataList.forEach((data) => {
            const itemNode = this.createItemNode();
            this.setItemInfo(itemNode, data);
        });

        this.scheduleOnce(() => {
            this.scrollView?.scrollToTop(1);
        }, 0);
    }

    protected getSpriteFrameFromResources(name: string, callback: (spriteFrame: SpriteFrame) => void) {
        resources.load(`sprites/${name}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(`Failed to load sprite: ${name}`, err);
                return;
            }
            callback(spriteFrame);
        });
    }
}
