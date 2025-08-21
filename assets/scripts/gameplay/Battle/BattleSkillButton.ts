import { _decorator, Button, Color, Component, Enum, Label, Node, Sprite } from 'cc';
import { ItemSkill } from '../../animal/ItemSkill';
import { Element, SkillBattleInfo } from '../../Model/PetDTO';
import { InteractSlot } from '../../animal/ItemSlotSkill';
import { SkillDataInfor, SkillList } from '../../animal/Skills';
import { ServerManager } from '../../core/ServerManager';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { PopupManager } from '../../PopUp/PopupManager';
const { ccclass, property } = _decorator;
@ccclass('BattleSkillStats')
export class BattleSkillStats {
    @property({ type: Enum(Element) }) element: Element = Element.Normal;
    @property({ type: Color }) backgroundColor: Color = new Color(255, 255, 255, 255);
}
@ccclass('BattleSkillButton')
export class BattleSkillButton extends Component {
    @property({ type: Node }) iconAttack: Node = null;
    @property({ type: ItemSkill }) itemSkill: ItemSkill = null;
    @property({ type: Sprite }) backgroundType: Sprite = null;
    @property({ type: Label }) nameSkil: Label = null;
    @property({ type: Label }) damge: Label = null;
    @property({ type: Label }) accuracy: Label = null;
    @property({ type: Label }) powerPoint: Label = null;
    @property({ type: Button }) clickButton: Button = null;
    @property({ type: [BattleSkillStats] }) battleSkillStats: BattleSkillStats[] = [];
    private idAttack: string = "ATTACK01";
    private indexSkill: number = 0;
    private currentPowerPoints: number = 0;
    idSkill: string = "";
    setData(skillBattleInfo: SkillBattleInfo, index: number, onAfterClickSkill?: () => void) {
        if (skillBattleInfo == null) return;
        this.idSkill = skillBattleInfo.skill_code;
        this.indexSkill = index;
        this.itemSkill.node.active = skillBattleInfo.skill_code != this.idAttack;
        this.iconAttack.active = skillBattleInfo.skill_code == this.idAttack;
        let skillDataInfo = this.getSkillById(skillBattleInfo.skill_code);
        const colorbackground = this.getColorByType(skillDataInfo.type);
        if (skillBattleInfo.skill_code != this.idAttack) this.itemSkill.setSkillBattle(skillBattleInfo);
        this.backgroundType.color = colorbackground;
        this.nameSkil.string = skillDataInfo.name;
        this.damge.string = skillBattleInfo.attack.toString();
        this.accuracy.string = skillBattleInfo.accuracy.toString();
        this.updatePowerPoint(skillBattleInfo)
        this.clickButton.addAsyncListener(async () => {
            if (this.currentPowerPoints <= 0) {
                const param: ConfirmParam = {
                    message: "Lượt dùng Skill đã hết! ",
                    title: "Thông Báo",
                };
                PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
                return;
            }
            if (onAfterClickSkill) {
                onAfterClickSkill();
            }
            ServerManager.instance.sendPlayerActionBattle(true, this.indexSkill);
        })
    }
    updatePowerPoint(skillBattleInfo: SkillBattleInfo) {
        this.currentPowerPoints = skillBattleInfo.currentPowerPoint;
        const currentPowerPoints = skillBattleInfo.currentPowerPoint > 1000 ? "-" : skillBattleInfo.currentPowerPoint.toString();
        const totalPowerPoint = skillBattleInfo.totalPowerPoint > 1000 ? "-" : skillBattleInfo.totalPowerPoint.toString();
        this.powerPoint.string = `${currentPowerPoints}/${totalPowerPoint}`;
    }

    private getColorByType(type: Element): Color {
        return this.battleSkillStats.find(t => t.element === type).backgroundColor || this.battleSkillStats[0].backgroundColor;
    }

    getSkillById(id: string): SkillDataInfor | undefined {
        return SkillList.find(skill => skill.idSkill === id);
    }
}


