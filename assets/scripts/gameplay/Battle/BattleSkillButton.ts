import { _decorator, Button, Color, Component, Enum, Label, Node, Sprite } from 'cc';
import { ItemSkill } from '../../animal/ItemSkill';
import { SkillData } from '../../animal/Skills';
import { AnimalElement } from '../../Model/PetDTO';
import { InteractSlot } from '../../animal/ItemSlotSkill';
const { ccclass, property } = _decorator;
@ccclass('BattleSkillStats')
export class BattleSkillStats {
    @property({ type: Enum(AnimalElement) }) element: AnimalElement = AnimalElement.Normal;
    @property({ type: Color }) backgroundColor: Color = new Color(255, 255, 255, 255);
}
@ccclass('BattleSkillButton')
export class BattleSkillButton extends Component {
    @property({ type: Node }) iconAttack: Node = null;
    @property({ type: ItemSkill }) itemSkill: ItemSkill = null;
    @property({ type: Sprite }) backgroundType: Sprite = null;
    @property({ type: Label }) nameSkil: Label = null;
    @property({ type: Label }) powerPoint: Label = null;
    @property({ type: Button }) clickButton: Button = null;
    @property({ type: [BattleSkillStats] }) battleSkillStats: BattleSkillStats[] = [];


    setData(skillData: SkillData) {
        this.itemSkill.node.active = skillData != null;
        this.iconAttack.active = skillData == null;
        const colorbackground = skillData == null ? this.getColorByType(AnimalElement.Normal) : this.getColorByType(skillData.type);
        if (skillData != null) this.itemSkill.setData(skillData, InteractSlot.SHOW_UI);
        this.backgroundType.color = colorbackground;
        this.nameSkil.string = skillData == null ? "Đánh Thường" : skillData.name;
        this.powerPoint.string = skillData == null ? "--" : skillData.powerPoints.toString();
    }

    private getColorByType(type: AnimalElement): Color {
        return this.battleSkillStats.find(t => t.element === type).backgroundColor || this.battleSkillStats[0].backgroundColor;
    }
}


