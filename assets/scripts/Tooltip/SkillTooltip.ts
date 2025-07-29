import { _decorator, Component, Node } from 'cc';
import { TooltipManager } from '../ui/TooltipManager';
import { PopupManager } from '../PopUp/PopupManager';
import { SkillDataInfor } from '../animal/Skills';
import { PopupTooltipSkill, TooltipSkillParam } from '../PopUp/PopupTooltipSkill';
const { ccclass, property } = _decorator;

@ccclass('SkillTooltip')
export class SkillTooltip extends TooltipManager {

    popupTooltip: PopupTooltipSkill = null;
    skillData: SkillDataInfor = null;
    hoverVersion = 0;

    setData(skill: SkillDataInfor) {
        if (!skill) return;
        this.skillData = skill;
    }

    protected async onHoverShow() {
        if (!this.skillData || this.popupTooltip) return;

        const currentVersion = ++this.hoverVersion;
        const param: TooltipSkillParam = {
            skill: this.skillData,
            onActionClose: () => {
                this.popupTooltip = null;
            }
        };

        const popup = await PopupManager.getInstance().openPopup("PopupTooltipSkill", PopupTooltipSkill, param);
        if (this.hoverVersion !== currentVersion) {
            popup?.closePopup();
            return;
        }

        this.popupTooltip = popup;
    }

    protected onHoverHide() {
        this.hoverVersion++;
        this.closePopup();
    }

    public async closePopup() {
        if (!this.popupTooltip) return;
        await this.popupTooltip.closePopup();
        this.popupTooltip = null;
    }
}
