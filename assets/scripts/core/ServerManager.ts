import { _decorator, Component, log, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus, { Room } from 'db://colyseus-sdk/colyseus.js';
import { UserManager } from './UserManager';
import { APIConfig, EVENT_NAME } from '../network/APIConstant';
import { GameManager } from './GameManager';
import { SceneManagerController } from '../utilities/SceneManagerController';
import { SceneName } from '../utilities/SceneName';
import { UIManager } from './UIManager';
import { ItemColysesusObjectData, PetColysesusObjectData, PlayerColysesusObjectData } from '../Model/Player';
import { MapItemManger } from './MapItemManager';
import { PopupManager } from '../PopUp/PopupManager';
import { AudioType, SoundManager } from './SoundManager';
import Utilities from '../utilities/Utilities';
import { OfficeSceneController } from '../GameMap/OfficeScene/OfficeSceneController';
import { UserMeManager } from './UserMeManager';
import { MessageTypes } from '../utilities/MessageTypes';
import { ConfirmParam, ConfirmPopup } from '../PopUp/ConfirmPopup';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';

@ccclass('ServerManager')
export class ServerManager extends Component {
    private static _instance: ServerManager;
    public static get instance() {
        return ServerManager._instance;
    }

    private client: Colyseus.Client;
    private room: Colyseus.Room<any>;
    public battleRoom: Colyseus.Room<any> | null = null; //
    private withAmount: number = -1;
    private exchangeAmount: number = -1;

    protected onLoad(): void {
        if (ServerManager._instance == null) {
            ServerManager._instance = this;
        }
    }

    public get Room(): Room {
        return this.room;
    }

    protected onDestroy(): void {
        ServerManager._instance = null;
    }

    public async init(roomName: string) {
        this.connectToServer(roomName);
    }

    private async connectToServer(roomName: string) {
        try {
            this.client = new Colyseus.Client(APIConfig.websocketPath);
            log("Connecting to Colyseus server...");
            await this.joinRoom(roomName);
        } catch (error) {
            log("Connection error:", error);
        }
    }

    public async joinRoom(roomName = "my_room") {
        console.log("try to join ", roomName)
        // Join or create a room
        this.room = await this.client.joinOrCreate(roomName, {
            accessToken: APIConfig.token
        });
        log(`Joined room: ${this.room.id}`);

        // Listen for state changes
        this.room.onStateChange((state) => {
            // log("Game State Updated:", state);
        });

        this.room.state.players.onAdd((player, sessionId) => {
            let playerData = new PlayerColysesusObjectData(sessionId, this.room, player.x, player.y, player.display_name, player.skin_set, player.user_id, player.is_show_name, player.pet_players, player.isInBattle);
            UserManager.instance.createPlayer(playerData);
        });

        this.room.state.items.onAdd((item, key) => {
            console.log(item, key);
            let itemData = new ItemColysesusObjectData(key, this.room, item.x, item.y, item.type, item.ownerId);
            MapItemManger.instance.createItem(itemData);
        });

        this.room.onMessage("onPlayerUpdateSkin", (data) => {
            UserManager.instance.updatePlayerSkinRemote(data);
        });

        this.room.onMessage("onUseItem", (data) => {
            console.log(data)
            MapItemManger.instance.onUseItem(data);
        });

        this.room.state.players.onRemove((player, sessionId) => {

            log(`Player left: ${sessionId}`);
            UserManager.instance.onRemove(player, sessionId);
        });

        this.room.onMessage("going-down", (data) => {
            console.log(data);
        });

        this.room.onMessage("quizQuestion", (data) => {
            console.log(data);
        });

        this.room.onMessage("noticeMessage", (data) => {
            const param: ConfirmParam = {
                message: data.message,
                title: "Chú Ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            UserManager.instance.GetMyClientPlayer.p2PInteractManager.onRejectedActionFromOther(data);
        });

        this.room.onMessage("onP2pAction", (data) => {
            UserManager.instance.GetMyClientPlayer.p2PInteractManager.onActionFromOther(data);
        });

        this.room.onMessage("onP2pActionSended", (data) => {
            UserManager.instance.GetMyClientPlayer.p2PInteractManager.onCallbackAction(data);
        });

        this.room.onMessage("onP2pActionAccept", (data) => {
            UserManager.instance.onP2PAction(data);
        });

        this.room.onMessage("serverBroadcast", (data) => {
            const param: ConfirmParam = {
                message: data.message,
                title: "Chú Ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
        });

        this.room.onMessage("onP2pActionResult", (data) => {
            UserManager.instance.onP2PAction(data);
        });

        this.room.onMessage("onP2pGameError", (data) => {
            UserManager.instance.onP2PGameError(data);
        });

        this.room.onMessage("onP2pActionReject", (data) => {
            UserManager.instance.GetMyClientPlayer.p2PInteractManager.onRejectedActionFromOther(data);
        });

        this.room.onMessage("updatePosition", (buffer: ArrayBuffer) => {
            UserManager.instance.onMessagePosition(this.decodeMoveData(buffer));
        });

        this.room.onMessage("onPlayerUpdateGold", (data) => {
            UserManager.instance.onPlayerRemoteUpdateGold(data);
        });

        this.room.onMessage("onPlayerUpdateDiamond", (data) => {
            UserManager.instance.onPlayerRemoteUpdateDiamond(data);
        });

        this.room.onMessage("mathProblem", (data) => {
            this.node.emit(EVENT_NAME.ON_QUIZ, data);
        });

        this.room.onMessage("onAnswerMath", (data) => {
            UserManager.instance.onAnswerMathCallback(data);
            this.node.emit(EVENT_NAME.ON_QUIZ_ANSWER, data);
        });

        this.room.onMessage("userTargetJoined", (data) => {
            if (GameManager.instance.uiMission) {
                GameManager.instance.uiMission.showNotiTargetJoined();
            };
        });

        this.room.onMessage("updateProgresCatchTargetUser", (data) => {
            if (GameManager.instance.uiMission) {
                GameManager.instance.uiMission.getMissionEventData();
            };
        });

        this.room.onMessage("userTargetLeft", (data) => {
            if (GameManager.instance.uiMission) {
                GameManager.instance.uiMission.closeMissionEvent();
            };
        });

        this.room.onLeave((code) => {
            if (PopupManager.getInstance()) {
                PopupManager.getInstance().closeAllPopups();
            }
            console.log("Disconnected from room. Code:", code);
            if (code == 1006) {
                if (UIManager.Instance) {
                    const param: SelectionMiniParam = {
                        title: "Chú Ý",
                        content: "Ta mất kết nối thật rồi bạn ơi!!!",
                        textButtonLeft: "",
                        textButtonRight: "",
                        textButtonCenter: "OK",
                        onActionButtonCenter: () => {
                            SceneManagerController.loadScene(SceneName.SCENE_GAME_MAP, null);
                        },
                    };
                    PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
                }
            }
        });

        this.room.onMessage("chat", (buffer: ArrayBuffer) => {
            if (GameManager.instance.uiChat) {
                const view = new DataView(buffer);

                const senderLength = view.getUint8(0);
                const senderBytes = new Uint8Array(buffer, 1, senderLength);
                const sender = new TextDecoder().decode(senderBytes);

                const messageBytes = new Uint8Array(buffer, 1 + senderLength);
                const message = new TextDecoder().decode(messageBytes);

                GameManager.instance.uiChat.showChatMessage(sender, message);
            };
        });

        this.room.onMessage("onGlobalChat", (buffer: ArrayBuffer) => {
            if (GameManager.instance.uiMission) {
                const view = new DataView(buffer);

                const senderLength = view.getUint8(0);
                const senderBytes = new Uint8Array(buffer, 1, senderLength);
                const sender = new TextDecoder().decode(senderBytes);

                const messageBytes = new Uint8Array(buffer, 1 + senderLength);
                const message = new TextDecoder().decode(messageBytes);
                UserManager.instance.onGlobalChat(sender.split("/")[1])
                GameManager.instance.uiMission.showNotiMission(`${sender.split("/")[0]}: ${message.replace(/\x00/g, '')}`);
            };
        });

        this.room.onMessage("onWithdrawFailed", (data) => {
            const param: ConfirmParam = {
                message: data.reason,
                title: "Chú Ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            SoundManager.instance.playSound(AudioType.NoReward);
        });

        this.room.onMessage("onWithrawDiamond", (data) => {
            const { sessionId } = data;
            if (this.withAmount > 0 && UserMeManager.Get && sessionId == UserManager.instance.GetMyClientPlayer.myID) {
                SoundManager.instance.playSound(AudioType.ReceiveReward);
                const param: SelectionMiniParam = {
                    title: "Thông báo",
                    content: `<color=#FF0000>${Utilities.convertBigNumberToStr(this.withAmount)} Diamond</color> được trừ từ tài khoản`,
                    textButtonLeft: "",
                    textButtonRight: "",
                    textButtonCenter: "OK",
                    onActionButtonCenter: () => {
                        UserMeManager.playerDiamond -= this.withAmount;
                        this.withAmount = -1;
                    },
                };
                PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
            }
        });

        this.room.onMessage("onExchangeFailed", (data) => {
            const param: ConfirmParam = {
                message: data.reason,
                title: "Chú Ý",
            };
            PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
            SoundManager.instance.playSound(AudioType.NoReward);
        });

        this.room.onMessage("onExchangeDiamondToCoin", (data) => {

            const { coinChange, diamondChange, sessionId } = data;
            if (this.exchangeAmount > 0 && UserMeManager.Get && sessionId == UserManager.instance.GetMyClientPlayer.myID) {
                SoundManager.instance.playSound(AudioType.ReceiveReward);
                const msg = `<color=#FF0000>${Utilities.convertBigNumberToStr(Math.abs(diamondChange))} Diamond</color> đã được chuyển thành <color=#00FF00>${coinChange} coin</color>`;
                const param: SelectionMiniParam = {
                    title: "Thông báo",
                    content: msg,
                    textButtonLeft: "",
                    textButtonRight: "",
                    textButtonCenter: "OK",
                    onActionButtonCenter: () => {
                        UserMeManager.playerDiamond += diamondChange;
                        UserMeManager.playerCoin += coinChange;
                        this.exchangeAmount = -1;
                    },
                };
                PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
            }
        });
        this.room.onMessage("onCatchPetSuccess", (data) => {
            UserManager.instance.onCatchPetSuccess(data);
        });
        this.room.onMessage("onPetAlreadyCaught", (data) => {
            UserManager.instance.onPetAlreadyCaught(data);
        });
        this.room.onMessage("onPetDisappear", (data) => {
            UserManager.instance.onPetDisappear(data);
        });
        this.room.onMessage("onCatchPetFail", (data) => {
            UserManager.instance.onCatchPetFail(data);
        });
        this.room.onMessage("onPetFollowPlayer", (data) => {
            if (data == null) return;
            UserManager.instance.onPetFollowPlayer(data);

        });
        this.room.onMessage("onSendTouchPet", (data) => {
            UserManager.instance.onSendTouchPet(data);
        });

        this.room.onMessage("petPositionUpdate", (data) => {
            if (!data) return;
            const petData = new PetColysesusObjectData(data.id, this.room, data.position.x, data.position.y, data.name, new Vec2(data.angle.x, data.angle.y), data);
            if (OfficeSceneController.instance.currentMap == null) return;
            OfficeSceneController.instance.currentMap.AnimalSpawner.updatePositionPetOnServer(petData);
        });

        this.room.onMessage(MessageTypes.ON_OPEN_DOOR, (data) => {
            if (data == null || data.doorUpadte == null || data.sessionId == UserManager.instance.GetMyClientPlayer.myID) return;
            OfficeSceneController.instance.currentMap.updateDoor(data.doorUpadte);
        });

        this.room.onMessage(MessageTypes.ON_CLOSE_DOOR, (data) => {
            if (data == null || data.doorUpadte == null || data.sessionId == UserManager.instance.GetMyClientPlayer.myID) return;
            OfficeSceneController.instance.currentMap.updateDoor(data.doorUpadte);
        });

        this.room.state.pets.onAdd((pet, key) => {
            let petData = new PetColysesusObjectData(key, this.room, pet.position.x, pet.position.y, pet.name, new Vec2(pet.angle.x, pet.angle.y), pet);
            if (OfficeSceneController.instance.currentMap == null) return;
            OfficeSceneController.instance.currentMap.AnimalSpawner.spawnPetOnServer(petData);
        });

        this.room.state.doors.onAdd((door, key) => {
            if (OfficeSceneController.instance.currentMap == null) return;
            OfficeSceneController.instance.currentMap.setDoor(door);
        });

        // this.room.state.battlePlayers.onAdd = (player, key) => {
        //     console.log(`BattleJoin joined: ${player.name} (ID: ${player.id})`);
        // };

        this.room.onMessage(MessageTypes.BATTE_ROOM_READY, async (data) => {
            if (data == null) return;
            const { roomId } = data;
            console.log("data", data);
            UserManager.instance.playerJoinRoomBattle(data, async () => {
                await this.joinBattleRoom(roomId);
            });
        });

        this.room.onMessage(MessageTypes.END_BATTLE_COMPLETED, (data) => {
            if (data == null) return;
            UserManager.instance.updatePlayerEndBattle(data);
        });

        this.room.onMessage(MessageTypes.NOTIFY_BATTLE, (data) => {
            if (data == null) return;
            UserManager.instance.NotifyBattle(data);
        });
    }

    public async joinBattleRoom(roomId: string): Promise<void> {
        console.log("Join");
        this.battleRoom = await this.client.joinById(roomId, {
            accessToken: APIConfig.token
        });
        this.battleRoom.state.battlePlayers.onAdd((player, sessionId) => {
            console.log(`BattleJoin joined: ${player.name} (ID: ${player.id})`);
            if (sessionId != this.battleRoom.sessionId) return;
            UserManager.instance.GetMyClientPlayer.myClientBattleId = sessionId;
        });

        this.battleRoom.onMessage(MessageTypes.BATTE_READY, (data) => {
            if (data == null) return;
            UserManager.instance.setUpBattle(data);
        });
        this.battleRoom.onLeave(() => {
            //     console.log("Battle room closed");
            this.battleRoom = null;
        });
        this.battleRoom.onMessage(MessageTypes.RESULT_SKILL, (data) => {
            if (data == null) return;
            UserManager.instance.handleBattleResult(data);
        });

        this.battleRoom.onMessage(MessageTypes.SWITCH_PET_AFTER_DEAD_DONE, (data) => {
            if (data == null) return;
            UserManager.instance.switchPetAfterPetDead(data);
        });
        this.battleRoom.onMessage(MessageTypes.BATTLE_FINISHED, (data) => {
            if (data == null) return;
            console.log("Battle Leave");
            UserManager.instance.battleFinished(data);
        });
        this.battleRoom.onMessage(MessageTypes.WAITING_OTHER_USER, (data) => {
            if (data == null) return;
            UserManager.instance.waitingOpponents(data);
        });
        this.battleRoom.onMessage(MessageTypes.DISCONNECTED, (data) => {
            if (data == null) return;
            UserManager.instance.disconnected(data);
        });
    }

    private decodeMoveData(uint8Array: ArrayBuffer) {
        const view = new DataView(uint8Array);
        let offset = 0;
        const x = view.getInt16(offset, true);
        const y = view.getInt16(offset + 2, true);
        const sX = view.getInt8(offset + 4);

        offset += 5;
        const sessionLength = view.getUint8(offset);

        offset += 1;
        const sessionBytes = uint8Array.slice(offset, offset + sessionLength);
        const id = new TextDecoder().decode(sessionBytes);
        offset += sessionLength;

        const animBytes = uint8Array.slice(offset);
        const anim = new TextDecoder().decode(animBytes);

        return { id, x, y, sX, anim };
    }

    private encodeChatMessage(sender: string, message: string): ArrayBuffer {
        const senderBytes = new TextEncoder().encode(sender);
        const messageBytes = new TextEncoder().encode(message);

        const buffer = new ArrayBuffer(2 + senderBytes.length + messageBytes.length);
        const view = new DataView(buffer);

        view.setUint8(0, senderBytes.length); // Ghi độ dài sender
        new Uint8Array(buffer, 1, senderBytes.length).set(senderBytes); // Ghi sender
        new Uint8Array(buffer, 1 + senderBytes.length).set(messageBytes); // Ghi message

        return buffer;
    }

    sendMessage(message: string, userInfo: string) {
        if (!this.room) return;
        this.room.send("chat", this.encodeChatMessage(userInfo, message));
    }

    sendGlobalMessage(message: string, userInfo: string) {
        if (!this.room) return;
        this.room.send("globalChat", this.encodeChatMessage(userInfo, message));
    }

    public updatePlayerSkin(skinSet: string[]) {
        this.room.send("playerUpdateSkin", { skin_set: skinSet.join("/") })
    }

    public playerUseItem(itemId, playerId, x = 0, y = 0) {
        this.room.send("useItem", { itemId: itemId, playerId: playerId, x: x, y: y })
    }

    public playerUpdateGold(sessionId: string, newValue: number, oldValue: number, needUpdate: boolean = true) {
        let data = {
            newValue: newValue,
            amountChange: newValue - oldValue,
            needUpdate: needUpdate
        }
        this.room.send("onPlayerUpdateGold", data)
    }

    public playerUpdateDiamond(sessionId: string, newValue: number, oldValue: number, needUpdate: boolean = true) {
        let data = {
            newValue: newValue,
            amountChange: newValue - oldValue,
            needUpdate: needUpdate
        }
        this.room.send("onPlayerUpdateDiamond", data)
    }

    public Withdraw(sessionId: string, sendData: any) {
        this.withAmount = sendData.amount;
        this.room.send("onWithrawDiamond", sendData)
    }

    public exchangeCoinToDiamond(sessionId: string, sendData: any) {
        this.exchangeAmount = sendData.diamondTransfer;
        this.room.send("onExchangeDiamondToCoin", sendData)
    }

    public answerMathQuestion(id, answer) {
        let data = {
            id: id,
            answer: answer
        }
        console.log(data)
        this.room.send("answerMath", data);
    }

    public sendCatchPet(data) {
        this.room.send("catchPet", data);
    }

    public sendTouchPet(data) {
        this.room.send("sendTouchPet", data);
    }

    public sendPetFollowPlayer(data) {
        this.room.send("sendPetFollowPlayer", data);
    }

    public sendInteracDoor(data, isOpen: boolean) {
        this.room.send(isOpen ? MessageTypes.OPEN_DOOR : MessageTypes.CLOSE_DOOR, data);
    }

    public sendPlayerActionBattle(isAttack: boolean, index: number) {
        if (this.battleRoom == null) return;
        this.battleRoom.send(MessageTypes.PLAYER_ACION, {
            type: isAttack ? "attack" : "swap",
            skillIndex: index,
        });
    }
    public sendSwitchPetAfterPetDead(choosePetId: string) {
        if (this.battleRoom == null) return;
        this.battleRoom.send(MessageTypes.SWITCH_PET_AFTER_DEAD, {
            petSwitchId: choosePetId,
        });
    }
    public sendPetSleeping(petSleepingId: string) {
        if (this.battleRoom == null) return;
        this.battleRoom.send(MessageTypes.SET_PET_SLEEP, {
            petSleepingId: petSleepingId,
        });
    }
    public sendSurrenderBattle() {
        if (this.battleRoom == null) return;
        this.battleRoom.send(MessageTypes.SURRENDER_BATTLE, { message: "", });
    }

    public leaveBattleRoom() {
        if (this.battleRoom) {
            this.battleRoom.leave();
            this.battleRoom = null;
            UserManager.instance.GetMyClientPlayer.myClientBattleId = ""
        }
        this.room.send(MessageTypes.END_BATTLE, { message: "", });
    }

    public sendNotEnoughPet(data) {
        this.room.send(MessageTypes.NOT_ENOUGH_PET_BATTLE, data);
    }

    public sendNotPet(data) {
        this.room.send(MessageTypes.NOT_PET_BATTLE, data);
    }

    public sendNotEnoughSkillPet(data) {
        this.room.send(MessageTypes.NOT_ENOUGH_SKILL_PET_BATTLE, data);
    }
}