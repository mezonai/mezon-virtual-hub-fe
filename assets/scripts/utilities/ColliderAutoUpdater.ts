import { _decorator, Component, Node, Collider, Collider2D, BoxCollider, SphereCollider, CapsuleCollider, PhysicsSystem, Vec3, director } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
const { ccclass, property } = _decorator;

@ccclass('ColliderAutoUpdater')
export class ColliderAutoUpdater extends Component {
    start () {
        director.on(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders, this);
    }

    protected onDisable(): void {
        director.off(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders);
    }

    resetAllColliders () {
        const allChildren: Node[] = [];
        this.collectAllChildren(this.node, allChildren);
    
        for (const child of allChildren) {
            if (!child) continue;
    
            const colliders = [
                child.getComponent(Collider2D),
            ];
    
            for (const collider of colliders) {
                if (!collider || !collider.enabled) continue;
    
                try {
                    if ('resetShape' in collider && typeof collider['resetShape'] === 'function') {
                        collider['resetShape']();
                    } else {
                        collider.enabled = false;
                        collider.enabled = true;
                    }
                } catch (err) {
                    console.warn(`[ColliderAutoUpdater] Failed to reset collider on node ${child.name}:`, err);
                }
            }
        }
    }
    
    private collectAllChildren (node: Node, result: Node[]) {
        result.push(node);
        for (const child of node.children) {
            this.collectAllChildren(child, result);
        }
    }
}