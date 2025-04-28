import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('VinhOfficeController')
export class VinhOfficeController extends MapManagerBase {
    getPositionPlayer(): Vec3 {
            return new Vec3(-75, -400, 0);
        }
}


