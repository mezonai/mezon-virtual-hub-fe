import { _decorator, Component, Node, Collider, Collider2D, BoxCollider, SphereCollider, CapsuleCollider, PhysicsSystem, Vec3, director, Input, input } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
import { UserManager } from '../core/UserManager';
const { ccclass, property } = _decorator;

@ccclass('ColliderAutoUpdater')
export class ColliderAutoUpdater extends Component {

    @property(Node) colliderParent: Node | null = null;

    start() {
        director.on(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders, this);
        input.on(Input.EventType.MOUSE_UP, this.onKeyUp, this);
    }

    protected onDisable(): void {
        director.off(EVENT_NAME.CANVAS_RESIZE, this.resetAllColliders);
        input.off(Input.EventType.MOUSE_UP, this.onKeyUp, this);
        this.unscheduleAllCallbacks();
    }

    onKeyUp() {
        this.schedule(() => {
            this.resetBox();
        }, 0)
    }

    resetBox() {
        if (!this.colliderParent) return;
        if (this.colliderParent.active) return;
        this.scheduleOnce(() => {
            if (!this.colliderParent) return;
            this.colliderParent.active = true;
            UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        }, 0);
    }


    resetAllColliders() {
        if (!this.colliderParent) return;
        this.colliderParent.active = false;
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
    }
}