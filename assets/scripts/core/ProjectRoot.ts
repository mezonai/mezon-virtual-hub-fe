import { _decorator, Component, Director, director, Node, ResolutionPolicy, RichText, view } from 'cc';
const { ccclass, property } = _decorator;
import { LoadBundleController } from '../bundle/LoadBundleController';
import { UILoginControll } from '../UILogin/UILoginControl';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { EVENT_NAME } from '../network/APIConstant';
import { LoadingScene } from '../GameMap/LoadingScene/LoadingScene';
import { SceneManagerController } from '../utilities/SceneManagerController';

@ccclass('ProjectRoot')
export class ProjectRoot extends Component {
    @property({ type: UILoginControll }) uiLoginControl: UILoginControll = null;
    @property({ type: Node }) initNotice: Node = null;
    @property({ type: RandomlyMover }) planeNotice: RandomlyMover = null;
    @property({ type: RichText }) progressText: RichText = null;
    @property({ type: RichText }) noticeText: RichText = null;
    @property({ type: LoadingScene }) loadingScene: LoadingScene = null;
    private totalCoreNeedLoad = 1;
    private _loadedCore = 0;
    private initIntervalId = 0;

    private get loadedCore() {
        return this._loadedCore;
    }

    private set loadedCore(value) {
        this._loadedCore = value;

        if (value == this.totalCoreNeedLoad) {
            this.noticeText.string = "Tải Xong!!!";
            this.updateLoadPercent(1);
            let delay = this.planeNotice.node.active ? 1000 : 0;
            setTimeout(() => {
                this.initGameComponent();
                clearTimeout(this.initIntervalId);
                if (this.planeNotice) {
                    this.planeNotice.stop();
                }
            }, delay);
        }
    }

    protected start() {
        this.init();
        const onLoaded = () => {
            this.onSceneLoaded({ name: "GameMap" });
            this.loadingScene.node.active = false;
        };

        const param = SceneManagerController.getSceneParam<{ params: any }>();
        if (param) {
            onLoaded();
        } else {
            this.loadingScene.setData(onLoaded);
        }
    }

    private async init() {
        director.on(EVENT_NAME.RELOAD_SCENE, (scene) => { this.onSceneLoaded(scene) });
    }

    protected onDestroy(): void {
        director.off(EVENT_NAME.RELOAD_SCENE);
    }

    private async onSceneLoaded(scene) {
        if (scene?.name == "GameMap") {
            this.loadedCore = 0;
            this.initNotice.active = true;
            LoadBundleController.instance.init((progress) => {
                this.updateLoadPercent(progress);
            });
            if (this.planeNotice) {
                this.planeNotice.node.active = true;
                this.planeNotice.move();
            }
            await LoadBundleController.instance.isInitDone();
            this.loadedCore++;
        }

    }

    private updateLoadPercent(progress: number) {
        this.progressText.string = `<b>${(Math.round(progress * 100)).toString()}%</b>`;
    }

    private initGameComponent() {
        this.uiLoginControl.init();
    }
}