import { _decorator, AssetManager, assetManager, CCBoolean, JsonAsset, rect, resources, SpriteFrame, Texture2D } from 'cc';
import { BundleData } from './LoadBundleController';
import { BundleLoader } from './BundleLoader';
import { DBController } from './DBController';
const { ccclass, property } = _decorator;

@ccclass('SpriteBundleLoader')
export class SpriteBundleLoader extends BundleLoader {
    public override assetDictionary: { [key: string]: SpriteFrame } = {};
    @property({ type: CCBoolean }) isUseLocalResources: boolean = true;
    private readonly localFixPath: string = "Bundle/Skin/";

    protected override canGetLocalData(bundle: BundleData): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.isUseLocalResources) {
                resolve(true);
                return;
            }
            try {
                DBController.instance.getDataByKey(bundle.bundleName, bundle.bundleName, (data) => {
                    if (data != null && data.value == bundle.version) {
                        resolve(true);
                    }
                    else {
                        let data = {
                            id: bundle.bundleName,
                            value: bundle.version,
                            bundle: bundle.bundleName
                        }
                        DBController.instance.addData(data, bundle.bundleName);
                        resolve(false);
                    }
                })
            }
            catch (e) {
                //console.error(e);
            }
        })
    }

    protected override getRemoteData(bundle: BundleData): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            this.doesFileExist(bundle.rootPath + bundle.bundleName + "/config." + bundle.version + ".json")
                .then(() => {
                    assetManager.loadBundle(bundle.rootPath + bundle.bundleName, { version: bundle.version }, (err, loadedBundle) => {
                        if (err) {
                            console.error(err.message, loadedBundle);
                            return reject(err);
                        }
                        if (loadedBundle) {
                            const assetPaths: [] = [];
                            loadedBundle.getDirWithPath("", SpriteFrame, assetPaths);
                            this.totalAsset = assetPaths.length;
                            // Load all assets in the bundle
                            loadedBundle.loadDir("", SpriteFrame, (err, assets) => {
                                if (err) {
                                    console.error("Error loading assets", err);
                                    reject(err);
                                    return;
                                }

                                assets.forEach(loadedData => {
                                    this.assetDictionary[loadedData.name] = loadedData;
                                    this.saveDataToDB(bundle.bundleName, loadedData.name, loadedData);
                                    this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                                });

                                console.log(`Bundle ${bundle.bundleName} loaded successfully.`);
                                resolve(loadedBundle);
                            });
                        } else {
                            console.warn(`Bundle ${bundle.bundleName} not found.`);
                            resolve(null); // Resolve even if the bundle is not found, to move on to the next
                        }
                    });
                })
                .catch((error) => {
                    reject(error);
                });
        })
    }

    protected override saveDataToDB(bundleName: string, path: any, spriteFrame: any): void {
        const texture = spriteFrame.texture;
        let dataUrl = "";

        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = texture.width;
            canvas.height = texture.height;
            context.drawImage(texture.getHtmlElementObj(), 0, 0);

            dataUrl = canvas.toDataURL('image/png');
        }
        catch (e) {
            console.log(texture)
        }
        let dataToSave = {
            id: path,
            value: dataUrl,
            bundle: bundleName
        }
        DBController.instance.addData(dataToSave, bundleName);
    }

    protected override getLocalData(bundle: BundleData): Promise<void> {
        if (this.isUseLocalResources) {
            return this.loadDataFromResources(bundle);

        }
        else {
            return this.getLocalDataFromIndexDb(bundle);
        }
    }

    protected getLocalDataFromIndexDb(bundle: BundleData): Promise<void> {
        return new Promise((resolve, reject) => {
            DBController.instance.getAllData(bundle.bundleName, (listData) => {
                listData = listData.filter(data => data.bundle == bundle.bundleName && data.id != bundle.bundleName)
                this.totalAsset = listData.length;
                const assetPromises = listData.map(data => {
                    return new Promise<void>((assetResolve, assetReject) => {
                        this.convertLocalData(data, (spriteFrame) => {
                            spriteFrame.name = data.id;
                            this.assetDictionary[data.id] = spriteFrame;
                            assetResolve();
                            this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                        });

                    });
                });

                // Wait for all assets to be loaded
                Promise.all(assetPromises)
                    .then(() => {
                        console.log(`Bundle ${bundle.bundleName} loaded successfully.`);
                        resolve();
                    })
                    .catch(err => {
                        //console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
                        reject(err); // Reject if any asset fails to load
                    });
            })
        });
    }

    private loadDataFromResources(bundle: BundleData): Promise<void> {
        return new Promise((resolve, reject) => {
            resources.load(this.localFixPath + bundle.bundleName + "." + bundle.version, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error("Failed to load config:", err);
                    reject();
                    return;
                }
                const bundleData = jsonAsset.json;
                this.totalAsset = bundleData.length;
                const assetPromises = bundleData.map(data => {
                    if (data.value != "") {
                        return new Promise<void>((assetResolve, assetReject) => {
                            this.convertLocalData(data, (spriteFrame) => {
                                spriteFrame.name = data.id;
                                this.assetDictionary[data.id] = spriteFrame;
                                assetResolve();
                                this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                            });

                        });
                    }
                });

                // Wait for all assets to be loaded
                Promise.all(assetPromises)
                    .then(() => {
                        console.log(`Bundle ${bundle.bundleName} loaded successfully.`);
                        resolve();
                    })
                    .catch(err => {
                        //console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
                        reject(err); // Reject if any asset fails to load
                    });
            });
        });

    }

    protected convertLocalData(data, callback) {
        assetManager.loadRemote(data.value, { ext: '.png' }, (err, imageAsset) => {
            if (err) {
                //console.error('Failed to load texture from data URL:', err);
                callback(null);
                return;
            }

            let _img = new Image();
            _img.src = data.value;
            _img.onload = () => {
                let texture = new Texture2D();
                texture.reset({
                    width: _img.width,
                    height: _img.height,
                });
                texture.uploadData(_img, 0, 0);
                texture.setFilters(Texture2D.Filter.NEAREST, Texture2D.Filter.NEAREST);
                texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
                let spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                callback(spriteFrame);
            }
        });
    }
}