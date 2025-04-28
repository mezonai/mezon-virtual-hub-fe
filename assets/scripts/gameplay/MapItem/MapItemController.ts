import { _decorator, BoxCollider2D, CCBoolean, CCString, Collider2D, Node, Enum, IPhysics2DContact, RigidBody2D } from "cc";
import { Interactable } from "../Interact/Interactable";
import { PopupManager } from "../../PopUp/PopupManager";
import { InteracterLabel } from "../../PopUp/InteracterLabel";
import { InteractMessageMapping, MapItemAction, MapItemType } from "./MapItemEnum";
import { UserManager } from "../../core/UserManager";
import { PlayerController } from "../player/PlayerController";
import { SyncPosition } from "../../utilities/SyncPosition";
import { ServerManager } from "../../core/ServerManager";
import { EVENT_NAME } from "../../network/APIConstant";

const { ccclass, property } = _decorator;

@ccclass('MapItemController')
export class MapItemController extends Interactable {
    private room: Colyseus.Room<any>;
    @property({ type: CCString }) myID: string = "";
    @property({ type: Node }) useItemAnchor: Node = null;
    @property({ type: CCBoolean }) isUpdatePlayerPosition: boolean = false;
    @property({ type: CCBoolean }) isUpdateMyPosition: boolean = false;
    @property({ type: Enum(MapItemType) }) type: MapItemType = MapItemType.GOKART;
    @property({ type: SyncPosition }) syncPosition: SyncPosition = null;
    @property({ type: RigidBody2D }) rigidBody: RigidBody2D = null;
    protected tempPopup = null;

    private originParent: Node = null;
    protected currentPlayer: PlayerController = null;
    private ownerIdCache: string = "";

    public async init(sessionId, room, ownerId = "") {
        this.room = room;
        this.myID = sessionId;
        this.originParent = this.node.parent;

        if (ownerId != "") {
            this.ownerIdCache = ownerId;
            ServerManager.instance.node.on(EVENT_NAME.ON_PLAYER_ADDED, (playerId) => {
                this.onPlayerAdded(playerId);
            });
        } 
    }

    private onPlayerAdded(playerId: string) {
        if (playerId == this.ownerIdCache) {
            let isUpdatePlayerPositionTemp = this.isUpdatePlayerPosition;
            let isUpdateMyPositionTemp = this.isUpdateMyPosition;
            this.isUpdatePlayerPosition = false;
            this.isUpdateMyPosition = true;
            this.useItem(playerId);
            this.ownerIdCache = "";
            this.isUpdatePlayerPosition = isUpdatePlayerPositionTemp;
            this.isUpdateMyPosition = isUpdateMyPositionTemp;
        }
    }

    protected override async interact(playerSessionId: string = "") {
        if (this.currentPlayer != null) {
            return;
        }
        
        ServerManager.instance.playerUseItem(this.myID, UserManager.instance.GetMyClientPlayer.myID);
    }

    public async useItem(playerSessionId: string) {
        if (playerSessionId == "") {
            this.node.setParent(this.originParent, true);
            this.rigidBody.enabled = true;
            this.currentPlayer = null;
            if (this.syncPosition) {
                this.syncPosition.target = null;
            }

            if (this.tempPopup?.node) {
                PopupManager.getInstance().closePopup(this.tempPopup.node.uuid);
                this.tempPopup = null;
            }
        }
        else {
            this.rigidBody.enabled = false;

            if (this.isUpdatePlayerPosition) {
                this.forceUpdatePlayerPos(playerSessionId);
            }
            else if (this.isUpdateMyPosition) {
                this.forceUpdateMyPos(playerSessionId);
            }

            if (this.syncPosition && this.currentPlayer) {
                this.syncPosition.setData(this.currentPlayer.node, this.useItemAnchor.position.clone());
            }
        }
    }

    protected override canBeginContact(other: Node) {
        return !UserManager.instance.GetMyClientPlayer.IsHasAttachItem;
    }

    protected canShowPopup(): boolean {
        return this.noticePopup == null && this.currentPlayer == null;
    }

    protected override async handleBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.canShowPopup()) {
            this.noticePopup = await PopupManager.getInstance().openPopup('InteracterLabel', InteracterLabel, {
                keyBoard: String.fromCharCode(this.interactKey),
                action: InteractMessageMapping[this.type + MapItemAction.NOTICE]
            });
        }
    }

    protected forceUpdatePlayerPos(playerSessionId: string) {
        UserManager.instance.forceUpdateMyPlayerPosition(playerSessionId, this.useItemAnchor.worldPosition.clone());
        this.attachToPlayer(playerSessionId);
    }

    protected forceUpdateMyPos(playerSessionId: string) {
        this.attachToPlayer(playerSessionId);
    }

    protected attachToPlayer(playerSessionId: string) {
        this.currentPlayer = UserManager.instance.attachItemToPlayer(playerSessionId, this.node);
        // this.node.saetPosition(this.useItemAnchor.position.clone());
    }
}