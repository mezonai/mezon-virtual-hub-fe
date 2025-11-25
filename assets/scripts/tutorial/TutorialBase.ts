import { _decorator, Component, Animation, Node } from 'cc';
import { BasePopup } from '../PopUp/BasePopup';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { TalkAnimation } from '../utilities/TalkAnimation';
import { Sprite } from 'cc';
import { Color } from 'cc';
import { tween } from 'cc';
import { Constants } from '../utilities/Constants';
import { Vec3 } from 'cc';
import { ResourceManager } from '../core/ResourceManager';
import { Tween } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('TutorialBase')
export abstract class TutorialBase extends BasePopup {
    @property({ type: AnimationEventController }) animationEventTutorialPlayer: AnimationEventController = null;
    @property({ type: TalkAnimation }) talkAnimation: TalkAnimation = null;
    @property({ type: Animation }) animationTutorialPlayer: Animation = null;
    @property({ type: Node }) tutorialPlayer: Node = null;
    @property({ type: Node }) selectionNode: Node = null;
    @property({ type: Node }) iconSelection: Node = null;


    public async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    public loadBase() {
        this.showPlayerTutorial(false);
        this.animationTutorialPlayer.node.scale = new Vec3(1, 1, 0);
        this.selectionNode.active = false;
        this.animationEventTutorialPlayer.loadSkin(ResourceManager.instance.LocalSkinConfig.male.defaultSet);
    }

    setDirectionPlayer(isLeft: boolean) {
        if (this.node != null && this.animationTutorialPlayer != null) this.animationTutorialPlayer.node.scale = new Vec3(isLeft ? -1 : 1, 1, 0);
    }

    showPlayerTutorial(isShow: boolean) {
        if (this.node != null && this.tutorialPlayer != null) this.tutorialPlayer.active = isShow;
    }

    public playAnimationSelection(targetPosition: Vec3
        , timeWait: number
        , timeMoveSelectionIcon: number
        , timeAnimSelection: number
        , isWorldPosition: boolean = false): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.node == null || this.selectionNode == null || this.iconSelection == null) {
                resolve();
                return;
            }
            this.selectionNode.position = this.tutorialPlayer.position;
            this.iconSelection.scale = Vec3.ONE;
            this.selectionNode.active = true;
            Constants.waitForSeconds(timeWait).then(() => {
                const tweenTarget = isWorldPosition
                    ? { worldPosition: targetPosition }
                    : { position: targetPosition };

                tween(this.selectionNode)
                    .to(timeMoveSelectionIcon, tweenTarget)
                    .call(() => {
                        // hiệu ứng nhấp nháy scale
                        tween(this.iconSelection)
                            .repeatForever(
                                tween()
                                    .to(0.3, { scale: new Vec3(1.5, 1.5, 1.5) })
                                    .to(0.3, { scale: Vec3.ONE })
                            )
                            .start();

                        // Chờ thêm timeAnimSelection trước khi kết thúc
                        Constants.waitForSeconds(timeAnimSelection).then(() => {
                            Tween.stopAllByTarget(this.iconSelection);
                            if (this.node != null && this.iconSelection != null && this.selectionNode != null) {
                                this.iconSelection.scale = Vec3.ONE;
                                this.selectionNode.active = false;
                            }
                            resolve(); // báo hiệu hoàn tất
                        });
                    })
                    .start();
            });
        });
    }

    public movePlayer(from: Vec3, to: Vec3, duration: number = 1.5): Promise<void> {
        return new Promise((resolve) => {
            if (this.node == null || this.tutorialPlayer == null || this.animationTutorialPlayer == null) {
                resolve();
                return;
            }
            this.tutorialPlayer.setPosition(from);
            this.animationTutorialPlayer.play("move");

            tween(this.tutorialPlayer)
                .to(duration, { position: to })
                .call(() => {
                    if (this.animationTutorialPlayer) {
                        this.animationTutorialPlayer.play("idle");
                    }
                    resolve(); // báo hiệu đã hoàn tất
                })
                .start();
        });
    }

    public async showTalkAndDelay(content: string, timeWait: number, timeTalk: number): Promise<void> {
        await Constants.waitForSeconds(timeWait);
        this.talkAnimation?.showBubbleChat(content, timeTalk);
        await Constants.waitUntil(() => this.talkAnimation == null || this.talkAnimation.node == null || this.talkAnimation.node.getScale().x <= 0);
    }

    fadeOutByColor(sprite: Sprite, duration: number = 1): Promise<void> {
        return new Promise((resolve) => {
            if (!sprite || !sprite.node || !sprite.node.isValid) {
                resolve();
                return;
            }

            const startColor = sprite.color.clone();
            const tempColor = new Color(startColor.r, startColor.g, startColor.b, startColor.a);

            tween(tempColor)
                .to(duration, { a: 0 }, {
                    onUpdate: () => {
                        if (!sprite || !sprite.node || !sprite.node.isValid) return;
                        sprite.color = new Color(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
                    }
                })
                .call(() => {
                    if (sprite && sprite.node && sprite.node.isValid) {
                        sprite.color = new Color(startColor.r, startColor.g, startColor.b, 0);
                    }
                    resolve(); // báo hiệu đã hoàn tất
                })
                .start();
        });
    }
    fadeInByColor(sprite: Sprite, duration: number = 1): Promise<void> {
        return new Promise((resolve) => {
            if (!sprite || !sprite.node || !sprite.node.isValid) {
                resolve();
                return;
            }

            const startColor = sprite.color.clone();
            const tempColor = new Color(startColor.r, startColor.g, startColor.b, 0);

            sprite.color = tempColor.clone();

            tween(tempColor)
                .to(duration, { a: 255 }, {
                    onUpdate: () => {
                        if (!sprite || !sprite.node || !sprite.node.isValid) return;
                        sprite.color = new Color(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
                    }
                })
                .call(() => {
                    if (sprite && sprite.node && sprite.node.isValid) {
                        sprite.color = new Color(startColor.r, startColor.g, startColor.b, 255);
                    }
                    resolve(); // báo hiệu hoàn tất
                })
                .start();
        });
    }
}


