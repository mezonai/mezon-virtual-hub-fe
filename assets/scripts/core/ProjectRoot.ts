import { _decorator, Component, JsonAsset, resources } from 'cc';
const { ccclass, property } = _decorator;
import { APIConfig } from '../network/APIConstant';
import { ServerManager } from './ServerManager';
import { UserManager } from './UserManager';

@ccclass('ProjectRoot')
export class ProjectRoot extends Component {
    protected start() {
        this.init();
    }

    private async init() {
        await this.loadConfig();
        await ServerManager.instance.init();
        await UserManager.instance.init();
    }

    private async loadConfig() {
        return new Promise<void>((resolve, reject) => {
            resources.load("config", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error("Failed to load config:", err);
                    reject();
                    return;
                }
                const config = jsonAsset.json;
                APIConfig.websocketPath = `${config.websocketDomain}:${config.websocketPort}`;
                APIConfig.apiPath = `${config.schema}://${config.apiDomain}:${config.apiPort}`;
                console.log("Config Loaded!");
                resolve();
            });
        })
    }
}


