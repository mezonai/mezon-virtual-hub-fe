import { _decorator, CCString, Component, Node } from 'cc';
import { AnimationController } from '../AnimationController';
import { UserManager } from '../../../core/UserManager';
import { PlayerController } from '../PlayerController';
const { ccclass, property } = _decorator;

@ccclass('Ability')
export abstract class Ability extends Component {
    @property({ type: AnimationController }) animationController: AnimationController = null;
    @property({ type: CCString }) myID: string = "";

    protected room: Colyseus.Room<any>;
    protected playerController: PlayerController = null;

    public init(sessionId, playerController, room) {
        this.playerController = playerController;
        this.room = room;
        this.myID = sessionId;
    }

    protected get isMyClient() {
        if (this.room == null || this.myID == "")
            return false;

        return this.room.sessionId == this.myID
    }

    
    protected get InteractTarget(): Node {
        if (UserManager.instance?.GetMyClientPlayer != null) {
            return UserManager.instance.GetMyClientPlayer.node;
        }

        return null;
    }
}


