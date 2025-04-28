import { _decorator, CCFloat, Component, EventKeyboard, Input, input, KeyCode, Vec3, Node, BoxCollider2D, Contact2DType, CCString, tween, PhysicsSystem2D, Vec2, Graphics, RigidBody2D, ERigidBody2DType, EventTouch, find, misc, debug, Collider2D, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { MoveAbility } from './ability/MoveAbility';

@ccclass('PlayerController')
export class PlayerController extends Component {
    private room: Colyseus.Room<any>;
    @property({ type: CCString }) myID: string = "";
    private rigidbody = false;
    private _body: RigidBody2D | null = null;
    @property({ type: BoxCollider2D }) collider: BoxCollider2D | null = null;
    @property({ type: MoveAbility}) moveAbility: MoveAbility = null;

    private get isMyClient() {
        if (this.room == null || this.myID == "")
            return false;

        return this.room.sessionId == this.myID
    }

    public init(sessionId, room) {
        this.room = room;
        this.myID = sessionId;

        if (this.rigidbody) {
            this._body = this.node.getComponent(RigidBody2D);
        }
        console.log(`Player ${sessionId}`);
        this.getCollider();
        this.moveAbility.init(sessionId, room);
    }

    getCollider(){
        this.collider = this.getComponent(BoxCollider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    public removePlayer() {
        this.node.destroy();
    }

    public updateRemotePosition(data) {
        if (this.isMyClient) return;
        
        this.moveAbility.updateRemotePosition(data);
    }

    private onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name === "Player") {
            this.collider.enabled = false;
        }
    }

    private onEndContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name === "Player") {
            this.collider.enabled = false;
        }
    }
}