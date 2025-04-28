import { _decorator, Collider2D, Component, IPhysics2DContact, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColliderListener')
export class ColliderListener extends Component {

    onCollisionEnter(other: Collider2D, self: Collider2D) {
        console.log('Collision entered with', other.node.name);
    }

    onCollisionStay(other: Collider2D, self: Collider2D) {
        console.log('Collision staying with', other.node.name);
    }

    onCollisionExit(other: Collider2D, self: Collider2D) {
        console.log('Collision exited with', other.node.name);
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log(otherCollider)
    }
}


