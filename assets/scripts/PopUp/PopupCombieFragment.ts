import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Vec3 } from 'cc';
import { tween } from 'cc';
import { RichText } from 'cc';
import { SlotPetDetail } from '../animal/SlotPetDetail';
import { Button } from 'cc';
import { ItemCombine } from '../gameplay/Upgrade/ItemCombine';
import { PetDTO } from '../Model/PetDTO';
import { UITransform } from 'cc';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { ItemFragmentCombine } from '../gameplay/Upgrade/ItemFragmentCombine';
import { FragmentDTO } from '../Model/Item';
import { WebRequestManager } from '../network/WebRequestManager';
import { Toggle } from 'cc';
import { CombieFragment } from '../Fragment/CombieFragment';
import { ChangeFragment } from '../Fragment/ChangeFragment';
const { ccclass, property } = _decorator;

@ccclass('PopupCombieFragment')
export class PopupCombieFragment extends BasePopup {
    @property(Toggle) tabCombine: Toggle = null!;
    @property(Toggle) tabChange: Toggle = null!;
    @property({ type: CombieFragment }) detailCombine: CombieFragment = null;
    @property({ type: ChangeFragment }) detailChange: ChangeFragment = null;
    @property({ type: Button }) closeButton: Button = null;
    public async init(param?: PopupCombieFragmentParam) {
        if (!param) {
            PopupManager.getInstance().closePopup(this.node.uuid, true);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            PopupManager.getInstance().closePopup(this.node.uuid, true);
        });
        this.detailCombine.setData(param, () => {
            PopupManager.getInstance().closePopup(this.node.uuid, true);
        });
        this.detailChange.setData(param, () => {
            PopupManager.getInstance().closePopup(this.node.uuid, true);
        });
        this.switchMode(param.isCombine);
        if (param.isCombine) this.tabCombine.isChecked = true;
        else this.tabChange.isChecked = true;
        this.tabCombine.node.on(
            'toggle',
            (toggle) => {
                if (!toggle.isChecked) return;
                this.switchMode(true);
            },
            this,
        );
        this.tabChange.node.on(
            'toggle',
            (toggle) => {
                if (!toggle.isChecked) return;
                this.switchMode(false);
            },
            this,
        );

    }
    private async switchMode(isShowTabCombie: boolean) {
        this.detailChange.node.active = !isShowTabCombie;
        this.detailCombine.node.active = isShowTabCombie;
    }



}
export interface PopupCombieFragmentParam {
    fragmentData: FragmentDTO;
    isCombine: boolean;
    typeFrament: string
}


