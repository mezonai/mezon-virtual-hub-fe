import { _decorator, Component, director, instantiate, Node, Prefab, resources, tween, Vec3 } from 'cc';
import { BasePopup } from './BasePopup';
const { ccclass, property } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends Component {
    @property({type: Node}) fixPopupParent: Node = null;
    @property({type: Node}) floatPopupParent: Node = null;
    private static _instance: PopupManager | null = null;
    private popupDict: Map<string, Node> = new Map();

    public static getInstance(): PopupManager {
        if (!this._instance) {
            this._instance = new PopupManager();
        }
        return this._instance;
    }

    onLoad() {
        if (PopupManager._instance) {
            this.destroy(); // Xóa nếu đã có một instance khác
            return;
        }
        PopupManager._instance = this;
        //this.node.setSiblingIndex(0); // Đưa lên trên cùng
        director.addPersistRootNode(this.node); // Giữ lại khi đổi Scene
    }

    protected onDisable(): void {
        this.clearFloatPopupChildren();
    }

    private clearFloatPopupChildren() {
        if (!this.floatPopupParent || this.floatPopupParent.children.length == 0) return;
    
        for (let i = this.floatPopupParent.children.length - 1; i >= 0; i--) {
            const child = this.floatPopupParent.children[i];
            child.destroy(); 
        }
    }

    private async loadPopupView<T extends Node>(popupName: string): Promise<T | null> {
        return new Promise((resolve, reject) => {
            resources.load(`Popup/${popupName}`, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`PopupManager: ${popupName} not found`, err);
                    resolve(null);
                    return;
                }
                const popupNode = instantiate(prefab) as T;
                let basePopup = popupNode.getComponent(BasePopup);
                if (basePopup) {
                    if (basePopup.isFixPosition) {
                        popupNode.setParent(this.fixPopupParent);
                    }
                    else {
                        popupNode.setParent(this.floatPopupParent);
                    }
                }
                else {
                    popupNode.setParent(this.node);
                }
                resolve(popupNode);
            });
        });
    }

    public async openPopup<T extends Component>(popupName: string, componentType: { new (): T }, param?: any ): Promise<T | null> 
    {
        const popupNode = await this.loadPopupView(popupName);
        if (!popupNode) return null;
        const uniqueKey = popupNode.uuid;
        this.popupDict.set(uniqueKey, popupNode);

        const popupComponent = popupNode.getComponent(componentType);
        if (popupComponent && "init" in popupComponent) { 
            (popupComponent as any).init(param);
        }

        return popupComponent;
    }

    public async openAnimPopup<T extends Component>(popupName: string, componentType: { new (): T }, param?: any ): Promise<T | null> 
    {
        const popupNode = await this.loadPopupView(popupName);
        if (!popupNode) return null;
        this.showInFromTop(popupNode);
        const uniqueKey = popupNode.uuid;
        this.popupDict.set(uniqueKey, popupNode);

        const popupComponent = popupNode.getComponent(componentType);
        if (popupComponent && "init" in popupComponent) { 
            (popupComponent as any).init(param);
        }

        return popupComponent;
    }

    private showInFromTop(popup: Node) {
        popup.position = new Vec3(0, 500, 0);
        tween(popup)
            .delay(0.01)
            .to(0.1, { position: new Vec3(0, -20, 0) },)
            .to(0.1, { position: Vec3.ZERO },)
            .start();
    }

     private HideoutToTop(popup: Node, callback) {
        popup.position = new Vec3(0, 0, 0);
        tween(popup)
            .to(0.2, { position: new Vec3(0, 500, 0) },)
            .call(() => {
                callback();
            })
            .start();
    }
    public async closePopup(uniqueKey: string, isAnim : boolean = false) {
        const popupNode = this.popupDict.get(uniqueKey);
        if (!popupNode) return;
        if(isAnim) this.HideoutToTop(popupNode, () =>{popupNode.destroy();})
        else popupNode.destroy();
        this.popupDict.delete(uniqueKey);
    }

    public getPopup<T extends Node>(popupName: string): T | null {
        for (const popupNode of this.popupDict.values()) {
            if (popupNode.name === popupName) {
                return popupNode as T;
            }
        }
        return null;
    }

    public async closeAllPopups() {
        for (const key of this.popupDict.keys()) {
            await this.closePopup(key);
        }
        this.popupDict.clear();
    }
}


