import { _decorator, Component, Node, Collider2D, Vec3, director } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
const { ccclass, property } = _decorator;

@ccclass('ColliderAutoUpdater')
export class ColliderAutoUpdater extends Component {
    private _prevNodePositions: Record<string, Vec3> = {};
    private _prevColliderWorldPositions: Record<string, Vec3> = {};

    start() {
        this.cacheNodePositions();
        director.on(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders, this);
        console.log(`[ColliderAutoUpdater] Started on node: ${this.node.name}`);
    }

    protected onDisable(): void {
        director.off(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders);
    }

    private cacheNodePositions() {
        const allChildren: Node[] = [];
        this.collectAllChildren(this.node, allChildren);

        for (const child of allChildren) {
            this._prevNodePositions[child.uuid] = child.getWorldPosition().clone();

            const collider = child.getComponent(Collider2D);
            if (collider) {
                const offset = collider.offset;
                const worldPos = child.getWorldPosition();
                const scale = child.getWorldScale();
                const colliderWorldPos = new Vec3(
                    worldPos.x + offset.x * scale.x,
                    worldPos.y + offset.y * scale.y,
                    worldPos.z
                );
                this._prevColliderWorldPositions[child.uuid] = colliderWorldPos.clone();
            }
        }
    }

    resetAllColliders() {
        console.log("=== resetAllColliders ===");
        const allChildren: Node[] = [];
        this.collectAllChildren(this.node, allChildren);

        for (const child of allChildren) {
            if (!child) continue;

            const collider = child.getComponent(Collider2D);
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

        // DEBUG: Log thay đổi vị trí node và collider
        for (const child of allChildren) {
            const prev = this._prevNodePositions[child.uuid];
            const now = child.getWorldPosition();
            const scale = child.getWorldScale();

            const collider = child.getComponent(Collider2D);
            if (collider) {
                const offset = collider.offset;
                const colliderWorldPos = new Vec3(
                    now.x + offset.x * scale.x,
                    now.y + offset.y * scale.y,
                    now.z
                );

                const prevColliderWorld = this._prevColliderWorldPositions[child.uuid];
                if (prevColliderWorld) {
                    const dx = colliderWorldPos.x - prevColliderWorld.x;
                    const dy = colliderWorldPos.y - prevColliderWorld.y;
                    const dz = colliderWorldPos.z - prevColliderWorld.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist > 0.5) {
                        console.warn(`[Collider Moved] ${child.name} Δx=${dx.toFixed(2)} Δy=${dy.toFixed(2)} Δz=${dz.toFixed(2)} → Δ=${dist.toFixed(2)}`);
                    }
                }

                // Log thông tin transform
                console.log(`[Collider] Node: ${child.name}`);
                console.log(`  Offset: ${offset.toString()}`);
                console.log(`  World Pos: ${now.toString()}`);
                console.log(`  World Scale: ${scale.toString()}`);
                console.log(`  Estimated Collider World Pos: ${colliderWorldPos.toString()}`);

                this._prevColliderWorldPositions[child.uuid] = colliderWorldPos.clone();
            }

            if (prev) {
                const dx = now.x - prev.x;
                const dy = now.y - prev.y;
                const dz = now.z - prev.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance > 0.5) {
                    console.warn(`[DEBUG] Node "${child.name}" moved: Δx=${dx.toFixed(2)}, Δy=${dy.toFixed(2)}, Δz=${dz.toFixed(2)}`);
                }
            }

            // Cập nhật lại vị trí node
            this._prevNodePositions[child.uuid] = now.clone();
        }
    }

    onCanvasResizeStart() {
        // Tắt hết collider khi bắt đầu resize
        const allChildren: Node[] = [];
        this.collectAllChildren(this.node, allChildren);
        for (const child of allChildren) {
            const collider = child.getComponent(Collider2D);
            if (collider && collider.enabled) {
                collider.enabled = false;
            }
        }
    }

    onCanvasResizeEnd() {
        // Bật collider và reset shape sau khi resize xong
        const allChildren: Node[] = [];
        this.collectAllChildren(this.node, allChildren);
        for (const child of allChildren) {
            const collider = child.getComponent(Collider2D);
            if (collider && !collider.enabled) {
                collider.enabled = true;
                if ('resetShape' in collider && typeof collider['resetShape'] === 'function') {
                    collider['resetShape']();
                }
            }
        }
    }


    private collectAllChildren(node: Node, result: Node[]) {
        result.push(node);
        for (const child of node.children) {
            this.collectAllChildren(child, result);
        }
    }
}
