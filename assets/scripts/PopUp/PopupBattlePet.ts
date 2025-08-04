import { _decorator, Node, Prefab, instantiate, Button } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { BattleData, AnimalElement, PlayerBattle, PetBattleInfo, SkillData, TypeSkill } from '../Model/PetDTO';
import { HandleOpenSplash } from '../utilities/HandleOpenSplash';
import { PetBattlePrefab } from '../animal/PetBattlePrefab';
import { SlideObject } from '../utilities/SlideObject';
import { HUDBattlePet } from '../gameplay/Battle/HUDBattlePet';
import { CombatEnvController } from '../gameplay/Battle/CombatEnvController';
import { BattleSkillButton } from '../gameplay/Battle/BattleSkillButton';
import ConvetData from '../core/ConvertData';
import { ServerManager } from '../core/ServerManager';
import { TalkAnimation } from '../utilities/TalkAnimation';
import { SkillList } from '../animal/Skills';
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
    @property({ type: Node }) parentBatteUI: Node = null;
    @property({ type: HandleOpenSplash }) centerOpenSplash: HandleOpenSplash = null;
    @property({ type: CombatEnvController }) combatEnvController: CombatEnvController = null;
    @property({ type: SlideObject }) slideChooseButtons: SlideObject = null;
    @property({ type: SlideObject }) slideSkillButtons: SlideObject = null;
    @property({ type: SlideObject }) slideTalkAnimation: SlideObject = null;
    @property({ type: TalkAnimation }) talkAnimation: TalkAnimation = null;
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
        this.hideTalkAnimation();
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

    async handleActionSkill(playerAttackId: string, skillUsed: SkillData, damage: number, petDefense: PetBattleInfo): Promise<void> {
        const isSelfAttacker = playerAttackId === this.clientIdInRoom;
        const attacker = this.playerBattleStats[isSelfAttacker ? 1 : 0];
        const defender = this.playerBattleStats[isSelfAttacker ? 0 : 1];
        const skill = SkillList.find(s => s.idSkill === skillUsed.id);
        if (skill != null && isSelfAttacker) {
            const talk = `${attacker.petBattlePrefab.currentPet.name} đang sủ dụng ${skill.name}`;
            await this.showTalkAnimation(talk);
        }
        await this.usingSkill(skillUsed.id
            , isSelfAttacker ? 'right' : 'left'
            , attacker
            , defender
            , this.parentBatteUI);
        await this.handleChangeEffectValue(skillUsed, attacker, defender, damage, petDefense);
        this.hideTalkAnimation();
    }

    async usingSkill(
        skillId: string,
        direction: string,
        attacker: PlayerBattleStats,
        target: PlayerBattleStats,
        parent: Node
    ): Promise<void> {
        const attackerPrefab = attacker.petBattlePrefab;
        const targetPrefab = target.petBattlePrefab;

        const skillSelfTarget = [
            "NOR05", "NOR06", "NOR07", "NOR08", "NOR09", "NOR12",
            "GRASS01", "ELECTRIC01", "ELECTRIC02", "WATER02",
            "ICE02", "ICE03", "DRAGON01"
        ];

        const skillSelfAttacker = ["NOR01", "NOR02", "GRASS02", "WATER03"];

        switch (skillId) {
            case "ATTACK01":
                await attackerPrefab.playTackleEffect(direction);
                break;

            case "NOR10":
                await attackerPrefab.skillMovementFromTo(skillId, attackerPrefab, targetPrefab, parent);
                break;

            case "NOR13":
                await attackerPrefab.earthquake(parent, 0.5, 15);
                break;

            case "ELECTRIC03":
            case "FIRE02":
                await attackerPrefab.skillMovementFromTo(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;

            case "WATER01":
                await attackerPrefab.throwSkillImage(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;

            case "FIRE01":
                await attackerPrefab.spraySkill(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;

            case "ICE01":
                await attackerPrefab.throwSkillImage(skillId, attackerPrefab, targetPrefab, parent);
                break;

            default:
                if (skillSelfAttacker.includes(skillId)) {
                    await attackerPrefab.usingSkillYourself(skillId);
                } else if (skillSelfTarget.includes(skillId)) {
                    await targetPrefab.usingSkillYourself(skillId);
                } else {
                    await attackerPrefab.usingSkillYourself(skillId); // fallback
                }
                break;
        }
    }

    async handleChangeEffectValue(
        skill: SkillData,
        attacker: PlayerBattleStats,
        defender: PlayerBattleStats,
        damage: number,
        petDefense: PetBattleInfo
    ): Promise<void> {
        const { typeSkill } = skill;

        const takeDamage = async () => {
            if (damage > 0) {
                await defender.petBattlePrefab.shakeNode();
                await defender.hudBattlePet.takeDamage(damage, petDefense.currentHp, petDefense.totalHp);
            }
        };

        switch (typeSkill) {
            case TypeSkill.ATTACK: {
                await takeDamage();
                break;
            }

            case TypeSkill.DECREASE_ATTACK: {
                await takeDamage();
                await defender.hudBattlePet.showEffectChangeValue(TypeSkill.DECREASE_ATTACK); // dùng chung hiệu ứng
                break;
            }

            case TypeSkill.INCREASE_ATTACK: {
                await takeDamage();
                await attacker.hudBattlePet.showEffectChangeValue(TypeSkill.INCREASE_ATTACK);
                break;
            }

            case TypeSkill.HEAL: {
                await attacker.hudBattlePet.heal(damage, petDefense.currentHp, petDefense.totalHp);
                await attacker.hudBattlePet.showEffectChangeValue(TypeSkill.HEAL);
                break;
            }

            default:
                break;
        }
    }

    updateHUDPet(pet: PetBattleInfo, isMyClient: boolean) {
        const index = isMyClient ? 1 : 0;
        const playerBattleStat = this.playerBattleStats[index];
        playerBattleStat.hudBattlePet.updateHUD(pet);
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

    async onClickSkill() {
        this.slideSkillButtons.slide(false, 0.3);
    }

    async closePopup() {
        this.cancelTween();
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public async handleBattleResult(data) {
        this.hideTalkAnimation();
        const isTurn1PetAlive = await this.handleBattlePlayer(data.player1Id, data.skillAttackPlayer1, data.damagePlayer1, data.playerTargetP1);
        if (!isTurn1PetAlive) return;
        const isTurn2PetAlive = await this.handleBattlePlayer(data.player2Id, data.skillAttackPlayer2, data.damagePlayer2, data.playerTargetP2);
        if (!isTurn2PetAlive) return;
        this.slideSkillButtons.slide(true, 0.3);
    }

    private async handleBattlePlayer(
        playerId: string,
        killAttackPlayer: any,
        damagePlayer: number,
        target: any,
    ): Promise<boolean> {
        const playerTarget = ConvetData.ConvertPlayerBattleData(target);
        const skill = ConvetData.convertToSkillData(killAttackPlayer);
        const isMyClient = playerTarget.id === this.clientIdInRoom;
        if (isMyClient) {
            this.myClient = playerTarget;
        } else {
            this.targetClient = playerTarget;
        }
        const petTarget = playerTarget.battlePets[playerTarget.activePetIndex];
        await this.handleActionSkill(playerId, skill, damagePlayer, petTarget);
        if (petTarget.isDead) {
            if (isMyClient) {
                await this.showTalkAnimation(`Pet mất khả năng chiến đấu rồi!`);
                this.hideTalkAnimation();
            }
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

    public WaitingOpponents(data) {
        this.showTalkAnimation("Vui lòng đợi đối thủ chọn kỹ năng");
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

    async showTalkAnimation(content: string): Promise<void> {
        this.hideTalkAnimation();
        this.slideTalkAnimation.slide(true, 0);
        this.talkAnimation.displayDialog(content, 0.3, null, false);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ hiệu ứng bubble chạy xong 0.3s
    }

    async hideTalkAnimation() {
        this.talkAnimation.cancelDisplayDialog();
        this.slideTalkAnimation.slide(false, 0);
    }
}

export interface BatllePetParam {
    data: PlayerBattle[];
    clientID: string;
    onActionClose?: () => void;
}