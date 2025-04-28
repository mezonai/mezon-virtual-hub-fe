import { _decorator, Component, Node } from 'cc';
import { SceneManagerController } from '../utilities/SceneManagerController';
import { WebRequestManager } from '../network/WebRequestManager';
import { APIConfig } from '../network/APIConstant';
import { UserMeManager } from '../core/UserMeManager';
import { GameMapController } from './GameMapController';
const { ccclass, property } = _decorator;

@ccclass('ShowSceneManager')

export class ShowSceneManager extends Component {
    @property(Node)
    panelLogin: Node = null;
    @property(Node)
    office: Node = null;
    @property(GameMapController)
    gameMap: GameMapController = null;
    async start() {
        const param = SceneManagerController.getSceneParam<{ params: any }>();
        if (param) {
            this.OpenGameMap(true);
        } else {
            await this.CheckShowScene();
        }
    }

    private async CheckShowScene() {
        this.panelLogin.active = true;
        await new Promise<void>(resolve => {
            const checkToken = () => {
                if (APIConfig.token && APIConfig.token.trim() !== "") {
                    console.log("✅ Token is available:", APIConfig.token);
                    resolve();
                } else {
                    setTimeout(checkToken, 100);
                }
            };
            checkToken();
        });
        await new Promise<void>(resolve => {
            const checkLoadUser = () => {
                if (UserMeManager.Get) {
                    this.OpenGameMap(false);
                    resolve();
                } else {
                    setTimeout(checkLoadUser, 100);
                }
            };
            checkLoadUser();
        });       
    }

    private OpenGameMap(isBackMap: boolean) {       
        this.gameMap.isBackMap = isBackMap;
        this.office.active = true;
    }
}


