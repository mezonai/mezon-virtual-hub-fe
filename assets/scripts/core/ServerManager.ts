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
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { WebRequestManager } from '../network/WebRequestManager';
import { Constants } from '../utilities/Constants';
import { PurchaseMethod } from '../Model/Item';
import { PopupClanFundMember } from '../PopUp/PopupClanFundMember';
import { PopupClanList } from '../PopUp/PopupClanList';
import { PopupClanMemberManager } from '../PopUp/PopupClanMemberManager';
import { PopupClanDetailInfo } from '../PopUp/PopupClanDetailInfo';
import { PopupClanShop } from '../PopUp/PopupClanShop';
import { PopupClanInventory } from '../PopUp/PopupClanInventory';
import { FarmController } from '../Farm/FarmController';
import { FarmSlotDTO, SlotActionType } from '../Farm/EnumPlant';
import { LoadingManager } from '../PopUp/LoadingManager';
import { PopupHarvestReceive, PopupHarvestReceiveParam } from '../PopUp/PopupHarvestReceive';

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
            console.log("roomName", roomName);
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
            Constants.showConfirm(data.message, "Chú Ý");
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
            Constants.showConfirm(data.message, "Chú Ý");
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

            if (code == 4444) {
                if (UIManager.Instance) {
                    const param: SelectionMiniParam = {
                        title: "Chú Ý",
                        content: "Tài Khoản Đã Được Đăng Nhập Ở Nơi Khác",
                        textButtonLeft: "",
                        textButtonRight: "",
                        textButtonCenter: "OK",
                        onActionButtonCenter: () => {
                            window.location.replace("about:blank");
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
            Constants.showConfirm(data.reason, "Chú Ý");
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
            Constants.showConfirm(data.reason, "Chú Ý");
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
            LoadingManager.getInstance().openLoading();
            UserManager.instance.playerJoinRoomBattle(data,
                async () => {
                    await this.joinBattleRoom(roomId);
                },
                () => {
                    LoadingManager.getInstance().closeLoading();
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

        this.room.onMessage(MessageTypes.NOTIFY_MISSION, (data) => {
            if (data == null || GameManager.instance == null) return;
            GameManager.instance.playerHubController?.onMissionNotice(true);
        });

        this.room.onMessage(MessageTypes.ON_SEND_CLAND_FUND_SELF, (data) => {
            const { clanId, type, playerAmount, totalAmount, sessionId } = data;
            if (UserMeManager.Get && clanId === UserMeManager.Get.clan.id) {
                SoundManager.instance.playSound(AudioType.ReceiveReward);
                if (type === PurchaseMethod.GOLD.toString()) {
                    UserMeManager.playerCoin += playerAmount;
                }
                const popupComp = PopupManager.getInstance().getPopupComponent("UI_ClanFundMember", PopupClanFundMember);
                popupComp?.addSelfContribution(totalAmount);

                const msg = `Bạn đã nạp ${Math.abs(playerAmount)} thành công vào quỹ văn phòng</color>`;
                Constants.showConfirm(msg);
            }
        });

        this.room.onMessage(MessageTypes.ON_SEND_CLAND_FUND_UPDATE, (data) => {
            const { clanId, type, totalAmount, message } = data;
            if (UserMeManager.Get && clanId === UserMeManager.Get.clan.id) {
                const popupComp = PopupManager.getInstance().getPopupComponent("UI_ClanFundMember", PopupClanFundMember);
                popupComp?.addSelfContribution(totalAmount);
            }
        });

        this.room.onMessage(MessageTypes.ON_SEND_CLAND_FUND_FAILED, (data) => {
            Constants.showConfirm(data.reason, "Chú Ý");
            SoundManager.instance.playSound(AudioType.NoReward);
        });

        this.room.onMessage(MessageTypes.ON_BUY_CLAN_ITEM_SUCCESS, (data) => {
            const { clanId, item, fund } = data;
            if (UserMeManager.Get && clanId === UserMeManager.Get.clan.id) {
                SoundManager.instance.playSound(AudioType.ReceiveReward);
                Constants.showConfirm('Bạn đã mua vật phẩm cho văn phòng thành công');
                const popupShop = PopupManager.getInstance().getPopupComponent("UI_ClanShop", PopupClanShop);
                popupShop?.ReloadAfterBuyItem();
            }
        });

        this.room.onMessage(MessageTypes.ON_BUY_CLAN_UPDATE_FUND, (data) => {
            const { clanId, fund } = data;
            if (UserMeManager.Get && clanId === UserMeManager.Get.clan.id) {
                const popupFund = PopupManager.getInstance().getPopupComponent("UI_ClanFundMember", PopupClanFundMember);
                popupFund?.addSelfContribution(fund);
                const popupInfo = PopupManager.getInstance().getPopupComponent("UI_ClanDetailInfo", PopupClanDetailInfo);
                popupInfo?.setDataFundClan(fund);
            }
        });

        this.room.onMessage(MessageTypes.ON_BUY_CLAN_ITEM_FAILED, (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            Constants.showConfirm(data.message, "Chú Ý");
        });

        this.room.onMessage(MessageTypes.JOIN_CLAN_REQUEST, (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            const popupApprovedMember = PopupManager.getInstance().getPopupComponent('UI_ClanMemberManager', PopupClanMemberManager);
            popupApprovedMember?.popupApprovedMember.node.active && popupApprovedMember?.popupApprovedMember.loadList(1);
            Constants.showConfirm(data.message);

        });

        this.room.onMessage(MessageTypes.JOIN_CLAN_APPROVED, async (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            await WebRequestManager.instance.getUserProfileAsync();
            PopupManager.getInstance().getPopupComponent('UI_ClanList', PopupClanList)
                ?.ShowOpenClanWhenAprrove(data.message)
                ?? Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.JOIN_CLAN_REJECTED, (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            const popupComp = PopupManager.getInstance().getPopupComponent('UI_ClanList', PopupClanList);
            popupComp?.loadList(1);
            Constants.showConfirm(data.message, "Chú Ý");
        });

        this.room.onMessage(MessageTypes.CLAN_LEADER_TRANSFERRED, async (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            await PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.CLAN_VICE_LEADER_ASSIGNED, async (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            await PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.CLAN_VICE_LEADER_DEMOTED, async (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            await PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm(data.message, "Chú Ý");
        });

        this.room.onMessage(MessageTypes.CLAN_MEMBER_KICKED, async (data) => {
            SoundManager.instance.playSound(AudioType.NoReward);
            await WebRequestManager.instance.getUserProfileAsync();
            await PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.ON_SLOT_FARM, async (data) => {
            if (!data || !data.slots) {
                return;
            }
            FarmController.instance.InitFarmSlot(data.slots);
        });

        this.room.state.farmSlotState.onAdd((farmSlotState, key) => {
            const plantValue = farmSlotState.currentPlant
                ? farmSlotState.currentPlant.toJSON()
                : null;

            const slotUI: FarmSlotDTO = {
                id: farmSlotState.id,
                slot_index: farmSlotState.slot_index,
                currentPlant: plantValue,
            };
            FarmController.instance.UpdateSlot(slotUI);
        });

        this.room.state.farmSlotState.onChange(async (value, key) => {
            const plantValue = value.currentPlant
                ? value.currentPlant.toJSON()
                : null;

            const slotUI: FarmSlotDTO = {
                id: key,
                slot_index: value.slot_index,
                currentPlant: plantValue,
            };
            FarmController.instance.UpdateSlot(slotUI);
        });

        this.room.onMessage(MessageTypes.ON_WATER_PLANT, async (data) => {
            await PopupManager.getInstance().closeAllPopups();
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Water, true);
            //Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.ON_CATCH_BUG, async (data) => {
            await PopupManager.getInstance().closeAllPopups();
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.CatchBug, true);
            // Constants.showConfirm(data.message);
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_STARTED, (data) => {
            const player = UserManager.instance.getPlayerById(data.sessionId);
            if (!player) return;

            player.playerInteractFarm.showHarvestingBar(data.endTime, data.slotId);
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, true);
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_PLAYER_JOIN, (data) => {
            const slots = data.slots || [data];
            slots.forEach((slot) => {
                const otherPlayer = UserManager.instance.getPlayerById(slot.sessionId);
                if (otherPlayer) {
                    otherPlayer.playerInteractFarm.showHarvestingBar(slot.endTime, slot.slotId);
                    FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, true);
                }
            });
        });

        this.room.onMessage(MessageTypes.ON_CANCEL_HARVEST_PLAYER_LEFT, (data) => {
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, false);
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_DENIED, (data) => {
            if (data.remaining) {
                Constants.showConfirm(`${data.message}\nLượt thu hoạch còn lại của bạn là: ${data.remaining}/${data.max}`);
            }
            Constants.showConfirm(`${data.message}`);
            UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
            GameManager.instance.playerHubController.showBlockInteractHarvest(false);
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, false);
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_COMPLETE, (data) => {
            const myPlayer = UserManager.instance.GetMyClientPlayer;
            const isClient = data.sessionId === myPlayer?.myID;
            try {
                const playerHarvest = isClient ? myPlayer : UserManager.instance.getPlayerById(data.sessionId);
                if (!playerHarvest) return;
                playerHarvest.playerInteractFarm.showHarvestingComplete();
                FarmController.instance.UpdateSlotAction(
                    data.slotId,
                    SlotActionType.Harvest,
                    false
                );
                if (isClient) {
                    const param: PopupHarvestReceiveParam = {
                        baseScore: data.baseScore,
                        totalScore: data.totalScore,
                        bonusPercent: data.bonusPercent,
                        remainingHarvest: data.remainingHarvest,
                        maxHarvest: data.maxHarvest,
                    };

                    PopupManager.getInstance().openAnimPopup("PopupHarvestReceive", PopupHarvestReceive, param);
                }

            } catch (err) {
                console.error("[ON_HARVEST_COMPLETE] Error:", err, data);
            } finally {
                if (isClient && myPlayer) {
                    myPlayer.get_MoveAbility.startMove();
                    GameManager.instance.playerHubController.showBlockInteractHarvest(false);
                }
            }
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_INTERRUPTED, (data) => {
            const isMe = data.sessionId === UserManager.instance.GetMyClientPlayer?.myID;
            console.log("ON_HARVEST_INTERRUPTED: ", isMe);
            if (isMe) {
                Constants.showConfirm(`Bạn đã phá thu hoạch của ${data.interruptedPlayerName} thành công!\n` +
                    `Lượt phá còn lại: ${data.selfHarvestInterrupt.remaining}/${data.selfHarvestInterrupt.max}`);
            }
            const otherPlayer = UserManager.instance.getPlayerById(data.interruptedPlayer);
            if (otherPlayer) {
                otherPlayer.playerInteractFarm.showHarvestingComplete();
                FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, false);
            }
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_INTERRUPTED_BY_OTHER, (data) => {
            Constants.showConfirm(
                `Bạn bị phá bởi ${data.interruptedByName}!\n` +
                `Lượt thu hoạch của bạn còn lại: ${data.selfHarvest.remaining}/${data.selfHarvest.max}\n` +
                `Lượt thu hoạch còn lại của cây: ${data.plantHarvest.remaining}/${data.plantHarvest.max}`);
            UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
            GameManager.instance.playerHubController.showBlockInteractHarvest(false);
            UserManager.instance.GetMyClientPlayer.playerInteractFarm.showHarvestingComplete();

            const otherPlayer = UserManager.instance.getPlayerById(data.sessionId);
            if (otherPlayer) {
                otherPlayer.playerInteractFarm.showHarvestingComplete();
            }
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Harvest, false);
        });

        this.room.onMessage(MessageTypes.ON_PLANT_TO_PLANT_FAILED, (data) => {
            Constants.showConfirm(`${data.message}`);
        });

        this.room.onMessage(MessageTypes.ON_WATER_PLANT_FAILED, (data) => {
            Constants.showConfirm(`${data.message}`);
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.Water);
        });

        this.room.onMessage(MessageTypes.ON_CATCH_BUG_FAILED, (data) => {
            Constants.showConfirm(`${data.message}`);
            FarmController.instance.UpdateSlotAction(data.slotId, SlotActionType.CatchBug);
        });

        this.room.onMessage(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, (data) => {
            Constants.showConfirm(`${data.message}`);
        });

        this.room.onMessage(MessageTypes.ON_PLANT_DEATH, (data) => {
            const harvestPlayer = UserManager.instance.getPlayerById(data.harverstId);
            const interruptedPlayer = UserManager.instance.getPlayerById(data.interruptedId);
            if (harvestPlayer || interruptedPlayer) {
                Constants.showConfirm(`${data.message}`);
            }
        });

    }

    public async joinBattleRoom(roomId: string): Promise<void> {
        this.battleRoom = await this.client.joinById(roomId, {
            accessToken: APIConfig.token
        });
        this.battleRoom.state.battlePlayers.onAdd((player, sessionId) => {
            if (sessionId != this.battleRoom.sessionId) return;
            if (UserManager.instance?.GetMyClientPlayer == null) return;
            UserManager.instance.GetMyClientPlayer.myClientBattleId = sessionId;
        });

        this.battleRoom.onMessage(MessageTypes.BATTE_READY, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            UserManager.instance?.setUpBattle(data);
        });
        this.battleRoom.onLeave(() => {
            this.battleRoom = null;
        });
        this.battleRoom.onMessage(MessageTypes.RESULT_SKILL, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            UserManager.instance.handleBattleResult(data);
        });

        this.battleRoom.onMessage(MessageTypes.SWITCH_PET_AFTER_DEAD_DONE, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            UserManager.instance.switchPetAfterPetDead(data);
        });
        this.battleRoom.onMessage(MessageTypes.BATTLE_FINISHED, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            UserManager.instance.battleFinished(data);
        });
        this.battleRoom.onMessage(MessageTypes.WAITING_OTHER_USER, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            UserManager.instance.waitingOpponents(data);
        });
        this.battleRoom.onMessage(MessageTypes.DISCONNECTED, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            if (UserManager.instance == null) return;
            UserManager.instance.disconnected("Đối Thủ Bị Mất Kết Nôi");
        });

        this.battleRoom.onMessage(MessageTypes.TIME_REMAINING_USING_SKILL, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            if (UserManager.instance == null) return;
            UserManager.instance.remainingUsingSkill(data);
        });

        this.battleRoom.onMessage(MessageTypes.AUTO_ATTACK, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            if (UserManager.instance == null) return;
            UserManager.instance.autoAttack(data);
        });

        this.battleRoom.onMessage(MessageTypes.NOTIFY_BATTLE, (data) => {
            if (data == null) {
                this.leaveBattleRoom();
                return;
            }
            if (UserManager.instance == null) return;
            UserManager.instance.disconnected(data.message);
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

    public sendClanFund(sendData) {
        this.room.send("sendClanFund", sendData)
    }

    public sendBuyItem(sendData) {
        this.room.send("buyClanItem", sendData)
    }

    public sendPlantToSlot(sendData) {
        this.room.send("plantToSlot", sendData)
    }

    public sendWaterPlant(sendData) {
        this.room.send("waterPlant", sendData)
    }

    public sendCatchBug(sendData) {
        this.room.send("catchBug", sendData)
    }

    public sendHarvest(sendData) {
        this.room.send('startHarvest', sendData);
    }

    sendInterruptHarvest(sendData) {
        this.room.send('interruptHarvest', sendData);
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

    public sendEndTurn() {
        if (this.battleRoom == null) return;
        this.battleRoom.send(MessageTypes.CONFIRM_END_TURN, { message: "", });
    }

    public async leaveBattleRoom(): Promise<void> {
        if (this.battleRoom) {
            await this.battleRoom.leave();
            this.battleRoom = null;
            if (UserManager.instance.GetMyClientPlayer != null)
                UserManager.instance.GetMyClientPlayer.myClientBattleId = "";
            this.room.send(MessageTypes.END_BATTLE, { message: "", });
        }

    }

    public async leaveRoom(): Promise<void> {
        await this.leaveBattleRoom();
        if (this.room) {
            await this.room.leave();
            this.room = null;
        }
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

    public sendUpdateSlot() {
        this.room.send("UpdateSlots")
    }

}