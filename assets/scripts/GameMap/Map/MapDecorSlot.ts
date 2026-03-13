import { _decorator, Component, Node, instantiate, Prefab } from 'cc';
import { DecorPlaceholderDTO, DecorType } from '../../Model/Item';
import { Ability } from '../../gameplay/player/ability/Ability';
import { CCFloat } from 'cc';
import { Vec3 } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { PopupManager } from '../../PopUp/PopupManager';
import { Constants } from '../../utilities/Constants';
import { PopupClanInventoryDeco } from '../../PopUp/PopupClanInventoryDeco';

const { ccclass, property } = _decorator;

@ccclass('MapDecorSlot')
export class MapDecorSlot extends Ability {
    @property({ type: Node }) targetClicker: Node = null;
    @property({ type: CCFloat }) interactDistance: number = 60;
    @property positionIndex: number = 0;
    private lastActionTime: number = 0;
    private interactDelay: number = 1000;
    private isOpenPopUp: boolean = false;
    private currentDecor: Node | null = null;
    private data: DecorPlaceholderDTO | null = null;
    private estateId: string | null = null;
    @property({ type: Node }) decoPosition: Node = null;
    @property({ type: [Prefab] }) decorPrefabs: Prefab[] = [];

    public setInfoPlaceHolder(data: DecorPlaceholderDTO, estateId: string) {
        this.data = data;
        this.estateId = estateId;
        if (!this.targetClicker) {
            this.targetClicker = this.node;
        }
    }

    protected onEnable() {
        if (this.targetClicker) {
            this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.targetClicker.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    protected onDisable() {
        if (this.targetClicker) {
            this.targetClicker.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    public spawnDecorPrefab(name: string) {

        if (this.currentDecor) {
            this.currentDecor.destroy();
            this.currentDecor = null;
        }

        const prefab = this.decorPrefabs.find(p => p.name === name);
        if (!prefab) return;

        const node = instantiate(prefab);
        node.setParent(this.decoPosition);
        node.setPosition(0, 0, 0);

        this.currentDecor = node;
    }

    public clear() {
        if (this.currentDecor) {
            this.currentDecor.destroy();
            this.currentDecor = null;
        }

        if (this.targetClicker) {
            this.targetClicker.active = true;
        }
    }

    private get CanShowUI(): boolean {
        if (this.InteractTarget != null) {
            return Math.abs(Vec3.distance(this.InteractTarget.worldPosition, this.node.worldPosition)) <= this.interactDistance;
        }
        return false;
    }

    onTouchStart(event) {
        if (!UserMeManager.Get.clan || !UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
            PopupManager.getInstance().closeAllPopups();
            Constants.showConfirm("Bạn cần thuộc văn phòng để tương tác trang trí nông trại văn phòng");
            return;
        }
        if (this.isOpenPopUp) return;
        if (this.CanShowUI) {
            if (Date.now() - this.lastActionTime > this.interactDelay) {
                this.lastActionTime = Date.now();
                PopupManager.getInstance().openAnimPopup("UI_ClanInventoryDeco", PopupClanInventoryDeco, {
                    dataDecoPlace: this.data,
                    estateId: this.estateId,
                    isHaveDeco: !!this.currentDecor,
                    onActionClose: () => {
                        this.isOpenPopUp = false;
                    },
                });
            }
        }
        else {
            let content = "Lại gần hơn để tương tác với vị trí trang trí!!!";
            Constants.showConfirm(content);
        }
    }
}