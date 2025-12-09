import { _decorator, assetManager, AssetManager, Component } from 'cc';
import { BundleData } from './LoadBundleController';
import { DBController } from './DBController';
import { UIManager } from '../core/UIManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { Constants } from '../utilities/Constants';
import { LoadingManager } from '../PopUp/LoadingManager';
const { ccclass, property } = _decorator;

@ccclass('BundleLoader')
export abstract class BundleLoader extends Component {
    public assetDictionary: { [key: string]: any } = {};
    protected totalAsset = 0;
    protected loadedAsset = 0;
    public loadAssetCallback = null;
    private availableBundles: BundleData[] = [];
    private loadedBundle: AssetManager.Bundle = null;

    public SetLoadProgress(bundleName, value) {
        this.loadedAsset = value;

        if (this.loadAssetCallback != null) {
            if (this.totalAsset == 0) {
                this.loadAssetCallback(bundleName, 0);
            }
            else {
                this.loadAssetCallback(bundleName, Math.round((this.loadedAsset / this.totalAsset) * 100));
            }
        }
    }

    protected onDestroy(): void {
        this.assetDictionary = {};
        if (this.loadedBundle != null) {
            this.loadedBundle.releaseAll();
            assetManager.removeBundle(this.loadedBundle);
        }
    }

    public async init(bundles: BundleData[], availableBundles: BundleData[], loadCallback): Promise<void> {
        this.loadAssetCallback = loadCallback;
        this.availableBundles = availableBundles;
        try {
            for (const bundle of bundles) {
                this.loadedAsset = 0; 
                this.totalAsset = 0;
                await new Promise<void>((resolve, reject) => {
                    // Load the bundle
                    try {
                        this.canGetLocalData(bundle)
                        .then((isLocal) => {
                            if (isLocal == true) {
                                this.getLocalData(bundle)
                                    .then(() => {
                                        this.loadBundleDone(bundle, null, resolve, reject);
                                    })
                                    .catch((e) => {
                                        this.onError(e, bundle);
                                        reject(e);
                                    });
                            }
                            else {
                                this.getRemoteData(bundle)
                                    .then((loadedBundle) => {
                                        this.loadBundleDone(bundle, loadedBundle, resolve, reject);
                                    })
                                    .catch((e) => {
                                        this.onError(e, bundle);
                                        reject(e);
                                    });
                            }
                        })
                        .catch((e) => {
                            this.onError(e, bundle);
                        })
                    }
                    catch(e) {
                        this.onError(e, bundle);
                    }
                });
            }
        }
        catch(e) {
            //console.error(e);
            // window?.cocosIns?.loadBundleFail();
        }
    }

    protected doesFileExist(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
            return;
            fetch(url, { method: 'GET' })
                .then((response) => {
                    response.text().then((value) => {
                        if (response.status == 404 || value.includes("DOCTYPE")) {
                            reject();
                            return;
                        }
                        resolve();
                    })
                })
                .catch((error) => {
                    console.error('Error checking file existence:', error);
                    reject(error);
                });
        });
    }

    private loadBundleDone(bundle, loadedBundle: AssetManager.Bundle, resolve, reject) {
        this.loadedBundle = loadedBundle;
        resolve();
        return;
        if (this.checkLoadAsset(bundle)) {
            resolve();
        }
        else {
            reject("Load bundle error");
            this.onError("Load bundle error", bundle);
        }
    }

    public async getBundleData(loadData) {
        try {
            LoadingManager.getInstance().openLoading();
            let data = this.assetDictionary[loadData.bundlePath];
            if (data != null) {
                return data;
            }
            else {
                let bundle = this.getBundleForData(loadData.bundleName);
                if (bundle != null) {
                    await this.init([bundle], this.availableBundles, (bundleName, progress) => { })
                    return this.assetDictionary[loadData.bundlePath];
                }
                else {
                    return null;
                }
            }
        }
        catch(e) {
            //console.error(e);
        }
        finally{
            LoadingManager.getInstance().closeLoading();
        }
    }

    protected getBundleForData(key) {
        return this.availableBundles.find(b => b.bundleName == key);
    }

    private onError(e, bundle) {
        this.checkLoadAsset(bundle);
        console.error(e);
        if (UIManager.Instance) {
            Constants.showConfirm("Error when load bundle", "Warning");
        }
        // window?.cocosIns?.loadBundleFail();
    }

    private checkLoadAsset(bundleData: BundleData): boolean {
        let flag = false;

        console.error(this.totalAsset, this.loadedAsset, bundleData.bundleName)
        if (this.totalAsset == 0 || this.loadedAsset == 0) {
            flag = true;
        }

        if (flag) {
            this.resetDB(bundleData);
        }

        return !flag;
    }

    protected resetDB(bundleData: BundleData) {
        //console.error("Something wrong when load Bundle " + bundleData.bundleName + " , BD must be reset", this.totalAsset, this.loadedAsset);
    
        let data = {
            id: bundleData.bundleName,
            value: "-1",
            bundle: bundleData.bundleName
        }
        DBController.instance.addData(data, bundleData.bundleName);
    }

    protected getLocalData(bundle: BundleData): Promise<void> {
        return new Promise((resolve, reject) => {
            reject("Not implement")
        });
    }

    protected getRemoteData(bundle: BundleData): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            reject("Not implement");
        })
    }

    protected saveDataToDB(bundleName, path, data) {
        return;
    }

    protected canGetLocalData(bundleName: BundleData): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(false);
        })
    }
}


