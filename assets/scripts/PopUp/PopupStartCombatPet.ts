import { _decorator, Node, tween, Vec3, Tween, Sprite, Color } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { CenterOpenSplash } from '../utilities/CenterOpenSplash';
import { HandleCombat } from '../gameplay/combat/HandleCombat';
const { ccclass, property } = _decorator;

@ccclass('PopupStartCombatPet')
export class PopupStartCombatPet extends BasePopup {
    @property({ type: Node }) selectionNode: Node = null;
    @property({ type: Node }) iconSelection: Node = null;

    @property({ type: Node }) combatUI: Node = null;
    @property({ type: Node }) position1: Node = null;
    @property({ type: Node }) position2: Node = null;
    @property({ type: Node }) pet1: Node = null;
    @property({ type: Node }) pet2: Node = null;
    @property({ type: Node }) positionHUD1: Node = null;
    @property({ type: Node }) positionHUD2: Node = null;
    @property({ type: Node }) dialogUI: Node = null;
    @property({ type: CenterOpenSplash }) centerOpenSplash: CenterOpenSplash = null;

    private positionFootPlayerInit1: Vec3 = new Vec3(-250, 20, 0);
    private positionFootPlayerInit2: Vec3 = new Vec3(250, -28, 0);
    private positionFootNearPlayer1: Vec3 = new Vec3(78, 20, 0);
    private positionFootNearPlayer2: Vec3 = new Vec3(-78, -28, 0);

    private positionHUDPlayerInit1: Vec3 = new Vec3(300, 50, 0);
    private positionHUDPlayerInit2: Vec3 = new Vec3(-300, -16, 0);
    private positionHUDNearPlayer1: Vec3 = new Vec3(-73, 50, 0);
    private positionHUDNearPlayer2: Vec3 = new Vec3(73, -16, 0);


    private _onActionCompleted: (() => void) | null = null;

    public async init(param?: PopupTutorialCombatPetParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.initilize(param);
    }

    private initilize(param?: PopupTutorialCombatPetParam) {
        if (param?.onActionCompleted) {
            this._onActionCompleted = param.onActionCompleted;
        }
        this.selectionNode.active = false;
        this.Init();
    }

    private Init() {
        this.combatUI.active = false;
        this.dialogUI.active = false;
        this.pet1.active = false;
        this.pet2.active = false;
        this.position1.active = false;
        this.position2.active = false;
        this.positionHUD1.active = false;
        this.positionHUD2.active = false;
        this.position1.position = this.positionFootPlayerInit1;
        this.position2.position = this.positionFootPlayerInit2;
        this.positionHUD1.position = this.positionHUDPlayerInit1;
        this.positionHUD2.position = this.positionHUDPlayerInit2;
        this.centerOpenSplash.playSplash(() => {
            this.StartCombat();
        });
    }

    StartCombat() {
        this.combatUI.active = true;
        this.moveUIPlayer(this.position1, this.positionFootNearPlayer1, () => {
        }, 0.3);
        this.moveUIPlayer(this.position2, this.positionFootNearPlayer2, () => {
        }, 0.3);
        this.moveUIPlayer(this.positionHUD1, this.positionHUDNearPlayer1, () => {
        });
        this.moveUIPlayer(this.positionHUD2, this.positionHUDNearPlayer2, () => {
            setTimeout(() => {
                this.dialogUI.active = true;
                this.showBothPets(this.pet1, this.pet2);
            }, 500);
        });
    }

    showBothPets(pet1: Node, pet2: Node) {
        this.showPetAppearEffect(pet1);
        setTimeout(() => {
            this.showPetAppearEffect(pet2);
        }, 500);
    }

    async showPetAppearEffect(petNode: Node) {
        petNode.active = true;
        await new Promise<void>((resolve) => {
            tween(petNode)
                .to(0.3, { scale: new Vec3(petNode.scale.x * 1.2, 1.2, 1.2) })
                .call(() => resolve())
                .start();
        });
    }

    cancelCombat() {
        this.centerOpenSplash.playSplash(() => {
            this._onActionCompleted?.();
            this.closePopup();
        });
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

    cancelTween() {
        Tween.stopAllByTarget(this.position1);
        Tween.stopAllByTarget(this.position2);
        Tween.stopAllByTarget(this.positionHUD1);
        Tween.stopAllByTarget(this.positionHUD2);
    }
}

export interface PopupTutorialCombatPetParam {
    onActionCompleted?: () => void;
}