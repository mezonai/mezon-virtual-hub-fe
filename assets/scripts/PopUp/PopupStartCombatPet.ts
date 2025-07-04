import { _decorator, Node, tween, Vec3, Tween, Layers, Animation } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { CombatEnvController } from '../gameplay/combat/CombatEnvController';
import { CombatStartData, AnimalElement, AnimalRarity, PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { CombatPetHUD } from '../gameplay/combat/CombatPetHUD';
import { getPetAssetByName } from '../gameplay/combat/PetAssetDatabase';
import { AnimalController, AnimalType } from '../animal/AnimalController';
import { HandleOpenSplash } from '../utilities/HandleOpenSplash';
import { GameData } from '../gameplay/player/ability/RPSGame';
import { ServerManager } from '../core/ServerManager';
import { ActionType } from '../gameplay/player/ability/PlayerInteractAction';
import { HandleCombat } from '../gameplay/combat/HandleCombat';
const { ccclass, property } = _decorator;

@ccclass('PopupStartCombatPet')
export class PopupStartCombatPet extends BasePopup {
    @property({ type: Node }) combatUI: Node = null;
    @property({ type: Node }) position1: Node = null;
    @property({ type: Node }) position2: Node = null;
    @property({ type: Node }) positionHUD1: Node = null;
    @property({ type: Node }) positionHUD2: Node = null;
    @property({ type: CombatPetHUD }) player1: CombatPetHUD = null;
    @property({ type: CombatPetHUD }) player2: CombatPetHUD = null;
    @property({ type: Node }) dialogUI: Node = null;
    @property({ type: HandleOpenSplash }) centerOpenSplash: HandleOpenSplash = null;
    @property({ type: CombatEnvController }) combatEnvController: CombatEnvController = null;
    @property({ type: HandleCombat }) handleCombat: HandleCombat = null;

    private positionFoot = {
        playerInit1: new Vec3(-250, 20, 0),
        playerInit2: new Vec3(250, -28, 0),
        nearPlayer1: new Vec3(78, 20, 0),
        nearPlayer2: new Vec3(-78, -28, 0)
    };

    private positionHUD = {
        playerInit1: new Vec3(300, 50, 0),
        playerInit2: new Vec3(-300, -16, 0),
        nearPlayer1: new Vec3(-73, 50, 0),
        nearPlayer2: new Vec3(73, -16, 0)
    };

    private _onActionCompleted: (() => void) | null = null;
    private defaultLayer = Layers.Enum.NONE;
    private gameData :GameData;

    public async init(param?: GameData) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.initilize(param);
    }

    private initilize(param?: GameData) {
        console.log("Data tranfer: "+JSON.stringify(param));
        this.gameData = param;
        this.Init();
    }

    private Init() {
        this.resetUIState();
        this.resetPositions();
        this.centerOpenSplash.playSplash(() => this.StartCombat());
    }

    private resetUIState() {
        this.combatUI.active = false;
        this.dialogUI.active = false;
        this.position1.active = false;
        this.position2.active = false;
        this.positionHUD1.active = false;
        this.positionHUD2.active = false;
    }

    private resetPositions() {
        this.position1.position = this.positionFoot.playerInit1;
        this.position2.position = this.positionFoot.playerInit2;
        this.positionHUD1.position = this.positionHUD.playerInit1;
        this.positionHUD2.position = this.positionHUD.playerInit2;
    }

    StartCombat() {
        this.combatUI.active = true;
        this.SetDataCombat();
        this.PlayAnimIntroBattle();
    }

    SetDataCombat() {
        this.combatEnvController.setEnvironmentByType(this.fakeCombatData.environmentType);
        this.player1?.updateHUD(this.fakeCombatData.pet1);
        this.player2?.updateHUD(this.fakeCombatData.pet2);
    }

    PlayAnimIntroBattle() {
        this.moveUIPlayer(this.position1, this.positionFoot.nearPlayer1, () => {
        }, 0.3);
        this.moveUIPlayer(this.position2, this.positionFoot.nearPlayer2, () => {
        }, 0.3);
        this.moveUIPlayer(this.positionHUD1, this.positionHUD.nearPlayer1, () => {
        });
        this.moveUIPlayer(this.positionHUD2, this.positionHUD.nearPlayer2, () => {
            setTimeout(() => {
                this.dialogUI.active = true;
                this.showBothPets();
            }, 500);
        });
    }

    showBothPets() {
        this.showPetAppearEffect(this.position1, true, this.fakeCombatData.pet1);
        setTimeout(() => {
            this.showPetAppearEffect(this.position2, false, this.fakeCombatData.pet2);
        }, 500);
    }

    setLayerAnimal(isReturnPool: boolean, animalController: AnimalController) {
        animalController.spriteNode.layer = isReturnPool ? this.defaultLayer : Layers.Enum.UI_2D;
    }

    async showPetAppearEffect(positionParent: Node, isPet1: boolean, petInfo: PetDTO) {
        const animalObject = ObjectPoolManager.instance.spawnFromPool(petInfo.species);
        if (!animalObject) return;

        animalObject.setParent(positionParent);

        const animalController = animalObject.getComponent(AnimalController);
        if (!animalController) return;

        this.playAnimation(animalObject);
        this.setupPetTransform(animalObject, isPet1, petInfo.name);

        animalController.setDataPet(null, AnimalType.NoMove);
        this.defaultLayer = animalController.spriteNode.layer;
        this.setLayerAnimal(false, animalController);
    }

    private playAnimation(animalObject: Node) {
        const animation = animalObject.getComponentInChildren(Animation);
        if (!animation || animation.clips.length === 0) return;

        const clips = animation.clips;
        const targetClip = clips.length >= 2 ? clips[1] : clips[0];

        animation.defaultClip = targetClip;
        animation.play(targetClip.name);
    }

    private setupPetTransform(animalObject: Node, isPet1: boolean, petName: string) {
        const config = getPetAssetByName(petName);
        animalObject.setPosition(new Vec3(0, config.offsetY, 0));
        const baseScale = new Vec3(config.scale, config.scale, config.scale);
        if (isPet1) baseScale.x *= -1;

        animalObject.setScale(baseScale);
    }

    cancelCombat(action) {
        let data = {
            senderAction: action,
            gameKey: this.gameData?.gameKey,
            action: ActionType.PetCombat.toString(),
            from: this.gameData?.from,
            to: this.gameData?.to
        }
        ServerManager.instance.sendP2pCombatActionEscape(data);
    }

    protected onDisable(): void {
        this.cancelTween();
    }

    private moveUIPlayer(position: Node, to: Vec3, onActionComplete?: () => void, duration: number = 1) {
        position.active = true;
        tween(position)
            .to(duration, { position: to })
            .call(() => {
                onActionComplete?.();
            })
            .start();
    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public showEndCombat(data){
        this.handleCombat.ShowEndCombat(data);
    }
    
    public closeComBat(){
        this.centerOpenSplash.playSplash(() => {
            this._onActionCompleted?.();
            this.closePopup();
        });
    }

    cancelTween() {
        Tween.stopAllByTarget(this.position1);
        Tween.stopAllByTarget(this.position2);
        Tween.stopAllByTarget(this.positionHUD1);
        Tween.stopAllByTarget(this.positionHUD2);
    }

    fakeCombatData: CombatStartData = {
        environmentType: AnimalElement.Grass,
        pet2: {
            id: "6c7cd72a-17aa-4621-a3f1-1d9cff789dda",
            name: "Dog",
            species: "Dog",
            is_caught: true,
            room_code: "hn3",
            is_brought: false,
            rarity: AnimalRarity.COMMON,
            type: AnimalElement.Normal,
            lvl: 1,
            currentHp: 65,
            maxHp: 65,
            currentExp: 1,
            maxExp: 100,
            skills: [0, 1]
        },
        pet1: {
            id: "172387d6-b17b-4b01-a5a8-ca43bac2de2d",
            name: "Cat",
            species: "Cat",
            is_caught: true,
            room_code: "hn1",
            is_brought: false,
            rarity: AnimalRarity.COMMON,
            type: AnimalElement.Normal,
            lvl: 1,
            currentHp: 40,
            maxHp: 40,
            currentExp: 1,
            maxExp: 100,
            skills: [2, 3]
        }
    };

}