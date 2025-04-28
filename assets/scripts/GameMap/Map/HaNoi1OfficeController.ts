import { _decorator, Component, Node, Vec3 } from 'cc';
import { MapManagerBase } from './MapManagerBase';
const { ccclass, property } = _decorator;

@ccclass('HaNoi1OfficeController')
export class HaNoi1OfficeController extends MapManagerBase {
    @property({type: Node}) meetingDoor: Node = null;
    getPositionPlayer(): Vec3 {
        return new Vec3(0, -920, 0);
    }

    protected start(): void {
        this.meetingDoor.active = false;
    }
}


