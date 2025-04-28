import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('HaNoi2OfficeController')
export class HaNoi2OfficeController extends MapManagerBase {

    getPositionPlayer(): Vec3 {
        return new Vec3(-1050, 605, 0);
    }
}



