import { _decorator, Component, director, instantiate, Node, Prefab, resources, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingManager')
export class LoadingManager extends Component {
    private static instance: LoadingManager | null = null;
    @property({ type: Node }) popupLoading: Node = null;
    public static getInstance(): LoadingManager {
        if (!this.instance) {
            this.instance = new LoadingManager();
        }
        return this.instance;
    }

    onLoad() {
        if (LoadingManager.instance) {
            this.destroy(); // Xóa nếu đã có một instance khác
            return;
        }
        LoadingManager.instance = this;
        director.addPersistRootNode(this.node); // Giữ lại khi đổi Scene
    }

    public openLoading(){
        this.popupLoading.active = true;
    }

    public closeLoading(){
        this.popupLoading.active = false;
    }
}


