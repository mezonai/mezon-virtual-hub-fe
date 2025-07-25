import { _decorator, Node, Prefab, instantiate, Button } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { BattleData, AnimalElement, PlayerBattle, PetBattleInfo, SkillData } from '../Model/PetDTO';
import { HandleOpenSplash } from '../utilities/HandleOpenSplash';
import { PetBattlePrefab } from '../animal/PetBattlePrefab';
import { SlideObject } from '../utilities/SlideObject';
import { HUDBattlePet } from '../gameplay/Battle/HUDBattlePet';
import { CombatEnvController } from '../gameplay/Battle/CombatEnvController';
import { BattleSkillButton } from '../gameplay/Battle/BattleSkillButton';
import ConvetData from '../core/ConvertData';
import { ServerManager } from '../core/ServerManager';
const { ccclass, property } = _decorator;
@ccclass('PlayerBattleStats')
export class PlayerBattleStats {
    @property({ type: SlideObject }) landSpawnPet: SlideObject = null;
    @property({ type: HUDBattlePet }) hudBattlePet: HUDBattlePet = null;
    @property({ type: PetBattlePrefab }) petBattlePrefab: PetBattlePrefab = null;
}
@ccclass('PopupBattlePet')
export class PopupBattlePet extends BasePopup {
    @property({ type: [PlayerBattleStats] }) playerBattleStats: PlayerBattleStats[] = [];// 0 = competitor, 1 = userMe
    @property({ type: Prefab }) battleSkillButtonPrefab: Prefab = null;
    @property({ type: Node }) parentMySkill: Node = null;
    @property({ type: HandleOpenSplash }) centerOpenSplash: HandleOpenSplash = null;
    @property({ type: CombatEnvController }) combatEnvController: CombatEnvController = null;
    @property({ type: SlideObject }) slideChooseButtons: SlideObject = null;
    @property({ type: SlideObject }) slideSkillButtons: SlideObject = null;
    //Button
    @property({ type: Button }) fightButton: Button = null;
    @property({ type: Button }) runButton: Button = null;

    myClient: PlayerBattle = null;
    targetClient: PlayerBattle = null;
    clientIdInRoom: string = "";
    private _onActionCompleted: (() => void) | null = null;

    public async init(param?: BatllePetParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.Init(param);
        this.addListenerButton();
    }

    addListenerButton() {
        this.fightButton.node.on(Button.EventType.CLICK, async () => {
            await this.slideChooseButtons.slide(false, 0.3);
            await this.slideSkillButtons.slide(true, 0.3);
        }, this);
    }


    private Init(param?: BatllePetParam) {
        this.resetUIState();
        this.centerOpenSplash.playSplash(() => this.SetDataBattle(param));
    }

    private resetUIState() {
        this.playerBattleStats.forEach(playerBattleStat => {
            playerBattleStat.landSpawnPet.slide(false, 0);
            playerBattleStat.hudBattlePet.slide.slide(false, 0);
        });
        this.slideChooseButtons.slide(false, 0);
        this.slideSkillButtons.slide(false, 0);
    }

    async SetDataBattle(param?: BatllePetParam) {
        this.combatEnvController.setEnvironmentByType(this.fakeCombatData.environmentType);
        this.myClient = param.data.find(p => p.id === param.clientID);
        this.targetClient = param.data.find(p => p.id !== param.clientID);
        this.clientIdInRoom = param.clientID;
        if (this.myClient == null || this.targetClient == null) return;
        if (this.myClient.battlePets && this.targetClient != null) {
            const mypet = this.myClient.battlePets[this.myClient.activePetIndex];
            const targetPet = this.targetClient.battlePets[this.targetClient.activePetIndex];
            if (mypet != null && targetPet != null) {
                this.updateHUDPet(mypet, true);
                this.updateHUDPet(targetPet, false);
                for (const playerBattleStat of this.playerBattleStats) {
                    await playerBattleStat.landSpawnPet.slide(true, 0.5);
                    await playerBattleStat.hudBattlePet.slide.slide(true, 0.5);
                }
                this.createPet(mypet, true); // tạo pet của đối thủ (hoặc pet1)

                setTimeout(async () => {
                    this.createPet(targetPet, false); // tạo pet của mình (hoặc pet2)
                }, 500);
            }
        }
    }

    updateHUDPet(pet: PetBattleInfo, isMyClient: boolean) {
        const index = isMyClient ? 1 : 0;
        const playerBattleStat = this.playerBattleStats[index];
        playerBattleStat.hudBattlePet.updateHUD(pet, this.clientIdInRoom);
    }

    createPet(pet: PetBattleInfo, isMyClient: boolean) {
        const index = isMyClient ? 1 : 0;
        const playerBattleStat = this.playerBattleStats[index];
        playerBattleStat.petBattlePrefab.setDataPet(pet, index);
        if (!isMyClient) return;
        this.createMySkill(pet.skills)
    }


