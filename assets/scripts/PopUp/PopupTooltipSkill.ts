import { _decorator, Component, Node, RichText } from 'cc';
import { BasePopup } from '../../scripts/PopUp/BasePopup';
import { PopupManager } from '../../scripts/PopUp/PopupManager';
import { SkillDataInfor } from '../../scripts/animal/Skills';
import { SkillSlot } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('PopupTooltipSkill')
export class PopupTooltipSkill extends BasePopup {
    @property({ type: RichText }) nameSkill: RichText = null;
    @property({ type: RichText }) valueAttack: RichText = null;
    @property({ type: RichText }) valueAcurracy: RichText = null;
    @property({ type: RichText }) valuePowerPoint: RichText = null;
    @property({ type: RichText }) description: RichText = null;
    public async init(param?: TooltipSkillParam) {
        if (!param || param.skill == null) {
            this.closePopup();
            return;
        }
        if (param != null && param.onActionClose != null) {
            this._onActionClose = param.onActionClose;
        }
        this.setData(param.skill);
    }

    setData(skill: SkillSlot) {
        this.nameSkill.string = skill.name;
        this.valueAttack.string = skill.attack.toString();
        this.valueAcurracy.string = skill.accuracy.toString();
        this.valuePowerPoint.string = skill.power_points.toString();
        this.description.string = skill.description;
    }

    public async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
        this._onActionClose?.();
    }
}

export interface TooltipSkillParam {
    skill: SkillSlot;
    onActionClose?: () => void;
}

