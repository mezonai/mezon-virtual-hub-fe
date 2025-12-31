import { _decorator, Component, Node, Button, Prefab, instantiate } from 'cc';
import { OfficeSenenParameter } from './OfficeSenenParameter';
import { UserManager } from '../../core/UserManager';
import { SceneManagerController } from '../../utilities/SceneManagerController';
import { SceneName } from '../../utilities/SceneName';
import { ServerManager } from '../../core/ServerManager';
import { OfficePosition, Season } from '../OfficePosition';
import { MapManagerBase } from '../Map/MapManagerBase';
import { ResourceManager } from '../../core/ResourceManager';
import { UserMeManager } from '../../core/UserMeManager';
import { RoomType } from '../RoomType';
import { Constants } from '../../utilities/Constants';
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
    @property(Prefab)
    mapLunarNewYear: Prefab[] = [];
    @property(Node)
    mapParent: Node = null;
    @property currentMap: MapManagerBase = null;
    nameCode: string = "";
    @property({ type: Node }) effectLunaNewYear: Node = null;
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
            let nameRoom = this.convertNameRoom(param.idclan, param.roomEnds);
            const map = this.createMap(nameRoom, param.currentOffice);
            map.setParent(this.mapParent);
            let mapManager = map.getComponent("MapManagerBase") as MapManagerBase;
            if (mapManager) {
                this.currentMap = mapManager;
                mapManager.setCurrentOffice(param, param.currentOffice, param.roomStart);
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
        UserMeManager.CurrentOffice = param;
        UserMeManager.CurrentRoomType = param.roomStart;
        return true;
    }

    private createMap(nameRoom: string, currentOffice: number) {
        const isFarm = nameRoom.includes('-farm');
        const isOffice = nameRoom.includes('-office');
        const isLNY = Constants.season === Season.LUNARNEWYEAR;
        this.effectLunaNewYear.active = false;
        if (isLNY && (isFarm || !isOffice)) {
            this.effectLunaNewYear.active = true;
            return instantiate(
                isFarm
                    ? this.mapLunarNewYear[1]
                    : this.mapLunarNewYear[0]
            );
        }
        return instantiate(
            this.mapOffice[this.getOffice(currentOffice, nameRoom)]
        );
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
        else if (nameRoom.includes("-farm")) {
            return 9;
        }
        else {
            return 1;
        }
    }

    convertNameRoom(idclan: string, roomType: RoomType): string {
        let suffix = "";

        switch (roomType) {
            case RoomType.OFFICE:
                suffix = "-office";
                break;
            case RoomType.SHOP1:
            case RoomType.SHOP2:
                suffix = "-shop1";
                break;
            case RoomType.FARM:
                suffix = "-farm";
                break;
            case RoomType.MEETING:
                suffix = "-office-meeting-room1";
                break;
            default:
                suffix = "";
                break;
        }

        return `${idclan}${suffix}`;
    }
}


