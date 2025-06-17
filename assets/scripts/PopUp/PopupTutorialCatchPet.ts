import { _decorator, Component, Node, tween, Animation, Vec3, Tween, Button, Sprite, Color } from 'cc';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { ResourceManager } from '../core/ResourceManager';
import { AnimalController } from '../animal/AnimalController';
import { PopupManager } from './PopupManager';
import { PopupSelection, SelectionParam } from './PopupSelection';
import { AnimalInteractManager } from '../gameplay/animal/AnimalInteractManager';
import { PetCatchingController } from '../gameplay/player/PetCatchingController';
import { FoodType } from '../Model/Item';
import { ConfirmPopup } from './ConfirmPopup';
import { TalkAnimation } from '../utilities/TalkAnimation';
import { ItemAnimalSlot } from '../animal/ItemAnimalSlot';
import { PopupOwnedAnimals } from './PopupOwnedAnimals';
import { BasePopup } from './BasePopup';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('PopupTutorialCatchPet')
export class PopupTutorialCatchPet extends BasePopup {
    @property({ type: AnimationEventController }) animationEventTutorialPlayer: AnimationEventController = null;
    @property({ type: TalkAnimation }) talkAnimation: TalkAnimation = null;
    @property({ type: Animation }) animationTutorialPlayer: Animation = null;
    @property({ type: Node }) tutorialPlayer: Node = null;
    @property({ type: AnimalController }) dragonIceTutorial: AnimalController = null;
    @property({ type: AnimalController }) animalTutorial: AnimalController = null;
    @property({ type: Sprite }) blackBackground: Sprite = null;
    @property({ type: Node }) selectionNode: Node = null;
    @property({ type: Node }) iconSelection: Node = null;
    @property({ type: Button }) buttonSkip: Button = null
    @property({ type: ConfirmPopup }) confirmPopup: ConfirmPopup = null;
    /////Bag Pet
    @property({ type: Node }) buttonBagPet: Node = null;
    @property({ type: PopupOwnedAnimals }) popupOwnedAnimals: PopupOwnedAnimals = null;
    @property({ type: ItemAnimalSlot }) itemAnimalSlot: ItemAnimalSlot = null;
    private timeMoveSelectionIcon: number = 0.75;
    private timeout: number = 500;
    private timeAnimSelection: number = 500;
    private timeTalk: number = 0.25;
    private timeFade: number = 1.5;
    private defaultStartDragonIce: Vec3 = new Vec3(406, 0, 0);
    private positionPoint1DragonIce: Vec3 = new Vec3(-80, 40, 0);
    private positionPoint2DragonIce: Vec3 = new Vec3(-60, 10, 0);
    private positionPlayerIntro: Vec3 = new Vec3(-4.5, -10, 0);
    private defaultPosititonPlayer: Vec3 = new Vec3(-70, 15, 0);
    private defaultPosititonPet: Vec3 = new Vec3(65, 15, 0);
    private positionInteractPet: Vec3 = new Vec3(10, 15, 0);
    private positionChoosePet: Vec3 = new Vec3(85, -10, 0);
    private positionFinished: Vec3 = new Vec3(-4.5, -10, 0);
    private _onActionCancel: (() => void) | null = null;

    public async init(param?: PopupTutorialCatchPetParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.initilize(param);
        this.introDragonFly();
    }

    introDragonFly() {
        this.dragonIceTutorial.spriteNode.scale = new Vec3(-1, 1, 0);
        this.dragonmove(this.defaultStartDragonIce, this.positionPoint1DragonIce, () => {
            this.dragonIceTutorial.spriteNode.scale = new Vec3(1, 1, 0);
            this.dragonmove(this.positionPoint1DragonIce, this.positionPoint2DragonIce, () => {
                this.tutorialPlayer.active = true;
                this.showTalkAndDelay("Pet của tôi đó.", () => {
                    this.showTalkAndDelay("Bạn có muốn sở hữu 1 con như tôi không?", () => {
                        this.showTalkAndDelay("Hãy để tôi hướng dẫn bạn cách để sở hữu một con Pet.", () => {
                            this.fadeInByColor(this.blackBackground, this.timeFade, () => {
                                this.tutorialPlayer.setPosition(this.defaultPosititonPlayer);
                                this.dragonIceTutorial.node.active = false;
                                this.fadeOutByColor(this.blackBackground, this.timeFade, () => {
                                    this.stepMoveToPet();
                                });
                            });
                        });
                    });
                });

            });
        }, 3.5);
    }

