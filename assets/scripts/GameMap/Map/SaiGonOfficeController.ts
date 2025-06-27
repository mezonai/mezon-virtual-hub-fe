import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
import { OfficePosition } from '../OfficePosition';
import { RoomType } from '../RoomType';
const { ccclass, property } = _decorator;

@ccclass('SaiGonOfficeController')
export class SaiGonOfficeController extends MapManagerBase {
    getPositionPlayer(office: OfficePosition,roomStart:  RoomType): Vec3 {
        return new Vec3(627, 81, 0);   
    }
    protected start(): void {
        
    }
}


