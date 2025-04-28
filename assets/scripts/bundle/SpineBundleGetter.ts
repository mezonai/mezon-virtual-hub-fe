import { _decorator, CCString, Component, Node, sp } from 'cc';
import { LoadBundleController } from './LoadBundleController';
const { ccclass, property } = _decorator;

@ccclass('SpineBundleGetter')
export class SpineBundleGetter extends Component {
    @property({ type: sp.Skeleton }) anim: sp.Skeleton = null;
    @property({type: CCString}) path: string = "";

    protected onEnable(): void {
        if (this.anim != null) {
            this.getSpine();
        }
    }

    private async getSpine() {
        await LoadBundleController.instance.isInitDone();
        let skeletonData = LoadBundleController.instance.spineBundleLoader.assetDictionary[this.path].skeletonData;
        if (skeletonData != null) {
            this.setSkin(skeletonData);
        }
    }

    public setSkin(skeletonData: sp.SkeletonData) {
        this.anim.skeletonData = skeletonData;
        if (skeletonData.skeletonJsonStr.indexOf("skin1") > 0) {
            this.anim.setSkin("skin1");
        }
        this.anim.clearTracks();
        this.anim.setAnimation(0, "Idle", true);
    }
}


