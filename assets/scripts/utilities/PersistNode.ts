import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PersistNode')
export class PersistNode extends Component {
    protected onLoad(): void {
        director.addPersistRootNode(this.node);
    }
}


