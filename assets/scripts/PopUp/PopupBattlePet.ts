import { _decorator, Node, Prefab, instantiate, Button } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { BattleData, Element, PlayerBattle, PetBattleInfo, SkillBattleInfo, TypeSkill, SkillCode } from '../Model/PetDTO';
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
import { PopupWinLoseBattle, StatusBattle, WinLoseBattleParam } from './PopupWinLoseBattle';
import { Component } from 'cc';
import { UserManager } from '../core/UserManager';
import { Constants } from '../utilities/Constants';
import { AnimalType } from '../animal/AnimalController';
import { PopupPetElementChart } from './PopupPetElementChart';
import { BGMType, SoundManager } from '../core/SoundManager';
import { Label } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('PlayerBattleStats')
export class PlayerBattleStats {
    @property({ type: SlideObject }) landSpawnPet: SlideObject = null;
    @property({ type: HUDBattlePet }) hudBattlePet: HUDBattlePet = null;
    @property({ type: PetBattlePrefab }) petBattlePrefab: PetBattlePrefab = null;
}
@ccclass('PopupBattlePet')
export class PopupBattlePet extends Component {
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
    @property({ type: Label }) timeRemaning: Label = null;
    //Button
    @property({ type: Button }) hideSkillButton: Button = null;
    @property({ type: Button }) fightButton: Button = null;
    @property({ type: Button }) petChartButton: Button = null;
    @property({ type: Button }) surrenderButton: Button = null;
    private mySkillsBatte: BattleSkillButton[] = []
    private _onActionCompleted: (() => void) | null = null;
    myClient: PlayerBattle = null;
    targetClient: PlayerBattle = null;
    clientIdInRoom: string = "";


    setData(param?: BatllePetParam) {
        this.Init(param);
        this.addListenerButton();
        this.node.active = true;
    }

    addListenerButton() {
        this.fightButton.addAsyncListener(async () => {
            await this.slideChooseButtons.slide(false, 0.3);
            await this.slideSkillButtons.slide(true, 0.3);
        });
        this.surrenderButton.addAsyncListener(async () => {
            ServerManager.instance.sendSurrenderBattle();
            await Constants.waitUntil(() => !this.node.activeInHierarchy);
        });
        this.hideSkillButton.addAsyncListener(async () => {
            this.hideSkillButton.interactable = false;
            await this.slideSkillButtons.slide(false, 0.3);
            await this.slideChooseButtons.slide(true, 0.3);
            this.hideSkillButton.interactable = true;
        });
        this.petChartButton.addAsyncListener(async () => {
            this.petChartButton.interactable = false;
            await PopupManager.getInstance().openAnimPopup("PopupPetElementChart", PopupPetElementChart);
            this.petChartButton.interactable = true;
        });
    }

    private Init(param?: BatllePetParam) {
        SoundManager.instance.stopBgmLoop();
        SoundManager.instance.playBgm(BGMType.Combat);
        this.playerBattleStats.forEach(playerBattleStat => {
            playerBattleStat.landSpawnPet.slide(false, 0);
            playerBattleStat.hudBattlePet.slide.slide(false, 0);
            playerBattleStat.petBattlePrefab.resetPet();
        });
        this.slideChooseButtons.slide(false, 0);
        this.slideSkillButtons.slide(false, 0);
        this.hideTalkAnimation();
        this.myClient = null;
        this.targetClient = null;
        this.clientIdInRoom = "";
        this.mySkillsBatte = [];
        this._onActionCompleted = null;
        this.setTimeRemaining(0);
        this.centerOpenSplash.playSplash(() => this.SetDataBattle(param));
    }

