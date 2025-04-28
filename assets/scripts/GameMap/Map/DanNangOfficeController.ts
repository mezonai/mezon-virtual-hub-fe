import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('DanNangOfficeController')
export class DanNangOfficeController extends MapManagerBase {
    getPositionPlayer(): Vec3 {
            return new Vec3(224, -620, 0);
        }
}


