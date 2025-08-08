import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PetsDesignIcon')
export class PetsDesignIcon extends Component {
    @property({ type: [Node] }) petImage: Node[] = [];

    setActivePetByName(name: string) {
        for (let node of this.petImage) {
            node.active = node.name === name;
        }
    }
}