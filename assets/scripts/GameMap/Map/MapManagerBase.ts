import { _decorator, Component, Node, RichText, Vec2, Vec3 } from 'cc';
import { InteractTeleport } from '../../gameplay/Interact/InteractTeleport';
import { OfficePosition } from '../OfficePosition';
import { RoomType } from '../RoomType';
import { UserManager } from '../../core/UserManager';
import { AnimalSpawner } from '../../animal/AnimalSpawner';
import { Constants } from '../../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('MapManagerBase')
export abstract class MapManagerBase extends Component {
    @property([InteractTeleport])
    interactTeleports: InteractTeleport[] = [];
    @property({type: Node}) minBorder: Node = null;
    @property({type: Node}) maxBorder: Node = null;
    @property({type: RichText}) mapName: RichText = null;
    @property animalSpawner: AnimalSpawner = null;

    public get AnimalSpawner() {
        if (!this.animalSpawner) {
            this.animalSpawner = this.node.getComponentInChildren(AnimalSpawner);
        }

        return this.animalSpawner;
    }

    startRoom: RoomType = RoomType.NONE;
    public setCurrentOffice(office: OfficePosition, startRoom: RoomType) {    
        if (this.mapName) {
            this.mapName.string = Constants.convertNameOffice(office)  
        }
        for (const teleport of this.interactTeleports) {
            teleport.currentOffice = office;
            console.log("curr: ", teleport.currentOffice);
        }
        this.startRoom =  startRoom;
        this.updatePositionPlayer(office, startRoom);
    }
    
    async updatePositionPlayer(office: OfficePosition, startRoom: RoomType){     
        if(startRoom == RoomType.NONE) return;/// Nếu di chuyển vào phòng auto load thì không cần set lại vị trí player
        await this.waittingLoadPlayer();
        UserManager.instance.GetMyClientPlayer.node.setPosition(this.getPositionPlayer(office, startRoom));
            
    }    

    public waittingLoadPlayer() : Promise<void> {
        return new Promise((resolve) => {
            const intervalTime = 100; 
            const checkInterval = setInterval(() => {
                if (UserManager.instance.GetMyClientPlayer) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, intervalTime);
        });
    }

    abstract getPositionPlayer(office: OfficePosition,roomStart:  RoomType): Vec3

}


