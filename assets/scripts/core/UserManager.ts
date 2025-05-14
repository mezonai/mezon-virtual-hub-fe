import { _decorator, Component, Node, PhysicsSystem2D, Prefab, randomRange, randomRangeInt, Vec3 } from 'cc';
import { PlayerController } from '../gameplay/player/PlayerController';
import { UserMeManager } from './UserMeManager';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { Item } from '../Model/Item';
import { ServerManager } from './ServerManager';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { PlayerColysesusObjectData } from '../Model/Player';
import { EVENT_NAME } from '../network/APIConstant';
import { ActionType } from '../gameplay/player/ability/PlayerInteractAction';
import { UIManager } from './UIManager';
import { EffectManager } from './EffectManager';
import { AudioType, SoundManager } from './SoundManager';
import { AnimalController } from '../animal/AnimalController';
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
        this.spawnAnimal(playerController, playerData);
        // Gửi event khi player được tạo xong
        ServerManager.instance.node.emit(EVENT_NAME.ON_PLAYER_ADDED, playerData.sessionId);

        // Tiếp tục tạo player tiếp theo trong hàng đợi
        this.playerToCreateQueue.shift();
        if (this.playerToCreateQueue.length > 0) {
            this.createPlayerFromQueue(this.playerToCreateQueue[0]);
        }
    }

    intantiatePet(pets: PetDTO[], x: number, y: number, playerController: PlayerController) {
        for (let i = 0; i < pets.length; i++) {
            const animal = ObjectPoolManager.instance.spawnFromPool(pets[i].species);
            let animalController = animal.getComponent(AnimalController);
            animal.setPosition(new Vec3(x, y));
            animalController.setDataPet(pets[i], playerController);
            animal.setParent(this.animalParent);
        }
    }

    private spawnAnimal(playerController: PlayerController, playerData: PlayerColysesusObjectData) {
        let pets = ConvetData.ConvertPet(playerData.animals);
        if (pets == null) return;
        playerController.saveListOwnedPet(pets);
        //this.intantiatePet(pets, playerData.x, playerData.y, playerController);
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
        let p1Gold = data.fromGold;
        let p2Gold = data.toGold;
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
                if (p1.myID == this.GetMyClientPlayer.myID && p1Gold != null) {
                    UserMeManager.playerCoin = p1Gold;
                }
                else if (p2.myID == this.GetMyClientPlayer.myID && p2Gold != null) {
                    UserMeManager.playerCoin = p2Gold;
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
            EffectManager.instance.spawnPointEffect(amountChange, player.node.worldPosition.clone().add(new Vec3(randomRange(-10, 10), 0, 0)));
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
            UserMeManager.playerCoin -= Constants.WiSH_FEE;
            this.showTrollMessage();
        }
    }

    public onCatchPetSuccess(data) {

        OfficeSceneController.instance.currentMap.AnimalSpawner.closeAnimalById(data.petId)
        if (data.playerCatchId === UserManager.instance.GetMyClientPlayer.myID) this.updateMyData();
        else{
            if(data.remainingUsers == null) return;
            console.log("data.remainingUsers", data.remainingUsers);
            if(!data.remainingUsers.includes(UserManager.instance.GetMyClientPlayer.myID)) return;
            UIManager.Instance.showNoticePopup("Chú Ý", "Chia buồn, người khác đã bắt được");
        }

    }
    public onCatchPetFail(data) {
        let animal = OfficeSceneController.instance.currentMap.AnimalSpawner.getAnimalById(data.petId);
        if (animal == null) return;
        animal.catchFail("Lêu lêu bắt hụt")
    }

    public onUpdateOwnedPetPlayer(data) {
        
        let playerCaughtPet = this.players.get(data.playerCatchId);
        let pets = ConvetData.ConvertPet(data.pet);
        if (playerCaughtPet == null || pets == null) return;
        const excludedIds = new Set(playerCaughtPet.petIdList);
        const filteredPets = pets.filter(pet => !excludedIds.has(pet.id));
        let position = playerCaughtPet.node.getPosition();
        this.intantiatePet(filteredPets, position.x, position.y, playerCaughtPet);
        playerCaughtPet.saveListOwnedPet(pets);
        if(data.playerId == UserManager.instance.myClientPlayer.myID){
            UIManager.Instance.showNoticePopup("Thông báo", `Bạn đã bắt thành công <color=#FF0000>${filteredPets[0].name}</color>`)
        }
    }
    private updateMyData() {
        WebRequestManager.instance.getUserProfile(
            (response) => { this.onGetProfileSuccess(response) },
            (error) => this.onError(error)
        );
    }

    private onGetProfileSuccess(respone) {
        UserMeManager.Set = respone.data;
        const petString: string = JSON.stringify(UserMeManager.Get.animals);       
        let data = {
            pets: petString
        }
        ServerManager.instance.sendOwnedPets(data);
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}