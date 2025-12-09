import { _decorator, Component, debug, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
import { OfficePosition } from '../OfficePosition';
import { RoomType } from '../RoomType';
const { ccclass, property } = _decorator;

@ccclass('FarmMapController')
export class FarmMapController extends MapManagerBase {

    getPositionPlayer(office: OfficePosition,roomStart:  RoomType): Vec3 {
        return new Vec3(-1348, -345, 0);    
    }
}


