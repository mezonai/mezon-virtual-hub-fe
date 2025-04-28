import { _decorator, AssetManager, assetManager, sp, SpriteFrame, TextAsset, Texture2D } from 'cc';
import { BundleData } from './LoadBundleController';
import { BundleLoader } from './BundleLoader';
import { DBController } from './DBController';
const { ccclass, property } = _decorator;

class SpineBundleData {
    public skeletonJson;
    public textures;
    public atlasText;
    public skeletonData: sp.SkeletonData;
    public bundleName: string = "";
}

@ccclass('SpineBundleLoader')
export class SpineBundleLoader extends BundleLoader {
    public override assetDictionary: { [key: string]: SpineBundleData } = {};

    protected override getRemoteData(bundle: BundleData): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            this.doesFileExist(bundle.rootPath + bundle.bundleName + "/config." + bundle.version + ".json")
            .then (() => {
                assetManager.loadBundle(bundle.rootPath + bundle.bundleName, {version: bundle.version}, (err, loadedBundle) => {
                    if (err) {
                        //console.error(err);
                        return reject(err);
                    }
    
                    if (loadedBundle) {
                        const skeletonJsonAssetPaths: [] = [];
                        loadedBundle.getDirWithPath("", sp.SkeletonData, skeletonJsonAssetPaths);
                        this.totalAsset = skeletonJsonAssetPaths.length;
                        skeletonJsonAssetPaths.map(assetPath => {
                            let data = new SpineBundleData();
                            this.assetDictionary[assetPath.path] = data;
                            this.assetDictionary[assetPath.path].bundleName = bundle.bundleName;
                        })
    
                        // Load all assets in the bundle
                        const jsonAssetPromises = skeletonJsonAssetPaths.map(assetPath => {
                            return new Promise<void>((assetResolve, assetReject) => {
                                loadedBundle.load(assetPath, sp.SkeletonData, (err, loadedData) => {
                                    if (err) {
                                        // //console.error(err);
                                        // return assetReject(err);
                                    }
    
                                    this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                                    this.assetDictionary[assetPath.path].skeletonData = loadedData;
                                    assetResolve(); // Resolve the promise when asset is loaded
                                });
                            });
                        });
    
                        // // Wait for all assets to be loaded
                        Promise.all(jsonAssetPromises)
                            .then(() => {
                                console.log(`Bundle ${bundle.bundleName} loaded successfully.`);
    
                                for (let key in this.assetDictionary) {
                                    if (this.assetDictionary[key].bundleName == bundle.bundleName) {
                                        this.assetDictionary[key].skeletonJson = this.assetDictionary[key].skeletonData.skeletonJson;
                                        this.assetDictionary[key].atlasText = this.assetDictionary[key].skeletonData.atlasText;
                                        this.assetDictionary[key].textures = this.assetDictionary[key].skeletonData.textures;
                                        
                                        this.saveDataToDB(bundle.bundleName, key, this.assetDictionary[key].skeletonData);
                                    }
                                    
                                }
    
                                resolve(loadedBundle); // Resolve the outer promise once all assets are loaded
                            })
                            .catch(err => {
                                ////console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
                                reject(err); // Reject if any asset fails to load
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

    protected override canGetLocalData(bundle: BundleData): Promise<boolean> {
        return new Promise((resolve, reject) => {
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
                reject(e)
            }
        })
    }

    protected override saveDataToDB(bundleName: string, path: any, data: sp.SkeletonData): void {
        this.saveTexture(data.textures[0], bundleName, path + "/textuxe");
        this.saveToDB(data.atlasText, bundleName, path + ".atlas");
        this.saveToDB(data.skeletonJson, bundleName, path);
    }

    private saveToDB(data, bundleName, path) {
        let dataToSave = {
            id: path,
            value: data,
            bundle: bundleName
        }
        DBController.instance.addData(dataToSave, bundleName);
    }

    private saveTexture(texture, bundleName, path) {
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
        this.saveToDB(dataUrl, bundleName, path);
    }

    protected override getLocalData(bundle: BundleData): Promise<void> {
        return new Promise((resolve, reject) => {
            DBController.instance.getAllData(bundle.bundleName, (listData) => {
                listData = listData.filter(data => data.bundle == bundle.bundleName && data.id != bundle.bundleName)
                const groupedKey = this.groupKeys(listData);
                this.totalAsset = groupedKey.length;
                const assetPromises = groupedKey.map(data => {
                    return new Promise<void>((assetResolve, assetReject) => {
                        this.convertLocalData(data, (skeletonData) => {
                            let spineBundleData = new SpineBundleData();
                            this.assetDictionary[data.id] = spineBundleData;
                            this.assetDictionary[data.id].skeletonData = skeletonData;
                            this.assetDictionary[data.id].skeletonJson = data.mainKey;
                            this.assetDictionary[data.id].atlasText = data.atlasKey;
                            this.assetDictionary[data.id].textures = skeletonData.textures[0];
                            this.assetDictionary[data.id].bundleName = bundle.bundleName;
                            this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                            assetResolve();
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
                        ////console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
                        reject(err); // Reject if any asset fails to load
                    });
            })
        });
    }

    private groupKeys(keys) {
        const grouped = [];
    
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];  // Get the current key object
            const parts = key.id.split('/');  // Split the key id by '/'
    
            if (parts.length == 2 && key.id.indexOf(".") < 0) {
    
                // Create the data object
                let data = {
                    id: key.id,
                    mainKey: key.value,    // Use key.value for the main key value
                    atlasKey: keys[i + 1].value,    // Construct atlas key
                    textureKey: keys[i + 2].value ,// Construct texture key
                    textureNameKey: parts[0] + ".png"
                }
    
                // Push the data into the grouped array
                grouped.push(data);
            }
        }
    
    
        return grouped;
    }
    

    protected convertLocalData(data, callback) {
        this.loadImageFromBD(data.textureKey, (texture) => {
            let asset = new sp.SkeletonData();
            asset.skeletonJson = data.mainKey;
            asset.atlasText = data.atlasKey;
            asset.textures = [texture]
            asset.textureNames = [data.textureNameKey];

            callback(asset);
        })
    }

    private loadImageFromBD(data, callback) {
        assetManager.loadRemote(data, { ext: '.png' }, (err, imageAsset) => {
            if (err) {
                //console.error('Failed to load texture from data URL:', err);
                callback(null);
                return;
            }
            let _img = new Image();
            _img.src = data;
            _img.onload = () => {
                let texture = new Texture2D();
                texture.reset({
                    width: _img.width,
                    height: _img.height,
                });
                texture.uploadData(_img, 0, 0);

                let spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                callback(texture);
            }
        });
    }
}


