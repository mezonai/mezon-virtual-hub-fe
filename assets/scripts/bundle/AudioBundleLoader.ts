import { _decorator, AssetManager, assetManager, AudioClip } from 'cc';
import { BundleData } from './LoadBundleController';
import { BundleLoader } from './BundleLoader';
import { DBController } from './DBController';
import { SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('AudioBundleLoader')
export class AudioBundleLoader extends BundleLoader {
    public override assetDictionary: { [key: string]: AudioClip } = {};

    public override async init(bundles: BundleData[], availableBundles: BundleData[], loadAssetCallback) {
        await super.init(bundles, availableBundles, loadAssetCallback);
        let clips = [];
        for (let key in this.assetDictionary) {
            let data = {
                id: key,
                clip: this.assetDictionary[key]
            }
            clips.push(data);
        }
        // SoundManager.instance.setAudioClip(clips);
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

    protected override getRemoteData(bundle: BundleData): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            this.doesFileExist(bundle.rootPath + bundle.bundleName + "/config." + bundle.version + ".json")
            .then (() => {
                assetManager.loadBundle(bundle.rootPath + bundle.bundleName, {version: bundle.version}, (err, loadedBundle) => {
                    if (err) {
                        // //console.error(err);
                        return reject(err);
                    }
    
                    if (loadedBundle) {
                        const assetPaths: [] = [];
                        loadedBundle.getDirWithPath("", AudioClip, assetPaths);
                        this.totalAsset = assetPaths.length;
                        // Load all assets in the bundle
                        const assetPromises = assetPaths.map(assetPath => {
                            return new Promise<void>((assetResolve, assetReject) => {
                                loadedBundle.load(assetPath, AudioClip, (err, loadedData) => {
                                    if (err) {
                                        ////console.error(err);
                                        return assetReject(err);
                                    }
                                    this.assetDictionary[assetPath.path] = loadedData;
                                    this.saveDataToDB(bundle.bundleName, assetPath.path, loadedData);
                                    this.SetLoadProgress(bundle.bundleName, this.loadedAsset + 1);
                                    assetResolve(); // Resolve the promise when asset is loaded
                                });
                            });
                        });
    
                        // Wait for all assets to be loaded
                        Promise.all(assetPromises)
                            .then(() => {
                                console.log(`Bundle ${bundle.bundleName} loaded successfully.`);
                                resolve(loadedBundle); // Resolve the outer promise once all assets are loaded
                            })
                            .catch(err => {
                                //console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
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

    protected override saveDataToDB(bundleName: string, path: any, audioClip: any): void {
        fetch(audioClip.nativeUrl)
            .then(response => response.arrayBuffer())
            .then(data => {
                // Decode the audio data into an AudioBuffer
                const reader = new FileReader();
                reader.readAsDataURL(new Blob([data], { type: "audio/wav" }));
                reader.onloadend = () => {
                    let dataToSave = {
                        id: path,
                        value: reader.result,
                        bundle: bundleName
                    }
                    DBController.instance.addData(dataToSave, bundleName);
                };
            })
            .catch(error => console.error('Failed to load audio:', error));
    }

    protected override getLocalData(bundle: BundleData): Promise<void> {
        return new Promise((resolve, reject) => {
            DBController.instance.getAllData(bundle.bundleName, (listData) => {
                listData = listData.filter(data => data.bundle == bundle.bundleName && data.id != bundle.bundleName)
                this.totalAsset = listData.length;
                const assetPromises = listData.map(data => {
                    return new Promise<void>((assetResolve, assetReject) => {
                        this.convertLocalData(data, (audio) => {
                            this.assetDictionary[data.id] = audio;
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
                        //console.error(`Error loading assets from bundle ${bundle.bundleName}`, err);
                        reject(err); // Reject if any asset fails to load
                    });
            })
        });
    }

    protected convertLocalData(data, callback) {
        assetManager.loadRemote(data.value, { ext: '.wav' }, (err, audioClip) => {
            if (err) {
                //console.error('Failed to load texture from data URL:', err);
                callback(null);
                return;
            }
            
            callback(audioClip);
        });
    }
}


