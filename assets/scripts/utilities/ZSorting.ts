import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSorting')
export class ZSorting extends Component {
    @property({type: [UITransform]}) renderNode: UITransform[] = [];

    protected update(dt: number): void {
        this.renderNode.forEach(renderer => {
            renderer.priority = -renderer.node.worldPosition.y;
        });
    }
}