    async SetDataBattle(param?: BatllePetParam) {
        if (!param || !param.data) {
            this.closeBattle();
            return;
        }
        if (param.onActionClose) this._onActionCompleted = param.onActionClose;
        this.clientIdInRoom = UserManager.instance.GetMyClientPlayer.myClientBattleId;
        this.combatEnvController.setEnvironmentByType(param.enviromentBattle);
        this.myClient = param.data.find(p => p.id === this.clientIdInRoom);
        this.targetClient = param.data.find(p => p.id !== this.clientIdInRoom);


        if (!this.myClient || !this.targetClient) {
            this.closeBattle();
            return;
        }

        const myPet = this.myClient.battlePets?.[this.myClient.activePetIndex];
        const targetPet = this.targetClient.battlePets?.[this.targetClient.activePetIndex];

        if (!myPet || !targetPet) {
            this.closeBattle();
            return;
        }

        this.updateHUDPet(myPet, this.myClient, true);
        this.updateHUDPet(targetPet, this.targetClient, false);

        for (const playerBattleStat of this.playerBattleStats) {
            await playerBattleStat.landSpawnPet.slide(true, 0.5);
            await playerBattleStat.hudBattlePet.slide.slide(true, 0.5);
        }

        await this.createPet(myPet, true); // tạo pet của mình (hoặc pet1)
        await Constants.waitForSeconds(0.5);
        await this.createPet(targetPet, false); // tạo pet của đối thủ (hoặc pet2)
        this.setNewTurn();
    }

    async handleActionSkill(playerAttackId: string, petAttack: PetBattleInfo, skillUsing: SkillBattleInfo, effectValueSkill: number, damage: number, petDefense: PetBattleInfo): Promise<void> {
        const isSelfAttacker = playerAttackId === this.clientIdInRoom;
        const attacker = this.playerBattleStats[isSelfAttacker ? 1 : 0];
        const defender = this.playerBattleStats[isSelfAttacker ? 0 : 1];
        const skill = SkillList.find(s => s.idSkill === skillUsing.skill_code);
        if (skill != null && isSelfAttacker) {
            const talk = `${attacker.petBattlePrefab.currentPet.name} đang sủ dụng ${skill.name}`;
            this.updateMySkillInBattle(skillUsing);
            await this.showTalkAnimation(talk);
        }
        await this.usingSkill(skillUsing.skill_code
            , isSelfAttacker
            , attacker
            , defender
            , petAttack
            , this.parentBatteUI);
        await this.handleChangeEffectValue(skillUsing, attacker, defender, effectValueSkill, damage, petAttack, petDefense);
        this.hideTalkAnimation();
    }

