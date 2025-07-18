import { _decorator, Component, Node, Sprite, SpriteFrame, Animation, Enum, Vec3 } from 'cc';
import { PetDTO2, Species } from '../Model/PetDTO';
const { ccclass, property } = _decorator;
@ccclass('SpeciesMap')
export class SpeciesMap {
    @property({ type: Enum(Species) }) species: Species = Species.Dog;
    @property({ type: SpriteFrame }) spritePet: SpriteFrame = null;
}
@ccclass('PetBattlePrefab')
export class PetBattlePrefab extends Component {
    @property({ type: [SpeciesMap] }) speciesMap: SpeciesMap[] = [];
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

    setDataPet(pet: PetDTO2, slot: number) {
        if (pet == null) return;
        this.petDisplay.spriteFrame = this.getSpritePet(pet.species);
        this.petDisplay.node.setScale(slot < 1 ? new Vec3(-1, 1, 1) : Vec3.ONE);
    }

    getSpritePet(species: Species): SpriteFrame {
        return this.speciesMap.find(t => t.species === species).spritePet || this.speciesMap[0].spritePet;
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