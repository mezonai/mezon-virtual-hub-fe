import { _decorator, Component, Node, Input, input, director, Vec3, PhysicsSystem2D, EPhysics2DDrawFlags, RigidBody2D, Vec2 } from 'cc';
import { EVENT_NAME } from '../network/APIConstant';
import { UserManager } from '../core/UserManager';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('ColliderAutoUpdater')
export class ColliderAutoUpdater extends Component {

    @property(Node) colliderParent: Node | null = null;

    private resizeDebounceTimer: any = null;

    start() {
        director.on(EVENT_NAME.CANVAS_RESIZE, this.onCanvasResize, this);
        //input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    protected onDisable(): void {
        director.off(EVENT_NAME.CANVAS_RESIZE, this.onCanvasResize, this);
        //input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this.unscheduleAllCallbacks();
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
        }
    }

    onCanvasResize() {
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
        }
        this.resizeDebounceTimer = setTimeout(() => {
            this.resetAllColliders();
            this.resetBox();
        }, 0);
    }

    // onMouseUp() {
    //     this.schedule(() => {
    //         this.resetBox();
    //     }, 0);
    // }

    resetBox() {
        if (!this.colliderParent) return;
        if (this.colliderParent.active) return;
        this.scheduleOnce(() => {
            if (!this.colliderParent) return;
            this.colliderParent.active = true;
            const player = UserManager.instance.GetMyClientPlayer;
            if (player != null) {
                console.log("startMove");
                player.get_MoveAbility.startMove();
            }
        }, 0);
    }

    resetAllColliders() {
        if (!this.colliderParent) return;
        this.colliderParent.active = false;
        const player = UserManager.instance.GetMyClientPlayer;
        if (player != null) {
            console.log("StopMove");
            player.get_MoveAbility.StopMove();
        }
    }
}