import { _decorator, Component, director, game, JsonAsset, PhysicsSystem2D, ResolutionPolicy, resources, view } from 'cc';
const { ccclass, property } = _decorator;
import { UserManager } from './UserManager';
import { GameManager } from './GameManager';
import { ResourceManager } from './ResourceManager';
import { UIManager } from './UIManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { OfficeSceneController } from '../GameMap/OfficeScene/OfficeSceneController';
import { EVENT_NAME } from '../network/APIConstant';
import { UserMeManager } from './UserMeManager';
import { Constants } from '../utilities/Constants';

@ccclass('GameplayRoot')
export class GameplayRoot extends Component {
    private totalCoreNeedLoad = 3;
    private _loadedCore = 0;

    private get loadedCore() {
        return this._loadedCore;
    }

    private set loadedCore(value) {
        this._loadedCore = value;

        if (value == this.totalCoreNeedLoad) {
            this.initGameComponent();
            WebRequestManager.instance.toggleLoading(false);
        }
    }

    protected start() {
        if (!ResourceManager.instance) {
            director.loadScene("GameMap");
            return;
        }
        this.init();
        PhysicsSystem2D.instance.enable = true;
    }

    protected onDestroy(): void {
        if (UserMeManager.Get) {
            UserMeManager.PlayerProperty.offAllChange("gold")
        }
    }

    private async init() {
        this.loadedCore = 0;
        WebRequestManager.instance.toggleLoading(true);
        UIManager.Instance.init();
        await UserManager.instance.init();
        await this.loadMapUntilSuccess();
        this.initDataFromAPI();
    }

    private initGameComponent() {
        if (ResourceManager.instance.PetData) {
            OfficeSceneController.instance.spawnPet(ResourceManager.instance.PetData);
        }
        let component = this.node.getComponent(GameManager);
        component.init();
        game.emit(EVENT_NAME.ON_OFFICE_SCENE_LOADED);
    }

    private initDataFromAPI() {
        WebRequestManager.instance.getAllItem((respone) => { this.onGetAllItem(respone) }, (error) => { this.onApiError(error); });
        WebRequestManager.instance.getAllItemFood((respone) => { this.onGetAllFood(respone) }, (error) => { this.onApiError(error); });
        WebRequestManager.instance.getAllPetData(OfficeSceneController.instance.nameCode, (respone) => { this.onGetAllPetData(respone) }, (error) => { this.onApiError(error); });
    }

    private onGetAllPetData(respone) {
        ResourceManager.instance.PetData = respone.data;
        this.loadedCore++;
    }

    private onGetAllItem(respone) {
        ResourceManager.instance.ItemData = respone;
        this.loadedCore++;
    }

    private onGetAllFood(respone) {
        ResourceManager.instance.FoodData = respone;
        this.loadedCore++;
    }

    private onApiError(error) {
        Constants.showConfirm(error.error_message, "Waning");
    }

    async loadMapUntilSuccess(delay = 1000) {
    while (true) {
        const success = await OfficeSceneController.instance.LoadData();
        if (success) break;
        console.warn("Thử lại LoadData sau 1 giây...");
        await new Promise(res => setTimeout(res, delay));
    }
}
}


