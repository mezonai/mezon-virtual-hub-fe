import { _decorator, Component, Node, Sprite, SpriteFrame, Animation, Enum, Vec3, tween } from 'cc';
import { PetBattleInfo, Species } from '../Model/PetDTO';
import { Widget } from 'cc';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;
@ccclass('SpeciesMap')
export class SpeciesMap {
    @property({ type: Enum(Species) }) species: Species = Species.Dog;
    @property({ type: Node }) nodeSpritePet: Node = null;
    @property({ type: [Animation] }) aniamtionSkill: Animation[] = [];
    @property({ type: [Animation] }) anmationSkillMoveFromTo: Animation[] = [];
}
@ccclass('PetBattlePrefab')
export class PetBattlePrefab extends Component {
    @property({ type: [SpeciesMap] }) speciesMap: SpeciesMap[] = [];
    @property({ type: [Node] }) skillImagesActive: Node[] = [];
    currentPet: PetBattleInfo = null;
    private peakHeight: number = 35;
    setDataPet(pet: PetBattleInfo, slot: number): Promise<void> {
        return new Promise((resolve) => {
            if (pet == null) {
                resolve();
                return;
            }

            this.currentPet = pet;
            const flipX = slot < 1 ? -1 : 1;

            for (const x of this.speciesMap) {
                if (x.species === pet.species) {
                    const scale = x.nodeSpritePet.scale;
                    x.nodeSpritePet.setScale(
                        new Vec3(Math.abs(scale.x) * flipX, scale.y, scale.z)
                    );
                    x.nodeSpritePet.active = true;
                    break;
                }
            }

            resolve();
        });
    }

    resetPet() {
        for (const x of this.speciesMap) {
            x.nodeSpritePet.active = false;
            const scale = x.nodeSpritePet.scale;
            x.nodeSpritePet.setScale(new Vec3(Math.abs(scale.x), scale.y, scale.z));
        }
    }

    getAnimPet(species: Species, idAnim: string): Animation | null {
        const map = this.speciesMap.find(m => m.species === species);
        if (!map) return null;

        return map.aniamtionSkill.find(anim => anim.node.name === idAnim) ?? null;
    }

    getAnimMove(species: Species, idAnim: string): Animation | null {
        const map = this.speciesMap.find(m => m.species === species);
        if (!map) return null;

        return map.anmationSkillMoveFromTo.find(anim => anim.node.name === idAnim) ?? null;
    }

