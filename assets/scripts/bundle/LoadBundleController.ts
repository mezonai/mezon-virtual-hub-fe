import { _decorator, Component, director } from 'cc';
import { SpriteBundleLoader } from './SpriteBundleLoader';
import { SpineBundleLoader } from './SpineBundleLoader';
import { AudioBundleLoader } from './AudioBundleLoader';
import { DBController } from './DBController';
const { ccclass, property } = _decorator;

export class BundleLoadData {
    public bundleData: BundleData[] = [
        new BundleData("", "SkinBundle1", "1", "Sprite", 1),
        new BundleData("", "SkinBundle2", "1", "Sprite", 1),
        new BundleData("", "SkinBundle3", "1", "Sprite", 1),
        new BundleData("", "SkinBundle4", "1", "Sprite", 1),
        new BundleData("", "SkinBundle5", "1", "Sprite", 1),
        new BundleData("", "SkinBundle6", "1", "Sprite", 1),
    ];
}

export class BundleData {
    public rootPath: string = "";
    public bundleName: string = "Spine";
    public version: string = "";
    public type: string = "Spine";
    public priority: number = 1;

    constructor(rootPath, bundleName, version, type, priority) {
        this.rootPath = "";
        this.bundleName = bundleName;
        this.version = version;
        this.type = type;
        this.priority = priority;
    }
}

@ccclass('LoadBundleController')
export class LoadBundleController extends Component {
    private initDone: boolean = false;
    private static _instance: LoadBundleController;
    public static get instance() {
        return LoadBundleController._instance;
    }

    public async isInitDone(): Promise<boolean> {
        // Loop and wait until initDone becomes true
        while (!this.initDone) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
        }
        return true;
    }

    protected onLoad(): void {
        if (LoadBundleController._instance == null) {
            LoadBundleController._instance = this;

            director.addPersistRootNode(this.node);
        }
    }

    protected onDestroy(): void {
        LoadBundleController._instance = null;
    }

    @property({ type: SpriteBundleLoader }) spriteBundleLoader: SpriteBundleLoader = null;
    @property({ type: SpineBundleLoader }) spineBundleLoader: SpineBundleLoader = null;
    @property({ type: AudioBundleLoader }) audioBundleLoader: AudioBundleLoader = null;
    public bundleData: BundleLoadData = new BundleLoadData();

    public init(callback) {
        if (this.initDone) {
            return;
        }
        // DBController.instance.initDB(this.bundleData.bundleData)
        // .then(() => {
        //     this.startLoadBundle(callback);
        // });

        this.startLoadBundle(callback);
    }

    private async startLoadBundle(callback) {
        callback(0);
        let spriteBundles = this.bundleData.bundleData.filter(b => b.priority == 1 && b.type == "Sprite");
        let spinesBundles = this.bundleData.bundleData.filter(b => b.priority == 1 && b.type == "Spine");
        let audioBundles = this.bundleData.bundleData.filter(b => b.priority == 1 && b.type == "Audio");
        let loadedAsset = 0;
        let totalAsset = (spriteBundles.length + spinesBundles.length + audioBundles.length) * 100;
        let lastPercent = 0;

        await this.spriteBundleLoader.init(spriteBundles, this.bundleData.bundleData, (bundleName, progress) => {
            addLoadProgress(progress);
            // window?.cocosIns?.setProgress(bundleName, progress);
        })
        await this.spineBundleLoader.init(spinesBundles, this.bundleData.bundleData, (bundleName, progress) => {
            // window?.cocosIns?.setProgress(bundleName, progress);
        })
        await this.audioBundleLoader.init(audioBundles, this.bundleData.bundleData, (bundleName, progress) => {
            // window?.cocosIns?.setProgress(bundleName, progress);
        })

        function addLoadProgress(progress) {
            if (progress != lastPercent) {
                lastPercent = progress;
                loadedAsset++;
                callback(loadedAsset / totalAsset);
            }
            // console.log(progress, (loadedAsset / totalAsset) * 100)
        }

        this.initDone = true;
    }
}


