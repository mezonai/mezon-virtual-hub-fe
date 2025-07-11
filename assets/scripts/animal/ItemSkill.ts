import { _decorator, Color, Component, Node, Sprite, SpriteFrame } from 'cc';
import { AnimalElement } from '../Model/PetDTO';
import { UIGradientColor } from '../core/UIGradient';
import { SkillDragItem } from './SkillDragItem';
import { ItemSlotSkill, InteractSlot } from './ItemSlotSkill';
const { ccclass, property } = _decorator;

@ccclass('CornerColors')
export class CornerColors {
    @property({ type: Color }) tl: Color = new Color();
    @property({ type: Color }) tr: Color = new Color();
    @property({ type: Color }) bl: Color = new Color();
    @property({ type: Color }) br: Color = new Color();

    toArray(): Color[] {
        return [this.bl, this.br, this.tl, this.tr];
    }
}
@ccclass('ItemSkill')
export class ItemSkill extends Component {
    @property({ type: Sprite }) border1: Sprite = null;
    @property({ type: Sprite }) border2: Sprite = null;
    @property({ type: UIGradientColor }) backgroundIcon: UIGradientColor = null;
    @property({ type: [Node] }) iconSkills: Node[] = [];
    @property({ type: SkillDragItem }) skillDragItem: SkillDragItem = null;
    // Thứ tự hệ 0: Normal, 1: Grass, 2: Eletric, 3: Water, 4 :Fire, 5: Ice, 6: Dragon
    @property({ type: [CornerColors] })
    colorBackgroundIcon: CornerColors[] = [];
    @property({ type: [Color] }) colorBoder: Color[] = [];
    @property({ type: [Color] }) colorBoder2: Color[] = [];
    idSkill: string = "";
    element: AnimalElement = AnimalElement.Normal;
    setData(idSkill: string, element: AnimalElement, interactSlot: InteractSlot, slotSkillFighting: ItemSlotSkill[] = []) {
        this.iconSkills.forEach(node => {
            node.active = (node.name === idSkill);
        });
        this.idSkill = idSkill;
        this.element = element;
        this.border1.color = this.getColorBorder1(element);
        this.border2.color = this.getColorBorder2(element);
        let colorGradient = this.getColorBackgroundIcon(element);
        this.backgroundIcon.setGradientColors(colorGradient.bl, colorGradient.br, colorGradient.tl, colorGradient.tr);
        this.skillDragItem.intiData(slotSkillFighting, interactSlot)
    }

    getColorBackgroundIcon(element: AnimalElement): CornerColors {
        switch (element) {
            case AnimalElement.Normal:
                return this.colorBackgroundIcon[0];
            case AnimalElement.Grass:
                return this.colorBackgroundIcon[1];
            case AnimalElement.Electric:
                return this.colorBackgroundIcon[2];
            case AnimalElement.Water:
                return this.colorBackgroundIcon[3];
            case AnimalElement.Fire:
                return this.colorBackgroundIcon[4];
            case AnimalElement.Ice:
                return this.colorBackgroundIcon[5];
            case AnimalElement.Dragon:
                return this.colorBackgroundIcon[6];
            default:
                return this.colorBackgroundIcon[0];
        }
    }

    getColorBorder1(element: AnimalElement): Color {
        switch (element) {
            case AnimalElement.Normal:
                return this.colorBoder[0];
            case AnimalElement.Grass:
                return this.colorBoder[1];
            case AnimalElement.Electric:
                return this.colorBoder[2];
            case AnimalElement.Water:
                return this.colorBoder[3];
            case AnimalElement.Fire:
                return this.colorBoder[4];
            case AnimalElement.Ice:
                return this.colorBoder[5];
            case AnimalElement.Dragon:
                return this.colorBoder[6];
            default:
                return this.colorBoder[0];
        }
    }

    getColorBorder2(element: AnimalElement): Color {
        switch (element) {
            case AnimalElement.Normal:
                return this.colorBoder2[0];
            case AnimalElement.Grass:
                return this.colorBoder2[1];
            case AnimalElement.Electric:
                return this.colorBoder2[2];
            case AnimalElement.Water:
                return this.colorBoder2[3];
            case AnimalElement.Fire:
                return this.colorBoder2[4];
            case AnimalElement.Ice:
                return this.colorBoder2[5];
            case AnimalElement.Dragon:
                return this.colorBoder2[6];
            default:
                return this.colorBoder2[0];
        }
    }
}


