import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('HaNoi1OfficeController')
export class HaNoi1OfficeController extends MapManagerBase {
    getPositionPlayer(): Vec3 {
        return new Vec3(72, -950, 0);
    }
}


