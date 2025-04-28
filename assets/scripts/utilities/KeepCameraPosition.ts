import { _decorator, Component, Node, Camera, view, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("KeepCameraPosition")
export class KeepCameraPosition extends Component {
    @property(Camera)
    mainCamera: Camera = null;
}