    async playTackleEffect(direction: string, onAnimFinishCallback?: () => Promise<void>): Promise<void> {
        return new Promise((resolve) => {

            const originalPos = this.node.getPosition().clone(); // clone để giữ lại gốc ban đầu
            const offsetX = direction === 'right' ? 20 : -20;
            const forward = originalPos.clone().add(new Vec3(offsetX, 0, 0));

            tween(this.node)
                .to(0.1, { position: forward }, { easing: 'quadIn' })
                .to(0.1, { position: originalPos }, { easing: 'quadOut' })
                .call(async () => {
                    if (onAnimFinishCallback) {
                        await onAnimFinishCallback();
                    }
                    resolve();
                })
                .start();
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

    //Create Skill
    async skillMovementFromTo(
        skillId: string,
        from: PetBattlePrefab,
        to: PetBattlePrefab,
        container: Node,
    ): Promise<void> {
        return new Promise((resolve) => {
            const newSkillId = this.convertSkillIdStart(skillId);
            let animMove = this.getAnimMove(this.currentPet.species, newSkillId);
            if (animMove == null) {
                resolve(); // đảm bảo promise được kết thúc
                return;
            }
            animMove.node.active = true;
            animMove.play();
            const moveNode = animMove.node;
            const originalParent = moveNode.parent!;
            const originalWorldPos = from.node.getWorldPosition().clone();
            const endWorldPos = to.node.getWorldPosition().clone();

            const widget = animMove.node.getComponent(Widget);
            if (widget) {
                widget.enabled = false;
            }
            container.addChild(moveNode);
            moveNode.setWorldPosition(originalWorldPos);
            tween(animMove.node)
                .to(1, { worldPosition: endWorldPos }, { easing: 'quadInOut' })
                .call(async () => {
                    moveNode.active = false;
                    originalParent.addChild(moveNode);
                    moveNode.setWorldPosition(originalWorldPos);
                    if (widget) {
                        widget.enabled = true;
                    }
                    resolve();
                })
                .start();
        });
    }

    usingSkillYourself(skillId: string, onAnimFinishCallback?: () => Promise<void>) {
        const newSkillId = this.convertSkillIdForSkill(skillId);
        const anim = this.getAnimPet(this.currentPet.species, newSkillId);
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

    async spraySkill(
        skillId: string,
        from: PetBattlePrefab,
        to: PetBattlePrefab,
        container: Node,
    ): Promise<void> {
        return new Promise((resolve) => {
            const newSkillId = this.convertSkillIdStart(skillId);
            let currentSkillImage = this.skillImagesActive.find(node => node.name === newSkillId);
            if (currentSkillImage == null) {// đảm bảo promise được kết thúc
                return;
            }

            const originalParent = currentSkillImage.parent!;
            const originalWorldPos = from.node.getWorldPosition().clone();
            const endWorldPos = to.node.getWorldPosition().clone();
            container.addChild(currentSkillImage);
            currentSkillImage.setWorldPosition(originalWorldPos);
            currentSkillImage.active = true;
            tween(currentSkillImage)
                .to(1, { worldPosition: endWorldPos }, { easing: 'quadInOut' })
                .call(async () => {
                    currentSkillImage.active = false;
                    originalParent.addChild(currentSkillImage);
                    currentSkillImage.setWorldPosition(originalWorldPos);
                    resolve();
                })
                .start();
        });
    }

    scaleInOut(pet: PetBattlePrefab): Promise<void> {
        const originalScale = pet.node.scale.clone(); // Lưu scale gốc

        return new Promise<void>((resolve) => {
            tween(pet.node)
                .to(0.5, { scale: originalScale.clone().multiplyScalar(0.5) }) // Thu nhỏ
                .call(() => {
                    pet.node.scale = originalScale;
                    resolve();
                })
                .start();
        });
    }

    async playSkillAtSelf(skillId: string) {
        const anim = this.getSkillAnimation(skillId);
        if (!anim) {
            console.error("Animation not found:", skillId);
            return;
        }
        try {
            anim.node.active = true;
            anim.play();
            await Constants.waitForSeconds(1.5);
        } finally {
            anim.node.active = false;
        }
    }

    private getSkillAnimation(skillId: string) {
        const newSkillId = this.convertSkillIdStart(skillId);
        const species = this.currentPet.species;

        return (
            this.getAnimPet(species, newSkillId) ||
            this.getAnimMove(species, newSkillId)
        );
    }

    async throwSkillImage(
        skillId: string,
        from: PetBattlePrefab,
        to: PetBattlePrefab,
        container: Node,): Promise<void> {
        const newSkillId = this.convertSkillIdStart(skillId);
        let currentSkillImage = this.skillImagesActive.find(node => node.name === newSkillId);
        if (currentSkillImage == null) {// đảm bảo promise được kết thúc
            return;
        }
        const originalParent = currentSkillImage.parent!;
        const start = from.node.getWorldPosition().clone();
        const end = to.node.getWorldPosition().clone();
        container.addChild(currentSkillImage);

        currentSkillImage.setWorldPosition(start);
        currentSkillImage.active = true;
        let t = 0;
        await new Promise<void>((resolve) => {
            tween({})
                .to(0.6, {}, {
                    onUpdate: (_, ratio: number) => {
                        t = ratio;
                        const pos = new Vec3(
                            start.x + (end.x - start.x) * t,
                            start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * this.peakHeight,
                            start.z + (end.z - start.z) * t
                        );
                        currentSkillImage.setWorldPosition(pos);
                    },
                    easing: 'linear'
                })
                .call(() => {
                    currentSkillImage.active = false;
                    originalParent.addChild(currentSkillImage);
                    currentSkillImage.setWorldPosition(start);
                    resolve();
                })
                .start();

        })
    }

    earthquake(node: Node, duration: number = 0.3, strength: number = 10): Promise<void> {
        return new Promise((resolve) => {
            const originalPos = node.position.clone();
            const times = Math.floor(duration / 0.05);
            let t = tween(node);

            for (let i = 0; i < times; i++) {
                const offset = new Vec3(
                    (Math.random() - 0.5) * strength * 2,
                    (Math.random() - 0.5) * strength * 2,
                    0
                );
                t = t
                    .to(0.025, { position: originalPos.clone().add(offset) })
                    .to(0.025, { position: originalPos });
            }

            t.call(() => {
                node.setPosition(originalPos); // đảm bảo về đúng vị trí
                resolve();
            }).start();
        });
    }

    public convertSkillIdStart(skillId: string): string {
        if (skillId === "ELECTRIC03" || skillId === "FIRE02" || skillId === "WATER01" || skillId === "FIRE01" || skillId === "FIRE03") {
            return `${skillId}_START`;
        }
        return skillId;
    }

    convertSkillIdForSkill(skillId: string): string {
        if (skillId === "ELECTRIC03" || skillId === "FIRE02" || skillId == "FIRE03") {
            return `${skillId}_END`;
        }
        return skillId;
    }

    async fadeBackgroundEffect(sprite: Sprite, timeLoop: number) {
        const node = sprite.node;
        node.active = true;
        await this.tweenSpriteAlpha(sprite, 0, 150, 0.2);

        for (let i = 0; i < timeLoop; i++) {
            await this.tweenSpriteAlpha(sprite, 150, 100, 0.15);
            await this.tweenSpriteAlpha(sprite, 100, 150, 0.15);
        }

        await this.tweenSpriteAlpha(sprite, 150, 100, 0.15);

        node.active = false;
    }

    tweenSpriteAlpha(
        sprite: Sprite,
        from: number,
        to: number,
        duration: number
    ): Promise<void> {
        return new Promise(resolve => {
            const color = sprite.color.clone();
            color.a = from;
            sprite.color = color;

            tween(sprite)
                .to(duration, {}, {
                    onUpdate: (_, ratio) => {
                        const a = from + (to - from) * ratio;
                        const c = sprite.color.clone();
                        c.a = Math.round(a);
                        sprite.color = c;
                    }
                })
                .call(() => resolve())
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