    private initilize(param?: PopupTutorialCatchPetParam) {
        if (param?.onActionCancel) {
            this._onActionCancel = param.onActionCancel;
        }
        this.tutorialPlayer.active = false;
        this.animalTutorial.node.active = false;
        this.animationTutorialPlayer.node.scale = new Vec3(1, 1, 0);
        this.confirmPopup.node.active = false;
        this.selectionNode.active = false;
        this.itemAnimalSlot.toggle.isChecked = false;
        this.popupOwnedAnimals.node.active = false;
        this.animationEventTutorialPlayer.loadSkin(ResourceManager.instance.LocalSkinConfig.male.defaultSet);
        this.tutorialPlayer.setPosition(this.positionPlayerIntro);
        this.animalTutorial.node.setPosition(this.defaultPosititonPet);
        this.animalTutorial.node.setScale(new Vec3(0.4, 0.4, 0.4));
        this.popupOwnedAnimals.showDecription();
        this.buttonSkip.node.on(Button.EventType.CLICK, () => {
            localStorage.setItem(Constants.TUTORIAL_CACTH_PET, 'true');
            this.cancelTutorial();
        }, this);

    }

    cancelTutorial() {
        this._onActionCancel?.();
        this.cancelTween();
        this.closePopup();
    }

    private stepMoveToPet() {
        this.animalTutorial.node.active = true;
        this.showTalkAndDelay("Đằng kia là pet.", () => {
            this.showTalkAndDelay("Đầu tiên bạn cần đến gần nó hơn.", () => {
                this.movePlayer(this.defaultPosititonPlayer, this.positionInteractPet, this.stepTouchPet.bind(this));
            });
        });


    }

    private stepTouchPet() {
        this.showTalkAndDelay("Sau đó bạn hãy chạm vào Pet.", this.showTouchEffect.bind(this));
    }

    private showTouchEffect() {
        this.animateSelection(this.animalTutorial.node.position, () => {
            const interactPet = this.animalTutorial.getComponentInChildren(AnimalInteractManager);
            if (interactPet) {
                interactPet.showUITutorial(true);
            }
            this.stepSelectFood(interactPet);
        });
    }

    private stepSelectFood(interactPet: AnimalInteractManager | null) {
        this.showTalkAndDelay("Lúc này hãy lựa chọn thức ăn bạn muốn dùng.", () => {
            this.showTalkAndDelay("Sau đó nhấn vào để thả thức ăn bắt Pet.", () => this.showFoodEffect(interactPet));
        });
    }

    private showFoodEffect(interactPet: AnimalInteractManager | null) {
        if (!interactPet) return;
        this.animateSelection(interactPet.normalFood.node.worldPosition, async () => {
            const petCatching = this.tutorialPlayer.getComponent(PetCatchingController);
            if (petCatching) {
                interactPet.showUITutorial(false);
                await petCatching.throwFoodToPet(this.animalTutorial.node, FoodType.NORMAL, true);
                setTimeout(() => {
                    this.animalTutorial.node.active = false;
                    this.confirmPopup.node.active = true;
                    this.closePopupConfirm();
                }, this.timeout);
            }
        }, true);
    }

    private closePopupConfirm() {
        setTimeout(() => {
            this.animateSelection(this.confirmPopup.closeButton.node.worldPosition, () => {
                this.confirmPopup.node.active = false;
                this.showBagPet();
            }, true);
        }, this.timeout);
    }

    private showBagPet() {
        this.showTalkAndDelay("Pet đã được bắt thành công.", () => {
            this.showTalkAndDelay("Tiếp theo, Hãy học cách mang Pet theo bên mình nào.", () => {
                this.movePlayer(this.tutorialPlayer.position, this.positionChoosePet, () => {
                    this.animationTutorialPlayer.node.scale = new Vec3(-1, 1, 0);
                    this.showTalkAndDelay("Bây giờ hãy nhấn vào túi Pet.", () => {
                        this.animateSelection(this.buttonBagPet.worldPosition, this.openBagPet.bind(this), true);
                    });
                });
            });
        });
    }

    private openBagPet() {
        this.popupOwnedAnimals.node.active = true;
        this.showTalkAndDelay("Tiếp theo, Hãy chọn Pet mà bạn muốn mang theo và nhấn vào nó.", () => {
            this.animateSelection(this.itemAnimalSlot.node.worldPosition, () => {
                this.itemAnimalSlot.toggle.isChecked = true;
                this.showTalkAndDelay("Cuối cùng nhấn Lưu và cùng vui chơi thôi.", () => {
                    this.animateSelection(this.popupOwnedAnimals.saveButton.node.worldPosition, () => {
                        this.popupOwnedAnimals.node.active = false;
                        this.finishTutorial();
                    }, true);
                });
            }, true);
        });
    }

