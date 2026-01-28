import { _decorator, Component, Director, director, Node, ResolutionPolicy, RichText, view } from 'cc';
const { ccclass, property } = _decorator;
import { LoadBundleController } from '../bundle/LoadBundleController';
import { UILoginControll } from '../UILogin/UILoginControl';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { APIConfig, EVENT_NAME } from '../network/APIConstant';
import { SceneManagerController } from '../utilities/SceneManagerController';
import { SceneName } from '../utilities/SceneName';
import { IntroScene } from '../GameMap/IntroScene/IntroScene';
import { Constants } from '../utilities/Constants';

@ccclass('ProjectRoot')
export class ProjectRoot extends Component {
    @property({ type: UILoginControll }) uiLoginControl: UILoginControll = null;
    @property({ type: Node }) initNotice: Node = null;
    @property({ type: RandomlyMover }) planeNotice: RandomlyMover = null;
    @property({ type: RichText }) progressText: RichText = null;
    @property({ type: RichText }) noticeText: RichText = null;
    @property({ type: IntroScene }) introScene: IntroScene = null;
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

    protected async onLoad() {
        this.introScene.node.active = Constants.isFirstEnterGame; 
        director.on(EVENT_NAME.RELOAD_SCENE, (scene) => { this.onSceneLoaded(scene); });
        director.on(EVENT_NAME.ON_LOGIN_MEZON_READY, this.onLoginReady, this);
        await this.uiLoginControl.startLoginMezonOnce();
    }

    private async onLoginReady() {
        await this.startLoadBundle();
    }

    private async startLoadBundle() {
        const onLoaded = async () => {
            this.onSceneLoaded({ name: SceneName.SCENE_GAME_MAP });
        };

        const param = SceneManagerController.getSceneParam<{ params: any }>();
        if (param) {
            onLoaded();
        } else {
            this.introScene.setData(onLoaded);
        }
    }

    protected onDestroy(): void {
        director.off(EVENT_NAME.RELOAD_SCENE);
        director.off(EVENT_NAME.ON_LOGIN_MEZON_READY, this.onLoginReady, this);
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
        this.uiLoginControl?.init();
    }
}