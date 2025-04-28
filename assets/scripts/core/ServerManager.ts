import { _decorator, Component, instantiate, JsonAsset, log, Node, Prefab, resources, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { PlayerController } from '../gameplay/player/PlayerController';
import { APIConfig } from '../network/APIConstant';
import { UserManager } from './UserManager';

@ccclass('ServerManager')
export class ServerManager extends Component {
    private static _instance: ServerManager;
    public static get instance() {
        return ServerManager._instance;
    }

    private client: Colyseus.Client;
    private room: Colyseus.Room<any>;

    protected onLoad(): void {
        if (ServerManager._instance == null) {
            ServerManager._instance = this;
        }
    }

    protected onDestroy(): void {
        ServerManager._instance = null;
    }

    public async init() {
        this.connectToServer();
    }

    private async connectToServer() {
        try {
            console.log(APIConfig.websocketPath)
            this.client = new Colyseus.Client(APIConfig.websocketPath);
            log("Connecting to Colyseus server...");
            this.joinRoom();
        } catch (error) {
            log("Connection error:", error);
        }
    }

    public async joinRoom() {
        // Join or create a room
        this.room = await this.client.joinOrCreate("my_room");
        log(`Joined room: ${this.room.id}`);

        // Listen for messages from the server
        this.room.onMessage("move", (message) => {
            log(`Received move message:`, message);
        });

        // Listen for state changes
        this.room.onStateChange((state) => {
            // log("Game State Updated:", state);

            // console.log(state.players)
        });

        this.room.state.players.onAdd((player, sessionId) => {
            log(`👤 New player joined: ${sessionId}`, player);
            UserManager.instance.createPlayer(sessionId, this.room, player.x, player.y);
        });

        this.room.state.players.onRemove((player, sessionId) => {
            log(`❌ Player left: ${sessionId}`);
            UserManager.instance.onRemove(player, sessionId);
        });

        this.room.onMessage("updatePosition", (data) => {
            UserManager.instance.onMessagePosition(data);
        });

        // Handle disconnection
        this.room.onLeave((code) => {
            log(`Disconnected from room. Code: ${code}`);
        });
    }



}


