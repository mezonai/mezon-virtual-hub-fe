import { Sprite } from 'cc';
import { Tween } from 'cc';
import { Color } from 'cc';
import { UIOpacity } from 'cc';
import { ParticleSystem2D } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Constants } from '../../utilities/Constants';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { RichText } from 'cc';
import { SpriteFrame } from 'cc';
import { Pet, Species } from '../../Model/PetDTO';
import { FragmentItemDTO, PetReward } from '../../Model/Item';
import { ItemIconManager } from '../../utilities/ItemIconManager';
const { ccclass, property } = _decorator;

@ccclass('ItemFragmentCombine')
export class ItemFragmentCombine extends Component {
    @property({ type: Node }) iconNode: Node = null;
    @property({ type: Sprite }) iconFragmentCombine: Sprite = null;
    @property({ type: Sprite }) iconFullCombineCompleted: Sprite = null;
    @property({ type: RichText }) textQuantity: RichText = null;
    @property(ParticleSystem2D) explosiveParticle: ParticleSystem2D = null;
    @property(ParticleSystem2D) absorbParticle: ParticleSystem2D = null;
    @property(ParticleSystem2D) impactParticle: ParticleSystem2D = null;
    @property(Node) circleEffect: Node = null;
    @property({ type: UIOpacity }) itemOpacity: UIOpacity = null;
    @property({ type: Boolean }) isResultItem: boolean = false;
    currentBlink: Tween<Color> | null = null;
    starBlink: Sprite = null;

    resetUI() {
        this.node.active = true;
        this.circleEffect.active = false;
        this.iconNode.active = !this.isResultItem;
    }

    public setData(species: Species, fragmentItem: FragmentItemDTO) {
        this.setImage(fragmentItem);
        this.textQuantity.string = fragmentItem.quantity.toString();
        this.iconFragmentCombine.node.active = true;
        this.iconFullCombineCompleted.node.active = false;
        this.textQuantity.node.active = true;
    }

    public setDataResult(species: Species, times: number) {
        this.textQuantity.string = times.toString();
        const speciesName = Species[species].charAt(0).toLowerCase() + Species[species].slice(1);
        const name = `${speciesName}_fragment_full`;
        this.iconFullCombineCompleted.spriteFrame = ItemIconManager.getInstance().getIconPet(species);
        this.iconFragmentCombine.spriteFrame = ItemIconManager.getInstance().getIconPetFragment(name, 5);
        this.iconFragmentCombine.node.active = true;
        this.iconFullCombineCompleted.node.active = false;
        this.textQuantity.node.active = false;
    }

    private setImage(fragmentItem: FragmentItemDTO) {
        this.iconFragmentCombine.spriteFrame = ItemIconManager.getInstance().getIconPetFragment(fragmentItem.item.item_code, fragmentItem.index);
        this.setSpriteAlpha(this.iconFragmentCombine, fragmentItem.quantity > 0 ? 255 : 150);
    }

    async playExplosive() {
        if (this.explosiveParticle != null) this.explosiveParticle.node.active = true;
        await Constants.waitForSeconds(1);
        if (this.explosiveParticle != null) this.explosiveParticle.node.active = false;
        if (this.explosiveParticle != null) this.explosiveParticle.resetSystem();
    }

    async playAbsorb() {
        if (this.absorbParticle != null) this.absorbParticle.node.active = true;
        await Constants.waitForSeconds(2);
        if (this.absorbParticle != null) this.absorbParticle.node.active = false;
        if (this.absorbParticle != null) this.absorbParticle.resetSystem();
    }
    async playImpact() {
        if (this.impactParticle != null) this.impactParticle.node.active = true;
        await Constants.waitForSeconds(0.5);
        if (this.impactParticle != null) this.impactParticle.node.active = false;
        if (this.impactParticle != null) this.impactParticle.resetSystem();
    }

    playCircleEffect(isShow: boolean) {
        this.circleEffect.active = isShow;
    }

    async fadeIn(duration: number = 0.2): Promise<void> {
        if (!this.itemOpacity) return;

        this.node.active = true;
        this.itemOpacity.opacity = 0;

        return new Promise<void>((resolve) => {
            tween(this.itemOpacity)
                .to(duration, { opacity: 255 })
                .call(() => resolve())
                .start();
        });
    }

    private ScaleIn(
        target: Node,
        repeatCount: number = 1,
        fromScale: Vec3 = new Vec3(0, 0, 1),
        toScale: Vec3 = new Vec3(1, 1, 1),
        duration: number = 0.25
    ): Promise<void> {

        return new Promise((resolve) => {
            target.setScale(fromScale);
            target.active = true;
            tween(target)
                .repeat(
                    repeatCount = repeatCount < 1 ? 1 : repeatCount,
                    tween(target)
                        .to(duration, { scale: toScale }, { easing: 'backOut' })
                        .to(duration * 0.6, { scale: fromScale }, { easing: 'sineInOut' })
                )
                // kết thúc ở scale chuẩn
                .to(duration, { scale: toScale }, { easing: 'backOut' })
                .call(() => resolve())
                .start();
        });
    }

    private getIndexFragment(species: Species): number {
        switch (species) {
            case Species.Voltstrider:
                return 0;
            default:
                return 0;
        }
    }

    public async showResult(): Promise<void> {
        this.node.active = true;
        this.iconNode.active = true;
        await this.ScaleIn(this.iconNode, 3);
        // await this.fadeIn();
        this.iconFragmentCombine.node.active = false;
        this.iconFullCombineCompleted.node.active = true;
        this.textQuantity.node.active = true;
        this.playCircleEffect(true);
    }

    private setSpriteAlpha(sprite: Sprite, alpha: number) {
        if (!sprite) return;
        const color = sprite.color.clone();
        color.a = Math.min(255, Math.max(0, alpha)); // clamp 0–255
        sprite.color = color;
    }
}


