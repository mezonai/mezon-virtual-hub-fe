import { _decorator, Component, Node, Sprite, SpriteFrame, Animation, Enum, Vec3, tween } from 'cc';
import { PetBattleInfo, Species } from '../Model/PetDTO';
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

    setDataPet(pet: PetBattleInfo, slot: number) {
        if (pet == null) return;
        this.petDisplay.spriteFrame = this.getSpritePet(pet.species);
        this.SetPositionAndScale(pet.species, slot);
        this.petDisplay.node.active = true;
    }

    getSpritePet(species: Species): SpriteFrame {
        return this.speciesMap.find(t => t.species === species).spritePet || this.speciesMap[0].spritePet;
    }

    SetPositionAndScale(species: Species, slot: number) {
        const isLeftSide = slot < 1;
        const flipX = isLeftSide ? -1 : 1;

        // Mặc định
        let position = new Vec3(0, 0, 0);
        let scale = new Vec3(flipX, 1, 1);

        switch (species) {
            case Species.Bubblespark:
                position = new Vec3(0, 7, 0);
                scale = new Vec3(0.9 * flipX, 0.9, 1);
                break;
            case Species.Dragon:
                position = new Vec3(0, 8, 0);
                scale = new Vec3(0.8 * flipX, 0.8, 1);
                break;
            case Species.DragonFire:
            case Species.DragonIce:
            case Species.DragonNormal:
                position = new Vec3(0, 12, 0);
                scale = new Vec3(0.8 * flipX, 0.8, 1);
                break;
            case Species.Duskar:
                position = new Vec3(0, 6, 0);
                scale = isLeftSide ? new Vec3(-1, 1, 1) : Vec3.ONE;
                break;
            case Species.Leafeon:
                position = new Vec3(0, 9.5, 0);
                scale = new Vec3(0.6 * flipX, 0.6, 1);
                break;
            case Species.Lizard:
                position = new Vec3(0, 5, 0);
                scale = new Vec3(0.8 * flipX, 0.8, 1);
                break;
            case Species.PhoenixFire:
            case Species.PhoenixIce:
                position = new Vec3(0, 15, 0);
                scale = new Vec3(0.7 * flipX, 0.7, 1);
                break;
            case Species.Pokemon:
                position = new Vec3(0, 2, 0);
                scale = isLeftSide ? new Vec3(-1, 1, 1) : Vec3.ONE;
                break;
            case Species.Sika:
                position = new Vec3(0, 8, 0);
                scale = new Vec3(0.9 * flipX, 0.9, 1);
                break;
            case Species.Snowria:
                position = new Vec3(0, 10, 0);
                scale = new Vec3(0.9 * flipX, 0.9, 1);
                break;
        }

        this.petDisplay.node.position = position;
        this.petDisplay.node.setScale(scale);
    }

    async setPetDead(callback?: () => void): Promise<void> {
        const startPosition = this.node.position.clone(); // lưu vị trí ban đầu
        const endPosition = startPosition.clone();
        endPosition.y -= 300; // rơi thẳng đứng 300 đơn vị

        await new Promise<void>((resolve) => {
            tween(this.node)
                .to(0.5, { position: endPosition }, { easing: 'quadIn' }) // thời gian rơi
                .call(() => {
                    this.petDisplay.node.active = false;
                    this.node.setPosition(startPosition); // reset lại vị trí ban đầu
                    resolve(); // báo tween đã xong
                    callback?.(); // gọi callback nếu có
                })
                .start();
        });
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