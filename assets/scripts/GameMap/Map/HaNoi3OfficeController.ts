import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('HaNoi3OfficeController')
export class HaNoi3OfficeController extends MapManagerBase {
    
    getPositionPlayer(): Vec3 {
        return new Vec3(55, 272, 0);
    }
}


