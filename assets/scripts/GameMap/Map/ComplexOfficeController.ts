import { _decorator, Component, debug, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
import { OfficePosition } from '../OfficePosition';
import { RoomType } from '../RoomType';
import { UserManager } from '../../core/UserManager';
const { ccclass, property } = _decorator;

@ccclass('ComplexOfficeController')
export class ComplexOfficeController extends MapManagerBase {

    getPositionPlayer(office: OfficePosition,roomStart:  RoomType): Vec3 {
        if(roomStart == RoomType.OFFICE){
            return new Vec3(920, -233, 0);
        }
        else if (roomStart == RoomType.SHOP1){
            return new Vec3(555, -234, 0);
        }
        else if(roomStart == RoomType.FARM){
            return new Vec3(1570, -345, 0);
        }
        else  return UserManager.instance.GetMyClientPlayer.node.position;    
    }
}


