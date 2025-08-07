import { _decorator, Button, Color, Component, Enum, Label, Node, Sprite } from 'cc';
import { ItemSkill } from '../../animal/ItemSkill';
import { AnimalElement, SkillData } from '../../Model/PetDTO';
import { InteractSlot } from '../../animal/ItemSlotSkill';
import { SkillDataInfor, SkillList } from '../../animal/Skills';
import { ServerManager } from '../../core/ServerManager';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { PopupManager } from '../../PopUp/PopupManager';
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
    private idAttack: string = "ATTACK01";
    private indexSkill: number = 0;
    private currentPowerPoints: number = 0;
    idSkill: string = "";
    setData(skillData: SkillData, index: number, onAfterClickSkill?: () => void) {
        if (skillData == null) return;
        this.idSkill = skillData.id;
        this.indexSkill = index;
        console.log("SkillData: ", skillData, " /", skillData.id);
        this.itemSkill.node.active = skillData.id != this.idAttack;
        this.iconAttack.active = skillData.id == this.idAttack;
        let skillDataInfo = this.getSkillById(skillData.id);
        const colorbackground = this.getColorByType(skillDataInfo.type);
        if (skillData.id != this.idAttack) this.itemSkill.setData(skillDataInfo, InteractSlot.SHOW_UI);
        this.backgroundType.color = colorbackground;
        this.nameSkil.string = skillDataInfo.name;
        this.updatePowerPoint(skillData)
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
    updatePowerPoint(skillData: SkillData) {
        this.currentPowerPoints = skillData.currentPowerPoint;
        this.powerPoint.string = `${skillData.currentPowerPoint}/${skillData.totalPowerPoint}`;
    }

    private getColorByType(type: AnimalElement): Color {
        return this.battleSkillStats.find(t => t.element === type).backgroundColor || this.battleSkillStats[0].backgroundColor;
    }

    getSkillById(id: string): SkillDataInfor | undefined {
        return SkillList.find(skill => skill.idSkill === id);
    }
}


