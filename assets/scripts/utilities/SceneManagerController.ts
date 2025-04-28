import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SceneManagerController')
export class SceneManagerController {
    private static sceneParams: any = null;

    public static async preLoadScene<T>(sceneName: string, param?: T) {
        this.sceneParams = param || null;
        return new Promise((resolve, reject) => {
            director.preloadScene(sceneName, (err) => {
                if (err) {
                    console.error("Failed to preload scene:", err);
                } else {
                    resolve(sceneName);
                }
            });
        })
    }

    public static async loadScene(sceneName: string, param) {
        if (param != null) {
            this.sceneParams = param || null;
        }
        director.loadScene(sceneName);
    }

    public static getSceneParam<T>(): T | null {
        const param = this.sceneParams as T;
        this.sceneParams = null;
        return param;
    }
}


