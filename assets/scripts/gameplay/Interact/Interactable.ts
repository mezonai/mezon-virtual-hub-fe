import { _decorator, Collider2D, Component, Contact2DType, Enum, EventKeyboard, Input, input, IPhysics2DContact, KeyCode, Node, RigidBody2D } from 'cc';
import { Constants } from '../../utilities/Constants';
import { KeyEnum } from '../../utilities/KeyBoardEnum';
import { PopupManager } from '../../PopUp/PopupManager';
import { BasePopup } from '../../PopUp/BasePopup';
import { UserManager } from '../../core/UserManager';
import { PlayerController } from '../player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Interactable')
export abstract class Interactable extends Component {
    @property(Collider2D)
    protected collider: Collider2D = null;
    @property({ type: Enum(KeyEnum) })
    protected interactKey: KeyEnum = KeyEnum.E;
    protected isPlayerNearby: boolean = false;
    protected noticePopup: BasePopup = null;
    protected collidingNodes: Set<Node> = new Set();
    protected nearbyPlayerNode: Node | null = null;

    onLoad() {
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        } else {
            console.warn('Collider is not assigned in ' + this.node.name);
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        input.off(Input.EventType.KEY_UP, this.onKeyDown, this);
    }

    protected onKeyDown(event: EventKeyboard): boolean {
        if (event.keyCode.toString() === this.interactKey.toString()) {
            const myPlayer = UserManager.instance.GetMyClientPlayer;
            if (this.isPlayerNearby && this.nearbyPlayerNode === myPlayer.node) {
                this.interact(myPlayer.myID);
            }
            return true;
        }
        return false;
    }


    protected canBeginContact(other: Node) {
        return true;
    }

    protected onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const otherNode = otherCollider.node;
        const myPlayer = UserManager.instance.GetMyClientPlayer;

        if (this.collidingNodes.has(otherNode) || this.noticePopup != null) return;
        this.collidingNodes.add(otherNode);
        const otherPlayerId = this.getPlayerIdFromNode(otherNode);
        const myId = myPlayer.myID;
        if ((otherNode.layer & Constants.PLAYER_LAYER) !== 0 && otherPlayerId === myId) {
            this.isPlayerNearby = true;
            this.nearbyPlayerNode = otherNode;
            this.handleBeginContact(selfCollider, otherCollider, contact);
        }
    }

    protected onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const otherNode = otherCollider.node;
        const myPlayer = UserManager.instance.GetMyClientPlayer;
        this.collidingNodes.delete(otherNode);

        if ((otherNode.layer & Constants.PLAYER_LAYER) !== 0) {
            const otherPlayerId = this.getPlayerIdFromNode(otherNode);
            const myId = myPlayer.myID;
            const isSamePlayer = otherPlayerId === myId;

            if (isSamePlayer) {
                this.isPlayerNearby = false;
                this.nearbyPlayerNode = null;
                this.handleEndContact(selfCollider, otherCollider, contact);
            }
        }
    }

    protected getPlayerIdFromNode(node: Node): string {
        const playerComp = node.getComponent(PlayerController) as any;

        return playerComp?.myID ?? "";
    }


    protected abstract interact(playerSessionId: string): void;
    protected async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) { }

    protected async handleEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.noticePopup?.node != null) {
            await PopupManager.getInstance().closePopup(this.noticePopup.node.uuid);
            this.noticePopup = null;
        }
    }
}