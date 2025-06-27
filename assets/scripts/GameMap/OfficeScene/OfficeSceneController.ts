import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { OfficeSenenParameter } from './OfficeSenenParameter';
import { UserManager } from '../../core/UserManager';
import { SceneManagerController } from '../../utilities/SceneManagerController';
import { SceneName } from '../../utilities/SceneName';
import { ServerManager } from '../../core/ServerManager';
import { OfficePosition } from '../OfficePosition';
import { MapManagerBase } from '../Map/MapManagerBase';
import { ResourceManager } from '../../core/ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('OfficeSceneController')
export class OfficeSceneController extends Component {
    private static _instance: OfficeSceneController;
    public static get instance() {
        return OfficeSceneController._instance;
    }
    @property(Button)
    backMapButton: Button;
    @property(Prefab)
    mapOffice: Prefab[] = [];
    @property(Node)
    mapParent: Node = null;
    @property currentMap: MapManagerBase = null;
    nameCode: string = "";
    protected onLoad(): void {
        if (OfficeSceneController._instance == null) {
            OfficeSceneController._instance = this;
        }
    }

    protected onDestroy(): void {
        OfficeSceneController._instance = null;
    }
    public async LoadData(): Promise<boolean> {
        const param = SceneManagerController.getSceneParam<OfficeSenenParameter>();
        if (param != null) {
            let nameRoom = this.nameCode = param.nameRoomServer;
            let map = instantiate(this.mapOffice[this.getOffice(param.currentOffice, nameRoom)]);
            map.setParent(this.mapParent);
            let mapManager = map.getComponent("MapManagerBase") as MapManagerBase;
            if (mapManager) {
                this.currentMap = mapManager;
                console.log("MapManagerBase found:", mapManager);
                mapManager.setCurrentOffice(param.currentOffice, param.roomStart);
            } else {
                console.error("MapManagerBase not found on instantiated map!");
                return false;
            }
            await ServerManager.instance.init(nameRoom);
        }
        else {
            console.log("No data received.");
        }
        this.backMapButton.node.on(Button.EventType.CLICK, async () => {
            const param = { isBackMap: true };
            UserManager.instance.GetMyClientPlayer.leaveRoom(() => {
                SceneManagerController.loadScene(SceneName.SCENE_GAME_MAP, param)
            });

        });
        return true;
    }

    public spawnPet(data) {
        if (this.currentMap?.AnimalSpawner?.spawnZones.length > 0) {
            this.currentMap.AnimalSpawner.spawnPet(data);
        }
    }

    getOffice(brach: OfficePosition, nameRoom: string): number {
        if (nameRoom.includes("-office")) {
            switch (brach) {
                case OfficePosition.HANOI1:
                    return 2;
                case OfficePosition.HANOI2:
                    return 3;
                case OfficePosition.HANOI3:
                    return 4;
                case OfficePosition.VINH:
                    return 5;
                case OfficePosition.DANANG:
                    return 6;
                case OfficePosition.QUYNHON:
                    return 7;
                case OfficePosition.SAIGON:
                    return 8;
            }
        }
        else if (nameRoom.includes("-shop")) {
            return 0;
        }
        else {
            return 1;
        }
    }
}


