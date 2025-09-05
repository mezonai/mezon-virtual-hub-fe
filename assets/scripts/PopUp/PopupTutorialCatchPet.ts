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
import { Element, PetDTO, SkillCode, SkillSlot } from '../Model/PetDTO';
import { PopupBattlePlace } from './PopupBattlePlace';
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
    @property({ type: PopupBattlePlace }) popupBattlePlace: PopupBattlePlace = null;
    private timeMoveSelectionIcon: number = 0.75;
    private timeout: number = 0.5;
    private timeAnimSelection: number = 0.5;
    private timeTalk: number = 0.25;
    private timeFade: number = 1.5;
    private defaultStartDragonIce: Vec3 = new Vec3(406, 0, 0);
    private positionPoint1DragonIce: Vec3 = new Vec3(-80, 40, 0);
    private positionPoint2DragonIce: Vec3 = new Vec3(-60, 10, 0);
    private positionPlayerIntro: Vec3 = new Vec3(-4.5, -10, 0);
    private defaultPosititonPlayer: Vec3 = new Vec3(-70, 15, 0);
    private defaultPosititonPet: Vec3 = new Vec3(65, 15, 0);
    private positionInteractPet: Vec3 = new Vec3(10, 15, 0);
    private positionChoosePet: Vec3 = new Vec3(105, -35, 0);
    private positionFinished: Vec3 = new Vec3(-4.5, -10, 0);
    private _onActionCompleted: (() => void) | null = null;

    public async init(param?: PopupTutorialCatchPetParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        this.initilize(param);
        this.playTutorialCatchPet();
    }

    async playTutorialCatchPet() {
        let pets: PetDTO[] = [];
        const pet = this.createPetTest(0);
        const pet1 = this.createPetTest(1);
        const pet2 = this.createPetTest(2);
        const pet3 = this.createPetTest(3);
        if (pet != null) pets.push(pet);
        if (pet1 != null) pets.push(pet1);
        if (pet2 != null) pets.push(pet2);
        if (pet3 != null) pets.push(pet3);
        if (this.node != null && this.popupOwnedAnimals != null) this.popupOwnedAnimals.InitPet(pets);
        if (this.node != null && this.dragonIceTutorial != null) this.dragonIceTutorial.spriteNode.scale = new Vec3(-1, 1, 0);
        await this.dragonMove(this.defaultStartDragonIce, this.positionPoint1DragonIce);
        if (this.node != null && this.dragonIceTutorial != null) this.dragonIceTutorial.spriteNode.scale = new Vec3(1, 1, 0);
        await this.dragonMove(this.positionPoint1DragonIce, this.positionPoint2DragonIce);
        if (this.node != null && this.tutorialPlayer != null) this.tutorialPlayer.active = true;
        await this.showTalkAndDelay("Pet của tôi đó.");
        await this.showTalkAndDelay("Bạn có muốn sở hữu 1 con như tôi không?");
        await this.showTalkAndDelay("Hãy để tôi hướng dẫn bạn cách để sở hữu một con Pet.");
        await this.fadeInByColor(this.blackBackground, this.timeFade);
        if (this.node != null && this.tutorialPlayer != null) this.tutorialPlayer?.setPosition(this.defaultPosititonPlayer);
        if (this.node != null && this.dragonIceTutorial != null) this.dragonIceTutorial.node.active = false;
        await this.fadeOutByColor(this.blackBackground, this.timeFade);
        ///stepMoveToPet
        if (this.node != null && this.animalTutorial != null) this.animalTutorial.node.active = true;
        await this.showTalkAndDelay("Đằng kia là pet.");
        await this.showTalkAndDelay("Đầu tiên bạn cần đến gần pet hơn.");
        await this.movePlayer(this.defaultPosititonPlayer, this.positionInteractPet);
        await this.showTalkAndDelay("Sau đó bạn hãy chạm vào Pet.");
        //TouchEffect
        if (this.node != null && this.animalTutorial != null) await this.playAnimationSelection(this.animalTutorial.node.position);
        if (this.node == null || this.animalTutorial == null) return;
        const interactPet = this.animalTutorial.getComponentInChildren(AnimalInteractManager);
        if (interactPet) {
            interactPet.showUITutorial(true);
            await Constants.waitUntil(() => interactPet == null || interactPet.node == null || interactPet.node.activeInHierarchy);
            //SelectFood
            await this.showTalkAndDelay("Lúc này hãy lựa chọn thức ăn bạn muốn dùng.");
            await this.showTalkAndDelay("Sau đó nhấn vào để thả thức ăn bắt Pet.");
            if (this.node != null && interactPet != null) await this.playAnimationSelection(interactPet.normalFood.node.worldPosition, true);
            interactPet.showUITutorial(false);
            const petCatching = this.tutorialPlayer.getComponent(PetCatchingController);
            if (petCatching) {
                await petCatching.throwFoodToPet(this.animalTutorial.node, FoodType.NORMAL, true);
                await Constants.waitForSeconds(this.timeout);
                if (this.node != null && this.animalTutorial != null) this.animalTutorial.node.active = false;
                if (this.node != null && this.confirmPopup != null) this.confirmPopup.node.active = true;
                await Constants.waitForSeconds(this.timeout);
                if (this.node != null && this.confirmPopup != null) await this.playAnimationSelection(this.confirmPopup.closeButton.node.worldPosition, true);
                if (this.node != null && this.confirmPopup != null) this.confirmPopup.node.active = false;
                //Show PopupOwnedAnimals
                await this.showTalkAndDelay("Pet đã được bắt thành công.");
                await this.showTalkAndDelay("Tiếp theo, Hãy học cách mang Pet theo bên mình nào.");
                await this.movePlayer(this.tutorialPlayer.position, this.positionChoosePet);
                if (this.node != null && this.animationTutorialPlayer != null) this.animationTutorialPlayer.node.scale = new Vec3(-1, 1, 0);
                await this.showTalkAndDelay("Bây giờ hãy nhấn vào túi Pet.");
                if (this.node != null && this.buttonBagPet != null) await this.playAnimationSelection(this.buttonBagPet.worldPosition, true);
                if (this.node != null && this.popupOwnedAnimals != null) this.popupOwnedAnimals.node.active = true;
                await this.showTalkAndDelay("Tiếp theo, Hãy chọn Pet mà bạn muốn mang theo và nhấn vào nó.");
                if (this.node != null && this.popupOwnedAnimals != null) await this.playAnimationSelection(this.popupOwnedAnimals.animalSlots[0].node.worldPosition, true);
                await this.showTalkAndDelay("Tiếp theo, Hãy Nhấn vào mang theo.");
                if (this.node != null && this.popupOwnedAnimals != null) await this.playAnimationSelection(this.popupOwnedAnimals.bringButton.node.worldPosition, true);
                if (this.node != null) pets[0].is_brought = true;
                if (this.node != null && this.popupOwnedAnimals != null) this.popupOwnedAnimals.animalSlots[0].setBringPet();
                if (this.node != null && this.popupOwnedAnimals != null) this.popupOwnedAnimals.updatePetActionButtons(pets[0]);
                await this.showTalkAndDelay("Bây giờ bạn có thể dắt pet đi theo cùng mình.");
                await this.showTalkAndDelay("Cuối cùng, Bạn hãy đóng popup lại và vui chơi thôi.");
                if (this.node != null && this.popupOwnedAnimals != null) this.popupOwnedAnimals.node.active = false;
                this.finishTutorial();
            }
        }
    }

    createPetTest(index: number): PetDTO {
        const skillSlot1: SkillSlot = {
            skill_code: SkillCode.GROWL,
            name: "Gầm Gừ",
            type: Element.Normal,
            damage: 0,
            accuracy: 100,
            power_points: 10,
            description: "Growl khiến đối thủ sợ hãi, từ đó giảm 5 chỉ số Attack của đối thủ",
        };
        const skillSlot2: SkillSlot = {
            skill_code: SkillCode.BITE,
            name: "Gầm Gừ",
            type: Element.Normal,
            damage: 60,
            accuracy: 100,
            power_points: 10,
            description: "Pet sử dụng hàm răng sắt nhọn để cắn đối thủ",
        };
        const pet: PetDTO = {
            id: `000001111111111${index}`,
            name: index == 0 ? "Dog" : index == 1 ? "Bird" : index == 2 ? "Cat" : "Rabit",
            is_brought: false,
            is_caught: true,
            room_code: "sg",
            species: index == 0 ? "Dog" : index == 1 ? "Bird" : index == 2 ? "Cat" : "Rabit",
            type: "Normal",
            rarity: "common",
            level: 1,
            exp: 1,
            max_exp: 7,
            stars: 1,
            hp: 100,
            attack: 100,
            defense: 30,
            speed: 40,
            battle_slot: 0,
            individual_value: 25,
            pet: {
                species: index == 0 ? "Dog" : index == 1 ? "Bird" : index == 2 ? "Cat" : "Rabit",
                type: "Normal",
                rarity: "common"
            },
            skill_slot_1: skillSlot1,
            skill_slot_2: skillSlot2,
            skill_slot_3: null,
            skill_slot_4: null,
            equipped_skill_codes: [SkillCode.GROWL, SkillCode.BITE],
        };
        return pet;
    }

    private initilize(param?: PopupTutorialCatchPetParam) {
        if (param?.onActionCompleted) {
            this._onActionCompleted = param.onActionCompleted;
        }
        this.tutorialPlayer.active = false;
        this.animalTutorial.node.active = false;
        this.animationTutorialPlayer.node.scale = new Vec3(1, 1, 0);
        this.confirmPopup.node.active = false;
        this.selectionNode.active = false;
        //this.itemAnimalSlot.toggle.isChecked = false;
        this.popupOwnedAnimals.node.active = false;
        this.animationEventTutorialPlayer.loadSkin(ResourceManager.instance.LocalSkinConfig.male.defaultSet);
        this.tutorialPlayer.setPosition(this.positionPlayerIntro);
        this.animalTutorial.node.setPosition(this.defaultPosititonPet);
        this.animalTutorial.node.setScale(new Vec3(0.4, 0.4, 0.4));
        this.buttonSkip.node.on(Button.EventType.CLICK, () => {
            localStorage.setItem(Constants.TUTORIAL_CACTH_PET, 'true');
            this.cancelTutorial();
        }, this);

    }

    cancelTutorial() {
        this._onActionCompleted?.();
        this.cancelTween();
        this.closePopup();
    }

    private async finishTutorial() {
        await Constants.waitForSeconds(this.timeout);
        if (this.node != null && this.tutorialPlayer != null) await this.movePlayer(this.tutorialPlayer.position, this.positionFinished);
        if (this.node != null && this.animationTutorialPlayer != null) this.animationTutorialPlayer.node.scale = new Vec3(1, 1, 0);
        await this.showTalkAndDelay("Đơn giản mà phải không?");
        await this.showTalkAndDelay("Còn chờ gì nữa mà không đi kiếm Pet thôi. ");
        const param: SelectionParam = {
            content: "Bạn đã hoàn thành hướng dẫn. Chọn 'Bắt Đầu' để tiếp tục",
            textButtonLeft: "",
            textButtonRight: "",
            textButtonCenter: "Bắt Đầu",
            onActionButtonCenter: async () => {
                localStorage.setItem(Constants.TUTORIAL_CACTH_PET, 'true');
                this.cancelTutorial();
            },
        };
        await PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

    private movePlayer(from: Vec3, to: Vec3, duration: number = 1.5): Promise<void> {
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

    private dragonMove(from: Vec3, to: Vec3, duration: number = 1.5): Promise<void> {
        return new Promise((resolve) => {
            if (this.node == null || this.dragonIceTutorial == null) {
                resolve();
                return;
            }
            this.dragonIceTutorial.node.setPosition(from);
            tween(this.dragonIceTutorial.node)
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

    private async showTalkAndDelay(content: string): Promise<void> {
        await Constants.waitForSeconds(this.timeout);
        this.talkAnimation?.showBubbleChat(content, this.timeTalk);
        await Constants.waitUntil(() => this.talkAnimation == null || this.talkAnimation.node == null || this.talkAnimation.node.getScale().x <= 0);
    }

    private playAnimationSelection(targetPosition: Vec3, isWorldPosition: boolean = false): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.node == null || this.selectionNode == null || this.iconSelection == null) {
                resolve();
                return;
            }
            this.selectionNode.position = this.tutorialPlayer.position;
            this.iconSelection.scale = Vec3.ONE;
            this.selectionNode.active = true;
            Constants.waitForSeconds(this.timeout).then(() => {
                const tweenTarget = isWorldPosition
                    ? { worldPosition: targetPosition }
                    : { position: targetPosition };

                tween(this.selectionNode)
                    .to(this.timeMoveSelectionIcon, tweenTarget)
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
                        Constants.waitForSeconds(this.timeAnimSelection).then(() => {
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

export interface PopupTutorialCatchPetParam {
    onActionCompleted?: () => void;
}



