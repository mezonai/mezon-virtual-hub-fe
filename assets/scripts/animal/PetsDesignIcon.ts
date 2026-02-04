import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PetsDesignIcon')
export class PetsDesignIcon extends Component {
    @property({ type: [Node] }) petImage: Node[] = [];

    private capitalizeFirstLetter(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    setActivePetByName(name: string) {
        const normalizedName = this.capitalizeFirstLetter(name);
        for (let node of this.petImage) {
            node.active = node.name === normalizedName;
        }
    }

}