    private finishTutorial() {
        setTimeout(() => {
            this.movePlayer(this.tutorialPlayer.position, this.positionFinished, () => {
                this.animationTutorialPlayer.node.scale = new Vec3(1, 1, 0);
                this.showTalkAndDelay("Đơn giản mà phải không?", () => {
                    this.showTalkAndDelay("Còn chờ gì nữa mà không đi kiếm Pet thôi. ", () => {
                        const param: SelectionParam = {
                            content: "Bạn đã hoàn thành hướng dẫn. Chọn 'Bắt Đầu' để tiếp tục",
                            textButtonLeft: "",
                            textButtonRight: "",
                            textButtonCenter: "Bắt Đầu",
                            onActionButtonCenter: () => {
                                localStorage.setItem(Constants.TUTORIAL_CACTH_PET, 'true');
                                this.cancelTutorial();
                            },
                        };
                        PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
                    });
                });

            });
        }, this.timeout);

    }

    private movePlayer(from: Vec3, to: Vec3, onActionComplete?: () => void, duration: number = 1.5) {
        this.tutorialPlayer.setPosition(from);
        this.animationTutorialPlayer.play("move")
        tween(this.tutorialPlayer)
            .to(duration, { position: to })
            .call(() => {
                this.animationTutorialPlayer.play("idle");
                onActionComplete?.();
            })
            .start();
    }

    private dragonmove(from: Vec3, to: Vec3, onActionComplete?: () => void, duration: number = 1.5) {
        this.dragonIceTutorial.node.setPosition(from);
        tween(this.dragonIceTutorial.node)
            .to(duration, { position: to })
            .call(() => {
                this.animationTutorialPlayer.play("idle");
                onActionComplete?.();
            })
            .start();
    }

    private showTalkAndDelay(content: string, callback: () => void) {
        setTimeout(() => {
            this.talkAnimation?.showBubbleChat(content, this.timeTalk, () => callback());
        }, this.timeout);
    }

    private animateSelection(targetPosition: Vec3, onComplete: () => void, isWorldPosition: boolean = false) {
        this.selectionNode.position = this.tutorialPlayer.position;
        this.iconSelection.scale = Vec3.ONE;
        this.selectionNode.active = true;
        setTimeout(() => {
            if (isWorldPosition) {
                tween(this.selectionNode)
                    .to(this.timeMoveSelectionIcon, { worldPosition: targetPosition })
                    .call(() => {
                        tween(this.iconSelection)
                            .repeatForever(
                                tween()
                                    .to(0.3, { scale: new Vec3(1.5, 1.5, 1.5) })
                                    .to(0.3, { scale: Vec3.ONE })
                            )
                            .start();
                        setTimeout(() => {
                            Tween.stopAllByTarget(this.iconSelection);
                            this.iconSelection.scale = Vec3.ONE;
                            this.selectionNode.active = false;
                            onComplete();
                        }, this.timeAnimSelection);
                    })
                    .start();
                return;
            }
            tween(this.selectionNode)
                .to(this.timeMoveSelectionIcon, { position: targetPosition })
                .call(() => {
                    tween(this.iconSelection)
                        .repeatForever(
                            tween()
                                .to(0.3, { scale: new Vec3(1.5, 1.5, 1.5) })
                                .to(0.3, { scale: Vec3.ONE })
                        )
                        .start();
                    setTimeout(() => {
                        Tween.stopAllByTarget(this.iconSelection);
                        this.iconSelection.scale = Vec3.ONE;
                        this.selectionNode.active = false;
                        onComplete();
                    }, this.timeAnimSelection);
                })
                .start();

        }, this.timeout);

    }
    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid);
    }

    cancelTween() {
        Tween.stopAllByTarget(this.iconSelection);
        Tween.stopAllByTarget(this.selectionNode);
        Tween.stopAllByTarget(this.talkAnimation);
        Tween.stopAllByTarget(this.tutorialPlayer);
        Tween.stopAllByTarget(this.dragonIceTutorial);
    }

    fadeOutByColor(sprite: Sprite, duration: number = 1, onComplete?: () => void) {
        const startColor = sprite.color.clone(); // Màu ban đầu
        const tempColor = new Color(startColor.r, startColor.g, startColor.b, startColor.a); // Tạm thời

        tween(tempColor)
            .to(duration, { a: 0 }, {
                onUpdate: () => {
                    const c = new Color(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
                    sprite.color = c;
                }
            })
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }

    fadeInByColor(sprite: Sprite, duration: number = 1, onComplete?: () => void) {
        const startColor = sprite.color.clone(); // Màu ban đầu
        const tempColor = new Color(startColor.r, startColor.g, startColor.b, startColor.a); // Tạm thời

        tween(tempColor)
            .to(duration, { a: 255 }, {
                onUpdate: () => {
                    const c = new Color(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
                    sprite.color = c;
                }
            })
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }
}

export interface PopupTutorialCatchPetParam {
    onActionCancel?: () => void;
}



