import { _decorator, Component, Prefab, Node, Vec3, CCString, SpriteFrame } from "cc";
import { MapItemController } from "../gameplay/MapItem/MapItemController";
import { ColysesusObjectData, ItemColysesusObjectData } from "../Model/Player";
import { ObjectPoolManager } from "../pooling/ObjectPoolManager";

const { ccclass, property } = _decorator;

@ccclass('MapItemIconMapping')
export class MapItemIconMapping {
    @property({ type: CCString }) type: string = "";
    @property({ type: SpriteFrame }) icon: SpriteFrame = null;
}

@ccclass('MapItemManger')
export class MapItemManger extends Component {
    private static _instance: MapItemManger;
    public static get instance() {
        return MapItemManger._instance;
    }
    @property({ type: Prefab }) itemPrefab: Prefab = null;
    @property({ type: Node }) itemParent: Node = null;
    @property([MapItemIconMapping]) iconMappingDatas: MapItemIconMapping[] = [];
    private items: Map<string, MapItemController> = new Map();

    protected onLoad(): void {
        if (MapItemManger._instance == null) {
            MapItemManger._instance = this;
        }
    }

    protected onDestroy(): void {
        MapItemManger._instance = null;
    }

    public async createItem(itemData: ItemColysesusObjectData) {
        const itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
        let itemController = itemNode.getComponent(MapItemController);
        itemNode.setPosition(new Vec3(itemData.x, itemData.y, 0));
        itemNode.setParent(this.itemParent);
        await itemController.init(itemData.sessionId, itemData.room, itemData.ownerId);
        this.items.set(itemData.sessionId, itemNode.getComponent(MapItemController));
        this.onUseItem({
            itemId: itemData.sessionId,
            playerId: itemData.ownerId
        })
    }

    public onUseItem(data) {
        const { itemId } = data;
        if (this.items.has(itemId)) {
            this.items.get(itemId).useItem(data.playerId);
        }
    }
}