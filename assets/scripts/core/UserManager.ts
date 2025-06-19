import { _decorator, Component, Node, PhysicsSystem2D, Prefab, randomRange, randomRangeInt, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { UserMeManager } from './UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { Item, RewardType } from '../Model/Item';
import { ServerManager } from './ServerManager';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { PlayerColysesusObjectData } from '../Model/Player';
import { EVENT_NAME } from '../network/APIConstant';
import { ActionType } from '../gameplay/player/ability/PlayerInteractAction';
import { UIManager } from './UIManager';
import { EffectManager } from './EffectManager';
import { AudioType, SoundManager } from './SoundManager';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { Constants } from '../utilities/Constants';
import { OfficeSceneController } from '../GameMap/OfficeScene/OfficeSceneController';
import { PetDTO } from '../Model/PetDTO';
import ConvetData from './ConvertData';
import { WebRequestManager } from '../network/WebRequestManager';
const { ccclass, property } = _decorator;

@ccclass('UserManager')
export class UserManager extends Component {
    private static _instance: UserManager;
    public static get instance() {
        return UserManager._instance;
    }
    @property({ type: Prefab }) playerPrefab: Prefab = null;
    @property({ type: Node }) playerParent: Node = null;
    @property({ type: Node }) animalParent: Node = null;
    @property({ type: Prefab }) animalPrefabs: Prefab[] = [];
    private players: Map<string, PlayerController> = new Map();
    private myClientPlayer: PlayerController = null;
    public get GetMyClientPlayer(): PlayerController | null {
        return this.myClientPlayer;
    }

    private readonly trollMessage = [
        "Troll thôi",
        "Troll Việt Nam",
        "Giờ thì mọi người đều biết rồi :))",
        "Game không xịn đến vậy đâu",
        "Ôi thật bất ngờ :))"
    ];

    public Players(): Map<string, PlayerController> {
        return this.players;
    }
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

    private playerToCreateQueue = [];
    public async createPlayer(playerData: PlayerColysesusObjectData) {
        this.playerToCreateQueue.push(playerData);
        if (this.playerToCreateQueue.length == 1) {
            this.createPlayerFromQueue(this.playerToCreateQueue[0]);
        }
    }

    public async createPlayerFromQueue(playerData: PlayerColysesusObjectData) {
        await this.waitForPhysicsReady();
        await LoadBundleController.instance.isInitDone();
        const playerNode = ObjectPoolManager.instance.spawnFromPool(this.playerPrefab.name);
        let playerController = playerNode.getComponent(PlayerController);
        playerNode.setPosition(new Vec3(playerData.x, playerData.y, 0));
        await playerController.init(playerData.sessionId, playerData.room, playerData.name, playerData.skinSet, playerData.userId, playerData.isShowName);
        if (playerData.room.sessionId == playerData.sessionId) {
            this.myClientPlayer = playerController;
        }

        // Gắn vào parent & lưu map
        playerNode.setParent(this.playerParent);
        this.players.set(playerData.sessionId, playerNode.getComponent(PlayerController));
        const pets = JSON.parse(playerData.animals);
        if (pets != null) {
            this.intantiatePetFollowPlayer(playerController, pets);
        }

        // Gửi event khi player được tạo xong
        ServerManager.instance.node.emit(EVENT_NAME.ON_PLAYER_ADDED, playerData.sessionId);

        // Tiếp tục tạo player tiếp theo trong hàng đợi
        this.playerToCreateQueue.shift();
        if (this.playerToCreateQueue.length > 0) {
            this.createPlayerFromQueue(this.playerToCreateQueue[0]);
        }
    }

    intantiatePetFollowPlayer(playerController: PlayerController, pets: any) {
        if (pets == null) return;
        playerController.resetPets(() => {
            for (const pet of pets) {
                const animal = ObjectPoolManager.instance.spawnFromPool(pet.species);
                const animalController = animal.getComponent(AnimalController);
                if (animalController == null) continue;
                const petDto = Object.assign(new PetDTO(), {
                    id: pet.id,
                    name: pet.name,
                    species: pet.species,
                    is_caught: true,
                    is_brought: true,
                    room_code: '',
                    rarity: pet.rarity,
                });
                animalController.setDataPet(petDto, AnimalType.FollowTarget, playerController, null, this.animalParent);
                playerController.savePetFollow(animalController);
                animal.setParent(this.animalParent);
                animal.active = false;
            }
            playerController.setPositonPet();
        });
    }

    private async waitForPhysicsReady() {
        const physics = PhysicsSystem2D.instance;
        while (!physics || !physics.enable) {
            await new Promise(resolve => setTimeout(resolve, 16));
        }
    }

    public onRemove(player, sessionId) {
        if (this.players.has(sessionId)) {
            let player = this.players.get(sessionId);
            player.resetPets(() => { });
            player.removePlayer();
        } else {
            console.warn(`No player found with sessionId: ${sessionId}`);
        }
    }

    public onMessagePosition(data, isForce: boolean = false) {
        const { id } = data;
        if (this.players.has(id)) {
            this.players.get(id).updateRemotePosition(data);
        }
    }

    public forceUpdateMyPlayerPosition(playerSessionId: string, newPosition: Vec3) {
        let player: PlayerController = null;
        if (playerSessionId != "") {
            player = this.players.get(playerSessionId);
        }

        if (player) {
            player.moveAbility.forceUpdateMyPlayerPosition(newPosition);
        }
    }

    public attachItemToPlayer(playerSessionId: string, item: Node): PlayerController {
        let player: PlayerController = null;
        if (playerSessionId != "") {
            player = this.players.get(playerSessionId);
        }

        if (player) {
            player.attachItem(item);
        }

        return player;
    }

    public updatePlayerSkin(skinData: Item, applyToPlayer: boolean) {
        this.myClientPlayer.updateSkinLocal(skinData, applyToPlayer);
    }

    public updatePlayerSkinRemote(data) {
        const { sessionId, skin_set } = data;
        if (this.players.has(sessionId)) {
            this.players.get(sessionId).updateSkinRemote(skin_set);
        }
    }

    public sendMessageChat(message) {
        let sender = this.myClientPlayer.userName + "/" + this.myClientPlayer.myID;
        ServerManager.instance.sendMessage(message, sender)
    }

    public showTrollMessage() {
        this.GetMyClientPlayer.zoomBubbleChat(this.trollMessage[randomRangeInt(0, this.trollMessage.length)]);
    }

    public getPlayerById(id: string): PlayerController | null {
        return this.players.get(id) || null;
    }

    public onP2PAction(data) {
        let p1 = this.players.get(data.from);
        let p2 = this.players.get(data.to);
        let action = data.action;
        let result1 = data.result1;
        let result2 = data.result2;
        let fee = data.fee;
        let winner = data.winner;
        let p1Diamond = data.fromDiamond;
        let p2Diamond = data.toDiamond;
        if (action == ActionType.RPS.toString()) {
            if (p1.myID != this.GetMyClientPlayer.myID) {
                p1.p2PInteractManager.showSpinRPS();
            }
            if (p2.myID != this.GetMyClientPlayer.myID) {
                p2.p2PInteractManager.showSpinRPS();
            }

            if (p1.myID == this.GetMyClientPlayer.myID) {
                this.GetMyClientPlayer.p2PInteractManager.onAcceptedActionFromOther(data);
            }
        }
        else if (action == ActionType.RPS.toString() + "Done") {
            p1.p2PInteractManager.showSpinResultRPS(result1);
            p2.p2PInteractManager.showSpinResultRPS(result2);

            if (winner == this.GetMyClientPlayer.myID) {
                this.GetMyClientPlayer.happyAction();
            }
            else if (p1.myID == this.GetMyClientPlayer.myID || p2.myID == this.GetMyClientPlayer.myID) {
                this.GetMyClientPlayer.sadAction();
            }

            if (UserMeManager.Get?.user) {
                if (p1.myID == this.GetMyClientPlayer.myID && p1Diamond != null) {
                    UserMeManager.playerDiamond = p1Diamond;
                }
                else if (p2.myID == this.GetMyClientPlayer.myID && p2Diamond != null) {
                    UserMeManager.playerDiamond = p2Diamond;
                }
            }
        }
    }

    public onP2PGameError(data) {
        if (data.from == this.GetMyClientPlayer.myID || data.to == this.GetMyClientPlayer.myID) {
            SoundManager.instance.playSound(AudioType.Lose);
            UIManager.Instance.showNoticePopup(null, data.message);
        }
        this.players.forEach(player => {
            player.p2PInteractManager.stopP2pAction(data);
        });
    }

    public onPlayerRemoteUpdateGold(data) {
        const { sessionId, amountChange } = data;
        let player = this.players.get(sessionId);

        if (player && player.myID != this.GetMyClientPlayer.myID) {
            //EffectManager.instance.spawnPointEffect(amountChange, player.node.worldPosition.clone().add(new Vec3(randomRange(-10, 10), 0, 0)), RewardType.GOLD);
        }
    }

    public onPlayerRemoteUpdateDiamond(data) {
        if (!data) {
            return;
        }
        const { sessionId, amountChange } = data;
        if (!sessionId) {
            return;
        }

        let player = this.players.get(sessionId);
        if (player && player.myID != this.GetMyClientPlayer.myID) {
            //EffectManager.instance.spawnPointEffect(amountChange, player.node.worldPosition.clone().add(new Vec3(randomRange(-10, 10), 0, 0)), RewardType.DIAMOND);
        }
    }

    public onAnswerMathCallback(data) {
        const { correct, userGold } = data;
        if (correct && userGold) {
            UserMeManager.playerCoin = userGold;
            this.GetMyClientPlayer.happyAction();
        }
        else {
            this.GetMyClientPlayer.sadAction();
        }
    }

    public onGlobalChat(id) {
        if (id == this.GetMyClientPlayer.myID) {
            //UserMeManager.playerCoin -= Constants.WiSH_FEE;
            this.showTrollMessage();
        }
    }

    public onCatchPetSuccess(data) {
        OfficeSceneController.instance.currentMap.AnimalSpawner.disappearedPet(data.petId, true)
        if (data.playerCatchId === UserManager.instance.GetMyClientPlayer.myID) this.updateMyData(data.petId);
    }
    public onPetAlreadyCaught(data) {
        UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã bị bắt. Chúc bạn may mắn lần sau`);
    }
    public onCatchPetFail(data) {
        let animal = OfficeSceneController.instance.currentMap.AnimalSpawner.getAnimalById(data.petId);
        if (animal == null) return;
        animal.catchFail("Lêu lêu bắt hụt")
    }

    public onPetDisappear(data) {
        OfficeSceneController.instance.currentMap.AnimalSpawner.disappearedPet(data.petId, false)
    }

    public onPetFollowPlayer(data) {
        let playerTarget = this.players.get(data.playerIdFollowPet);
        let pets = ConvetData.ConvertPets(data.pet);
        if (playerTarget == null || pets == null) return;
        this.intantiatePetFollowPlayer(playerTarget, pets)
    }

    public onSendTouchPet(data) {
        if (data == null) return;
        const { targetPetId, playerTouchingPetId, isOwnerTouching, randomIndex } = data;
        let playerTarget = this.players.get(playerTouchingPetId);
        if (playerTarget == null) return;
        const targetPet = playerTarget.petFollowPrefabs.find(pet => pet.Pet.id === targetPetId);
        if (targetPet == null) return;
        if (isOwnerTouching) {
            targetPet.getRandomCompliment(playerTarget.userName, randomIndex);
            return;
        }
        targetPet.getRandomProvokeLine(playerTarget.userName, randomIndex);
    }

    private updateMyData(petCaughId: string) {
        WebRequestManager.instance.getUserProfile(
            (response) => { this.onGetProfileSuccess(response, petCaughId) },
            (error) => this.onError(error)
        );
    }

    private onGetProfileSuccess(respone, petCaughId: string) {
        UserMeManager.Set = respone.data;
        const pet = UserMeManager.Get.animals.find(p => p.id === petCaughId);
        if (UserManager.instance.GetMyClientPlayer) {
            const content = pet != null ? `Bạn đã bắt thành công <color=#FF0000>${pet.name} (${pet.rarity})</color>` : `Bạn đã bắt pet thành công`
            UIManager.Instance.showNoticePopup("Thông báo", content);
        }
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}