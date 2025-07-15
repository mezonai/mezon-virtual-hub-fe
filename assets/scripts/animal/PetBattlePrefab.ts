import { _decorator, Component, Node, Sprite, SpriteFrame, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PetBattlePrefab')
export class PetBattlePrefab extends Component {
    @property({ type: [SpriteFrame] }) spritePets: SpriteFrame[] = [];
    @property({ type: Sprite }) petDisplay: Sprite = null;
    //Normal
    @property({ type: Animation }) animationNormal: Animation = null;
    //Grass
    @property({ type: Animation }) animationGrass: Animation = null;
    // Electric
    @property({ type: Animation }) animElectroBallStart: Animation = null;
    @property({ type: Animation }) animElectroBallEnd: Animation = null;
    @property({ type: Animation }) animThunderWave: Animation = null;
    @property({ type: Animation }) animThunderBolt: Animation = null;
    //Water
    @property({ type: Animation }) waterAnim: Animation = null;
    //Fire
    @property({ type: Animation }) animEmber: Animation = null;
    @property({ type: Animation }) animFireBlastStart: Animation = null;
    @property({ type: Animation }) animFireBlastEnd: Animation = null;
    @property({ type: Animation }) animOverHeat: Animation = null;
    //Ice
    @property({ type: Animation }) animIceFang: Animation = null;
    @property({ type: Animation }) animIcicleCrash: Animation = null;
    //Dragon
    @property({ type: Animation }) animDragonClaw: Animation = null;

    getSkillNameById(id: string): SkillName | undefined {
        return SkillMapById.get(id);
    }
}

export enum SkillName {
    Growl,
    Protect,
    Rest,
    Confusion,
    Cut,
    Pound,
    DoubleKick,
    Bite,
    CrushClaw,
    WingAttack,
    Fly,
    FuryPunch,
    Earthquake,
    RazorLeaf,
    Absorb,
    Thunderbolt,
    ThunderWave,
    ElectroBall,
    WaterGun,
    Bubble,
    AquaCutter,
    Ember,
    FireBlast,
    Overheat,
    IceBall,
    IcicleCrash,
    IceFang,
    DragonClaw
}

export interface AnimationSkillData {
    idSkill: string;
    name: SkillName;
}

export const SkillMapById: Map<string, SkillName> = new Map<string, SkillName>([
    ["NOR01", SkillName.Growl],
    ["NOR02", SkillName.Protect],
    ["NOR03", SkillName.Rest],
    ["NOR04", SkillName.Confusion],
    ["NOR05", SkillName.Cut],
    ["NOR06", SkillName.Pound],
    ["NOR07", SkillName.DoubleKick],
    ["NOR08", SkillName.Bite],
    ["NOR09", SkillName.CrushClaw],
    ["NOR10", SkillName.WingAttack],
    ["NOR11", SkillName.Fly],
    ["NOR12", SkillName.FuryPunch],
    ["NOR13", SkillName.Earthquake],
    ["GRASS01", SkillName.RazorLeaf],
    ["GRASS02", SkillName.Absorb],
    ["ELECTRIC01", SkillName.Thunderbolt],
    ["ELECTRIC02", SkillName.ThunderWave],
    ["ELECTRIC03", SkillName.ElectroBall],
    ["WATER01", SkillName.WaterGun],
    ["WATER02", SkillName.Bubble],
    ["WATER03", SkillName.AquaCutter],
    ["FIRE01", SkillName.Ember],
    ["FIRE02", SkillName.FireBlast],
    ["FIRE03", SkillName.Overheat],
    ["ICE01", SkillName.IceBall],
    ["ICE02", SkillName.IcicleCrash],
    ["ICE03", SkillName.IceFang],
    ["DRAGON01", SkillName.DragonClaw],
]);