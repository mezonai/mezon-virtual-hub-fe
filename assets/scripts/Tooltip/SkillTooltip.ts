import { _decorator, Component, Node } from 'cc';
import { TooltipManager } from '../ui/TooltipManager';
import { PopupManager } from '../PopUp/PopupManager';
import { SkillData } from '../animal/Skills';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupTooltipSkill, TooltipSkillParam } from '../PopUp/PopupTooltipSkill';
const { ccclass, property } = _decorator;

@ccclass('SkillTooltip')
export class SkillTooltip extends TooltipManager {

    popupTooltip: BasePopup = null;
    skillData: SkillData = null;
    setData(skill: SkillData) {
        if (skill == null) return;
        this.skillData = skill;
    }

    protected async onHoverShow() {
        if (this.skillData == null || this.popupTooltip != null) return;
        const param: TooltipSkillParam = {
            skill: this.skillData,
        };
        this.popupTooltip = await PopupManager.getInstance().openPopup("PopupTooltipSkill", PopupTooltipSkill, param);
    }
    protected onHoverHide() {
        this.closePopup();
    }

    async closePopup() {
        if (this.popupTooltip == null) return;
        await PopupManager.getInstance().closePopup(this.popupTooltip.node.uuid);
        this.popupTooltip = null;
    }
}


