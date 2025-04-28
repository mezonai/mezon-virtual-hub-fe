import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('QuyNhonOfficeController')
export class QuyNhonOfficeController extends MapManagerBase {
    getPositionPlayer(): Vec3 {
        return new Vec3(-532, -484, 0);
    }
}