    createMySkill(skillIdsFromServer: SkillData[]) {
        this.slideChooseButtons.slide(false, 0);
        this.parentMySkill.removeAllChildren();
        // Sau đó tạo các nút skill có dữ liệu
        skillIdsFromServer.forEach((data, index) => {
            const newItem = instantiate(this.battleSkillButtonPrefab);
            newItem.setParent(this.parentMySkill);
            const skillButton = newItem.getComponent(BattleSkillButton);
            skillButton?.setData(data, index, this.onClickSkill.bind(this));
        });
        this.slideChooseButtons.slide(true, 0.3);
    }

    onClickSkill() {
        this.slideSkillButtons.slide(false, 0.3);
    }

    async closePopup() {
        this.cancelTween();
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public async handleBattleResult(data) {
        const isTurn1PetAlive = await this.handleBattlePlayer(data.player1Id, data.skillAttacPlayer1Id, data.damagePlayer1, data.playerTargetP1, 1);
        if (!isTurn1PetAlive) return;
        const isTurn2PetAlive = await this.handleBattlePlayer(data.player2Id, data.skillAttacPlayer2Id, data.damagePlayer2, data.playerTargetP2, 1);
        if (!isTurn2PetAlive) return;
        this.slideSkillButtons.slide(true, 0.3);
    }

    private async handleBattlePlayer(
        playerId: string,
        killAttacPlayer: string,
        damagePlayer: number,
        target: any,
        delay: number
    ): Promise<boolean> {
        const playerTarget = ConvetData.ConvertPlayerBattleData(target);
        const isMyClient = playerTarget.id === this.clientIdInRoom;
        if (isMyClient) {
            this.myClient = playerTarget;
        } else {
            this.targetClient = playerTarget;
        }
        const petTarget = playerTarget.battlePets[playerTarget.activePetIndex];
        await new Promise(resolve => setTimeout(resolve, delay));
        this.updateHUDPet(petTarget, isMyClient);
        if (petTarget.isDead) {
            await this.updatePetDead(isMyClient, () => {
                let nextPet = this.getActivePetIndexById(playerTarget);
                if (isMyClient) {
                    let petSwitchId = nextPet == null ? "-1" : nextPet.id;
                    ServerManager.instance.sendSwitchPetAfterPetDead(petSwitchId);
                }
            });
            return false;
        }
        return true;
    }

    public switchPetAfterPetDead(data) {
        const { playerSwitch, petChosenId } = data;

        const updatedPlayer = ConvetData.ConvertPlayerBattleData(playerSwitch);
        const isMyClient = this.myClient.id === updatedPlayer.id;

        const currentPlayer = isMyClient ? this.myClient : this.targetClient;
        const switchedPet = currentPlayer.battlePets.find(pet => pet.id === petChosenId);

        if (!switchedPet) {
            console.warn("Không tìm thấy pet với ID:", petChosenId);
            return;
        }
        this.createPet(switchedPet, isMyClient);
        this.updateHUDPet(switchedPet, isMyClient);
        // Cập nhật thông tin người chơi tương ứng
        if (isMyClient) {
            this.myClient = updatedPlayer;
        } else {
            this.targetClient = updatedPlayer;
            this.slideSkillButtons.slide(true, 0.3);
        }
    }

    public battleFinished(data) {
        const { winnerId, loserId } = data;
        let winner = this.myClient.id == winnerId;
        console.log("playerWinner", winner);

    }

    async updatePetDead(isMyClient: boolean, callback?: () => void): Promise<void> {
        const playerStats = isMyClient ? this.playerBattleStats[1] : this.playerBattleStats[0];

        if (!playerStats?.petBattlePrefab) {
            console.warn("Không tìm thấy petBattlePrefab để cập nhật trạng thái chết.");
            return;
        }
        await playerStats.petBattlePrefab.setPetDead(callback);
    }

    closeBattle() {
        this.centerOpenSplash.playSplash(() => {
            this._onActionCompleted?.();
            this.closePopup();
        });
    }

    cancelTween() {
        this.playerBattleStats.forEach(playerBattleStat => {
            playerBattleStat?.landSpawnPet?.stopTween();
            playerBattleStat?.hudBattlePet?.slide?.stopTween();
        });
    }

    getActivePetIndexById(player: PlayerBattle): PetBattleInfo {
        if (!player) return null;
        return player.battlePets[player.activePetIndex + 1];
    }

    fakeCombatData: BattleData = {
        environmentType: AnimalElement.Grass,
    };
}

export interface BatllePetParam {
    data: PlayerBattle[];
    clientID: string;
    onActionClose?: () => void;
}