import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager;
    public static get instance() {
        return ResourceManager._instance;
    }

    protected onLoad(): void {
        if (ResourceManager._instance == null) {
            ResourceManager._instance = this;
        }
    }

    protected onDestroy(): void {
        ResourceManager._instance = null;
    }
}


