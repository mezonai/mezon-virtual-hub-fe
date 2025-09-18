import { ParticleSystem2D } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { PetsDesignIcon } from '../../animal/PetsDesignIcon';
import { Constants } from '../../utilities/Constants';
import { Sprite } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemCombine')
export class ItemCombine extends Component {
    @property({ type: PetsDesignIcon }) iconPet: PetsDesignIcon = null;
    @property(ParticleSystem2D) starFlyParticle: ParticleSystem2D = null;
    @property(ParticleSystem2D) explosiveParticle: ParticleSystem2D = null;
    @property(ParticleSystem2D) absorbParticle: ParticleSystem2D = null;
    @property(ParticleSystem2D) impactParticle: ParticleSystem2D = null;
    @property({ type: [Sprite] }) stars: Sprite[] = [];
    @property(Node) circleEffect: Node = null;
    currentBlink: Tween<Color> | null = null;
    starBlink: Sprite = null;
    playStartFly() {
        if (this.starFlyParticle != null) this.starFlyParticle.node.active = true;
        if (this.starFlyParticle != null) this.starFlyParticle.resetSystem();
    }

    async playExplosive() {
        if (this.explosiveParticle != null) this.explosiveParticle.node.active = true;
        await Constants.waitForSeconds(0.5);
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

    startBlinkEffect(totalShow: number) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.stars[i] != null) {
                this.stars[i].node.active = i <= totalShow;
                if (i == totalShow) this.startBlink(this.stars[i]);/// sao cuối nhấp nháy
            }
        }

    }

    stopBlinkEffect(isSucces: boolean) {
        this.stopBlink(this.starBlink, isSucces);/// tạm dùng sao cuối. Logic sẽ là sao cbi được nâng lên
    }

    private startBlink(sprite: Sprite, duration: number = 0.2, minAlpha: number = 50) {
        if (!sprite) return;
        if (this.currentBlink) return;
        this.starBlink = sprite;
        const color = sprite.color.clone(); // lấy màu gốc
        const alphaObj = { a: 255 };        // object trung gian tween alpha

        this.currentBlink = tween(alphaObj)
            .repeatForever(
                tween()
                    .to(duration, { a: minAlpha })
                    .call(() => {
                        sprite.color = new Color(color.r, color.g, color.b, alphaObj.a);
                    })
                    .to(duration, { a: 255 })
                    .call(() => {
                        sprite.color = new Color(color.r, color.g, color.b, alphaObj.a);
                    })
            )
            .start();
    }

    private stopBlink(sprite: Sprite, isSucces: boolean) {
        if (!sprite) return;
        if (this.currentBlink) {
            this.currentBlink.stop();
            this.currentBlink = null;
        }
        // Reset alpha về 255
        if (!isSucces) sprite.node.active = false;
        sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, 255);
    }


}


