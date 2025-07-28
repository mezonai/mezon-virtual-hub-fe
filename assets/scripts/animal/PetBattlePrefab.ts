import { _decorator, Component, Node, Sprite, SpriteFrame, Animation, Enum, Vec3, tween } from 'cc';
import { PetBattleInfo, Species } from '../Model/PetDTO';
const { ccclass, property } = _decorator;
@ccclass('SpeciesMap')
export class SpeciesMap {
    @property({ type: Enum(Species) }) species: Species = Species.Dog;
    @property({ type: Node }) nodeSpritePet: Node = null;
    @property({ type: [Animation] }) animaltionSpecies: Animation[] = [];
}
@ccclass('PetBattlePrefab')
export class PetBattlePrefab extends Component {
    @property({ type: [SpeciesMap] }) speciesMap: SpeciesMap[] = [];

    private currentPet: PetBattleInfo = null;

    setDataPet(pet: PetBattleInfo, slot: number) {
        if (pet == null) return;
        this.currentPet = pet;
        console.log("pet.species", pet.species);
        const flipX = slot < 1 ? -1 : 1;
        for (const x of this.speciesMap) {
            if (x.species === pet.species) {
                const scale = x.nodeSpritePet.scale;
                x.nodeSpritePet.setScale(new Vec3(scale.x * flipX, scale.y, scale.z));
                x.nodeSpritePet.active = true;
                break;
            }
        }
    }

    getAnimPet(species: Species, idAnim: string): Animation | null {
        const map = this.speciesMap.find(m => m.species === species);
        if (!map) return null;

        return map.animaltionSpecies.find(anim => anim.node.name === idAnim) ?? null;
    }

    async playAnimBySpecies(skillId: string, onAnimFinishCallback?: () => Promise<void>): Promise<void> {
        const anim = this.getAnimPet(this.currentPet.species, skillId);

        if (!anim) {
            console.warn("Animation not found:", skillId);
            return;
        }

        return new Promise<void>((resolve) => {
            const onFinished = async () => {
                anim.off(Animation.EventType.FINISHED, onFinished);
                anim.node.active = false;
                if (onAnimFinishCallback) {
                    await onAnimFinishCallback();
                }

                resolve();
            };

            anim.node.active = true;
            anim.once(Animation.EventType.FINISHED, onFinished);
            anim.play();
        });
    }

    shakeNode(duration = 0.3, strength = 10): Promise<void> {
        return new Promise((resolve) => {
            const originalPos = this.node.position.clone();
            const times = 5;
            const delay = duration / (times * 2);
            const sequence = [];

            for (let i = 0; i < times; i++) {
                sequence.push(
                    tween().to(delay, { position: new Vec3(originalPos.x + strength, originalPos.y, originalPos.z) }),
                    tween().to(delay, { position: new Vec3(originalPos.x - strength, originalPos.y, originalPos.z) })
                );
            }

            sequence.push(
                tween().to(delay, { position: originalPos }) // reset position
            );

            tween(this.node)
                .sequence(...sequence)
                .call(() => resolve())
                .start();
        });
    }

    async setPetDead(callback?: () => void): Promise<void> {
        const startPosition = this.node.position.clone();
        const endPosition = startPosition.clone();
        endPosition.y -= 300;

        await new Promise<void>((resolve) => {
            tween(this.node)
                .to(0.5, { position: endPosition }, { easing: 'quadIn' })
                .call(() => {
                    for (const x of this.speciesMap) {
                        if (x.nodeSpritePet.activeInHierarchy) {
                            x.nodeSpritePet.active = false;
                            break;
                        }
                    }

                    this.node.setPosition(startPosition);
                    callback?.();
                    resolve();
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