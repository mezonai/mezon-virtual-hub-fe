import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('UserManager')
export class UserManager extends Component {
    private static _instance: UserManager;
    public static get instance() {
        return UserManager._instance;
    }
    @property({ type: Prefab }) playerPrefab: Prefab = null;
    @property({ type: Node }) playerParent: Node = null;
    private players: Map<string, PlayerController> = new Map();

    protected onLoad(): void {
        if (UserManager._instance == null) {
            UserManager._instance = this;
        }
    }

    protected onDestroy(): void {
        UserManager._instance = null;
    }

    public async init() {

    }
    
    public createPlayer(sessionId: string, room, x: number, y: number) {
        const playerNode = instantiate(this.playerPrefab);
        playerNode.setPosition(new Vec3(x, y, 0));
        playerNode.setParent(this.playerParent);
        this.players.set(sessionId, playerNode.getComponent(PlayerController));

        playerNode.getComponent(PlayerController).init(sessionId, room);
    }

    public onRemove(player, sessionId) {
        if (this.players.has(sessionId)) {
            let player = this.players.get(sessionId);
            player.removePlayer();
        } else {
            console.warn(`No player found with sessionId: ${sessionId}`);
        }
    }
    
    public onMessagePosition(data) {
        const { id } = data;
        if (this.players.has(id)) {
            this.players.get(id).updateRemotePosition(data);
        }
    }
}


