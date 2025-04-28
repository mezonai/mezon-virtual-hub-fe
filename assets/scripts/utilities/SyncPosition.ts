import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SyncPosition')
export class SyncPosition extends Component {
    @property({type: Vec3}) offset: Vec3 = new Vec3();
    public target: Node = null;

    public setData(target, offset) {
        this.offset = offset;
        this.target = target;
    }
    
    protected update(dt: number): void {
        if (this.target == null) return;

        this.node.position = this.offset.clone();
        this.node.scale = this.target.scale.clone();
    }
}