    async usingSkill(
        skillId: SkillCode,
        isSelfAttacker: boolean,
        attacker: PlayerBattleStats,
        defender: PlayerBattleStats,
        petAttack: PetBattleInfo,
        parent: Node
    ): Promise<void> {
        const attackerPrefab = attacker.petBattlePrefab;
        const targetPrefab = defender.petBattlePrefab;

        const skillSelfTarget = [
            SkillCode.ATTACK, SkillCode.CUT, SkillCode.POUND, SkillCode.DOUBLE_KICK, SkillCode.BITE, SkillCode.CRUSH_CLAW, SkillCode.FURY_PUNCH,
            SkillCode.RAZOR_LEAF, SkillCode.VINE_WHIP, SkillCode.THUNDERBOLT, SkillCode.THUNDER_WAVE, SkillCode.BUBBLE,
            SkillCode.ICICLE_CRASH, SkillCode.ICE_FANG, SkillCode.DRAGON_CLAW
        ];
        attacker.hudBattlePet.setSleep(petAttack.isSleeping);
        const skillSelfAttacker = [SkillCode.GROWL, SkillCode.PROTECT, SkillCode.ABSORB, SkillCode.AQUA_CUTTER];

        switch (skillId) {
            case SkillCode.ATTACK:
                await attackerPrefab.playTackleEffect(isSelfAttacker ? 'right' : 'left');
                break;
            case SkillCode.REST:
                await attackerPrefab.scaleInOut(attackerPrefab);
                if (isSelfAttacker) {
                    ServerManager.instance.sendPetSleeping(petAttack.id);
                }
                attacker.hudBattlePet.setSleep(true);
                break;
            case SkillCode.WING_ATTACK:
                await attackerPrefab.skillMovementFromTo(skillId, attackerPrefab, targetPrefab, parent);
                break;

            case SkillCode.EARTHQUAKE:
                await attackerPrefab.earthquake(parent, 0.5, 15);
                break;

            case SkillCode.ELECTRO_BALL:
            case SkillCode.FIRE_BLAST:
                await attackerPrefab.skillMovementFromTo(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;

            case SkillCode.WATER_GUN:
                await attackerPrefab.throwSkillImage(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;

            case SkillCode.EMBER:
                await attackerPrefab.spraySkill(skillId, attackerPrefab, targetPrefab, parent);
                await targetPrefab.usingSkillYourself(skillId);
                break;
            case SkillCode.OVERHEAT:
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
        skill: SkillBattleInfo,
        attacker: PlayerBattleStats,
        defender: PlayerBattleStats,
        effectValueSkill: number,
        damage: number,
        petAttack: PetBattleInfo,
        petDefense: PetBattleInfo
    ): Promise<void> {
        const { typeSkill } = skill;

        const takeDamageIfNeeded = async () => {
            if (damage > 0) {
                await defender.petBattlePrefab.shakeNode();
                await defender.hudBattlePet.showEffectChangeValue(TypeSkill.ATTACK, damage);
                await defender.hudBattlePet.takeDamage(petDefense.currentHp, petDefense.totalHp);
            }
        };

        const showEffectAndUpdate = async (
            player: PlayerBattleStats,
            pet: PetBattleInfo,
            effectType: TypeSkill
        ) => {
            await player.hudBattlePet.showEffectChangeValue(effectType, effectValueSkill);
            player.hudBattlePet.updatePetStatsDisplay(pet);
        };

        switch (typeSkill) {
            case TypeSkill.ATTACK:
                await takeDamageIfNeeded();
                break;

            case TypeSkill.DECREASE_ATTACK:
                await takeDamageIfNeeded();
                if (!petDefense.isDead) {
                    await showEffectAndUpdate(defender, petDefense, TypeSkill.DECREASE_ATTACK);
                }
                break;

            case TypeSkill.INCREASE_ATTACK:
                await takeDamageIfNeeded();
                await showEffectAndUpdate(attacker, petAttack, TypeSkill.INCREASE_ATTACK);
                break;

            case TypeSkill.HEAL:
                await showEffectAndUpdate(attacker, petAttack, TypeSkill.HEAL);
                await attacker.hudBattlePet.heal(effectValueSkill, petAttack.currentHp, petAttack.totalHp);
                break;

            default:
                break;
        }
    }

    updateHUDPet(pet: PetBattleInfo, player: PlayerBattle, isMyClient: boolean) {
        const index = isMyClient ? 1 : 0;
        const playerBattleStat = this.playerBattleStats[index];
        playerBattleStat.hudBattlePet.updateHUD(pet, player);
    }

    async createPet(pet: PetBattleInfo, isMyClient: boolean) {
        const index = isMyClient ? 1 : 0;
        const playerBattleStat = this.playerBattleStats[index];
        await playerBattleStat.petBattlePrefab.setDataPet(pet, index);
        if (!isMyClient) return;
        await this.createMySkill(pet)
    }

    async createMySkill(pet: PetBattleInfo): Promise<void> {
        this.slideChooseButtons.slide(false, 0);
        this.parentMySkill.removeAllChildren();
        this.mySkillsBatte = [];

        // Tạo các nút skill có dữ liệu
        for (let index = 0; index < pet.skills.length; index++) {
            const skill = pet.skills[index];
            const newItem = instantiate(this.battleSkillButtonPrefab);
            newItem.setParent(this.parentMySkill);
            const skillButton = newItem.getComponent(BattleSkillButton);
            if (skillButton) {
                await skillButton.setData(skill, index, this.onClickSkill.bind(this));
                this.mySkillsBatte.push(skillButton);
            }
        }
    }

    updateMySkillInBattle(skillUsing: SkillBattleInfo) {
        if (skillUsing == null) return;
        const skillButton = this.mySkillsBatte.find(x => x.idSkill === skillUsing.skill_code);
        skillButton?.updatePowerPoint(skillUsing);
    }

    async onClickSkill() {
        this.slideSkillButtons.slide(false, 0.3);
    }

    public async handleBattleResult(data) {
        const { turn1, turn2 } = data;
        this.hideTalkAnimation();
        const isTurn1PetAlive = await this.handleBattlePlayer(turn1.playerAttackTurn1, turn1.skillAttackTurn1, turn1.effectValueTurn1, turn1.damageTurn1, turn1.playerDefenseTurn1);
        if (!isTurn1PetAlive) return;
        const isTurn2PetAlive = await this.handleBattlePlayer(turn2.playerAttackTurn2, turn2.skillAttackTurn2, turn2.effectValueTurn2, turn2.damageTurn2, turn2.playerDefenseTurn2);
        if (!isTurn2PetAlive) return;
        this.setNewTurn();
    }

    setNewTurn() {
        ServerManager.instance.sendEndTurn();
        this.slideSkillButtons.slide(true, 0.3);
    }

    private async handleBattlePlayer(
        attacker: any,
        skillAttack: any,
        effectValueSkill: number,
        damagePlayer: number,
        defender: any,
    ): Promise<boolean> {
        const playerAttack = ConvetData.ConvertPlayerBattleData(attacker);
        const playerDefense = ConvetData.ConvertPlayerBattleData(defender);
        const isMyClientTarget = playerDefense.id === this.clientIdInRoom;
        if (isMyClientTarget) {
            this.myClient = playerDefense;
        } else {
            this.targetClient = playerDefense;
        }
        const petAttack = playerAttack.battlePets[playerAttack.activePetIndex];
        const petDefense = playerDefense.battlePets[playerDefense.activePetIndex];
        if (petAttack.isSleeping) {
            if (!isMyClientTarget) {
                await this.showTalkAnimation(`Pet vẫn đang ngủ!`);
                this.hideTalkAnimation();
            }
            return true;
        }
        const skillUsing = ConvetData.convertToSkillData(skillAttack);
        await this.handleActionSkill(playerAttack.id, petAttack, skillUsing, effectValueSkill, damagePlayer, petDefense);
        if (petDefense.isDead) {
            if (isMyClientTarget) {
                await this.showTalkAnimation(`Pet mất khả năng chiến đấu rồi!`);
                this.hideTalkAnimation();
            }
            await this.updatePetDead(isMyClientTarget, () => {
                let nextPet = this.getActivePetIndexById(playerDefense);
                if (isMyClientTarget) {
                    let petSwitchId = nextPet == null ? "-1" : nextPet.id;
                    ServerManager.instance.sendSwitchPetAfterPetDead(petSwitchId);
                }
            });
            return false;
        }
        return true;
    }

    public async switchPetAfterPetDead(data) {
        const { playerSwitch, petChosenId } = data;

        const updatedPlayer = ConvetData.ConvertPlayerBattleData(playerSwitch);
        const isMyClient = this.myClient.id === updatedPlayer.id;

        const currentPlayer = isMyClient ? this.myClient : this.targetClient;
        const switchedPet = currentPlayer.battlePets.find(pet => pet.id === petChosenId);

        if (!switchedPet) {
            console.warn("Không tìm thấy pet với ID:", petChosenId);
            return;
        }
        await Constants.waitForSeconds(1);
        await this.createPet(switchedPet, isMyClient);
        this.updateHUDPet(switchedPet, updatedPlayer, isMyClient);
        // Cập nhật thông tin người chơi tương ứng
        if (isMyClient) {
            this.myClient = updatedPlayer;
        } else {
            this.targetClient = updatedPlayer;
        }
        this.setNewTurn();
    }

    public async battleFinished(data) {
        const { id, expReceived, dimondChallenge, currentPets, isWinner } = data;
        await Constants.waitUntil(() => this.myClient != null);
        const param: WinLoseBattleParam = {
            petsDataBeforeUpdate: this.myClient.battlePets,
            petsDataAfterUpdate: currentPets,
            statusBattle: isWinner ? StatusBattle.WIN : StatusBattle.LOSE,
            dimondChallenge: dimondChallenge,
            expAddedPerPet: expReceived,
        };
        this.closeBattle();
        await PopupManager.getInstance().openAnimPopup('PopupWinLoseBattle', PopupWinLoseBattle, param);
        SoundManager.instance.stopBgmLoop();
        SoundManager.instance.playBgm(BGMType.Game);
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
        this.centerOpenSplash.playSplash(async () => {
            this._onActionCompleted?.();
            this.cancelTween();
            await ServerManager.instance.leaveBattleRoom();
            this.node.active = false;
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

    setTimeRemaining(time: number) {
        this.timeRemaning.string = time.toString();
    }

    autoAttack() {
        if (this.mySkillsBatte == null || this.mySkillsBatte.length <= 0) return;
        this.mySkillsBatte[0].clickSkill();
    }
}

export interface BatllePetParam {
    data: PlayerBattle[];
    enviromentBattle: Element;
    onActionClose?: () => void;
}