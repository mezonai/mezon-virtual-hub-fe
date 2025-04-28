import { _decorator, Component, Node, Vec3 } from 'cc';
import { OfficePosition } from '../OfficePosition';
import { SceneManagerController } from '../../utilities/SceneManagerController';
import { UserManager } from '../../core/UserManager';
import { MapManagerBase } from './MapManagerBase';
import { RoomType } from '../RoomType';
const { ccclass, property } = _decorator;

@ccclass('ShopMapController')
export class ShopMapController extends MapManagerBase {
    getPositionPlayer(): Vec3 {
        return new Vec3(0, -301, 0);
    }
}


