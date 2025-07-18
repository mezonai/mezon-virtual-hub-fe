import { _decorator, Node, tween, Vec3, Tween, Layers, Animation, Prefab, instantiate, Component, Button } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { BattleData, AnimalElement, AnimalRarity, PetDTO, Species, PetDTO2 } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { HandleOpenSplash } from '../utilities/HandleOpenSplash';
import { GameData } from '../gameplay/player/ability/RPSGame';
import { ServerManager } from '../core/ServerManager';
import { ActionType } from '../gameplay/player/ability/PlayerInteractAction';
import { PetBattlePrefab } from '../animal/PetBattlePrefab';
import { SlideObject } from '../utilities/SlideObject';
import { HandleBattleData, HandleCombat } from '../gameplay/Battle/HandleCombat';
import { HUDBattlePet } from '../gameplay/Battle/HUDBattlePet';
import { CombatEnvController } from '../gameplay/Battle/CombatEnvController';
import { SkillData, SkillList } from '../animal/Skills';
import { BattleSkillButton } from '../gameplay/Battle/BattleSkillButton';
const { ccclass, property } = _decorator;
@ccclass('PlayerBattleStats')
export class PlayerBattleStats {
    @property({ type: SlideObject }) landSpawnPet: SlideObject = null;
    @property({ type: Node }) positionSpawnPet: Node = null;
    @property({ type: HUDBattlePet }) hudBattlePet: HUDBattlePet = null;
}
@ccclass('PopupBattlePet')
export class PopupBattlePet extends BasePopup {
    @property({ type: [PlayerBattleStats] }) playerBattleStats: PlayerBattleStats[] = [];
    @property({ type: Prefab }) petBatlle: Prefab = null;
    @property({ type: Prefab }) battleSkillButtonPrefab: Prefab = null;
    @property({ type: Node }) parentMySkill: Node = null;
    @property({ type: HandleOpenSplash }) centerOpenSplash: HandleOpenSplash = null;
    @property({ type: CombatEnvController }) combatEnvController: CombatEnvController = null;
    @property({ type: HandleCombat }) handleCombat: HandleCombat = null;
    @property({ type: SlideObject }) slideChooseButtons: SlideObject = null;
    @property({ type: SlideObject }) slideSkillButtons: SlideObject = null;
    //Button
    @property({ type: Button }) fightButton: Button = null;
    @property({ type: Button }) runButton: Button = null;

    private _onActionCompleted: (() => void) | null = null;

    public async init(param?: BatllePetParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.Init();
        this.handleBattle(param);
        this.addListenerButton();
    }

    addListenerButton() {
        this.fightButton.node.on(Button.EventType.CLICK, async () => {
            await this.slideChooseButtons.slide(false, 0.3);
            await this.slideSkillButtons.slide(true, 0.3);
        }, this);
    }

    handleBattle(param?: BatllePetParam) {
        const paramBattle: HandleBattleData = {
            onCancelBattle: () => {
                let data = {
                    senderAction: "giveup",
                    gameKey: param?.data?.gameKey,
                    action: ActionType.PetCombat.toString(),
                    from: param?.data?.from,
                    to: param?.data?.to
                }
                ServerManager.instance.sendP2pCombatActionEscape(data);
            },
            onCloseBattle: () => {
                this.closeBattle();
            },
            battleData: this.fakeCombatData,
        };
        this.handleCombat.setData(paramBattle);
    }

    private Init() {
        this.resetUIState();
        this.centerOpenSplash.playSplash(() => this.SetDataBattle());
    }

    private resetUIState() {
        this.playerBattleStats.forEach(playerBattleStat => {
            playerBattleStat.landSpawnPet.slide(false, 0);
            playerBattleStat.hudBattlePet.slide.slide(false, 0);
        });
        this.slideChooseButtons.slide(false, 0);
        this.slideSkillButtons.slide(false, 0);
    }

    async SetDataBattle() {
        this.combatEnvController.setEnvironmentByType(this.fakeCombatData.environmentType);
        const hudData = [this.fakeCombatData.pet1, this.fakeCombatData.pet2];
        this.playerBattleStats.forEach((playerBattleStat, index) => {
            playerBattleStat.hudBattlePet.updateHUD(hudData[index]);
        });
        for (const playerBattleStat of this.playerBattleStats) {
            await playerBattleStat.landSpawnPet.slide(true, 0.5);
            await playerBattleStat.hudBattlePet.slide.slide(true, 0.5);
        }
        this.createPet(); // ← Được gọi sau khi tất cả slide xong
    }

    async createPet() {
        const petFakeData = [this.fakeCombatData.pet1, this.fakeCombatData.pet2];
        for (let i = 0; i < this.playerBattleStats.length; i++) {
            ((index) => {
                setTimeout(() => {
                    const playerBattleStat = this.playerBattleStats[index];
                    const newPetBatlle = instantiate(this.petBatlle);
                    newPetBatlle.setParent(playerBattleStat.positionSpawnPet);

                    const petBattlePrefab = newPetBatlle.getComponent(PetBattlePrefab);
                    if (petBattlePrefab) {
                        petBattlePrefab.setDataPet(petFakeData[index], index);
                    }
                }, 500 * index); // delay tăng dần theo index
            })(i);
        }
        this.createMySkill(this.fakeCombatData.pet1.skills)
        this.slideChooseButtons.slide(true, 0.3);
    }

    createMySkill(skillData: SkillData[]) {
        this.parentMySkill.removeAllChildren();
        // Tạo AttackSkill trước
        const attackItem = this.instantiateSkill();
        const attackSkillButton = attackItem.getComponent(BattleSkillButton);
        attackSkillButton?.setData(null);
        // Sau đó tạo các nút skill có dữ liệu
        skillData.forEach((data) => {
            const newItem = this.instantiateSkill();
            const skillButton = newItem.getComponent(BattleSkillButton);
            skillButton?.setData(data);
        });
    }

    instantiateSkill(): Node {
        const newItem = instantiate(this.battleSkillButtonPrefab);
        newItem.setParent(this.parentMySkill);
        return newItem;
    }
    private moveAction(position: Node, to: Vec3, onActionComplete?: () => void, duration: number = 1) {
        position.active = true;
        tween(position)
            .to(duration, { position: to })
            .call(() => {
                onActionComplete?.();
            })
            .start();
    }

    async closePopup() {
        this.cancelTween();
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public showEndCombat(data) {
        this.handleCombat.ShowEndCombat(data);
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

    fakeCombatData: BattleData = {
        environmentType: AnimalElement.Grass,
        pet2: {
            id: "6c7cd72a-17aa-4621-a3f1-1d9cff789dda",
            name: "Dog",
            species: Species.Dog,
            is_caught: true,
            room_code: "hn3",
            is_brought: false,
            rarity: AnimalRarity.COMMON,
            type: AnimalElement.Normal,
            isMe: true,
            lvl: 1,
            currentHp: 65,
            maxHp: 65,
            currentExp: 1,
            maxExp: 100,
            skills: [SkillList[0], SkillList[14]]
        },
        pet1: {
            id: "172387d6-b17b-4b01-a5a8-ca43bac2de2d",
            name: "Cat",
            species: Species.Cat,
            is_caught: true,
            room_code: "hn1",
            is_brought: false,
            rarity: AnimalRarity.COMMON,
            type: AnimalElement.Normal,
            isMe: false,
            lvl: 1,
            currentHp: 40,
            maxHp: 40,
            currentExp: 1,
            maxExp: 100,
            skills: [SkillList[16], SkillList[19]]
        }
    };
}

export interface BatllePetParam {
    data: GameData;
}