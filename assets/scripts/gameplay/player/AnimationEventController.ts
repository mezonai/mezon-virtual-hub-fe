import { _decorator, CCString, Component, Node, sp, Sprite, SpriteFrame, Vec3 } from 'cc';
import { LoadBundleController } from '../../bundle/LoadBundleController';
import { UserMeManager } from '../../core/UserMeManager';
import { ResourceManager } from '../../core/ResourceManager';
import { Item, ItemType } from '../../Model/Item';
import { ServerManager } from '../../core/ServerManager';
const { ccclass, property } = _decorator;

@ccclass('CharacterPart')
export class CharacterPart {
    @property({ type: Sprite }) upper: Sprite = null;
    @property({ type: Sprite }) lower: Sprite = null;
    @property({ type: Sprite }) head: Sprite = null;
    @property({ type: Sprite }) eyes: Sprite = null;
    @property({ type: Sprite }) hair: Sprite = null;
}

class CharacterPartFrame {
    public upper: SpriteFrame[] = [];
    public lower: SpriteFrame[] = [];
    public face: SpriteFrame[] = [];
    public eyes: SpriteFrame[] = [];
    public hair: SpriteFrame[] = [];
}

export class CharacterPartAnim {
    public idleFrames: CharacterPartFrame = new CharacterPartFrame();
    public moveFrames: CharacterPartFrame = new CharacterPartFrame();
    public lieFrames: CharacterPartFrame = new CharacterPartFrame();
    public kneelFrames: CharacterPartFrame = new CharacterPartFrame();
    public sitFrames: CharacterPartFrame = new CharacterPartFrame();
    public happyFrames: CharacterPartFrame = new CharacterPartFrame();
}

@ccclass('AnimationEventController')
export class AnimationEventController extends Component {
    @property({ type: [SpriteFrame] }) avatars: SpriteFrame[] = [];
    @property({ type: [CCString] }) partsName: string[] = [];
    @property({ type: CharacterPart }) characterParts: CharacterPart;
    private characterPartAnim: CharacterPartAnim = new CharacterPartAnim();
    private isInitDone = false;
    private offsetPos: Vec3;
    private currentSkinSet: { [key: string]: string } = {};
    private partOffsets: Record<string, Vec3> = {};

    public async init(skinSet: string[]) {
        await this.loadSkin(skinSet);
    }

    public reset() {
        this.loadSkin([]);
    }

    public async loadSkin(skinSet: string[]) {
        if (!UserMeManager.Get) {
            return;
        }

        if (skinSet.length == 0) {
            const defaultSkinSet = UserMeManager.Get.user?.skin_set;
            if (!Array.isArray(defaultSkinSet)) {
                return;
            }
            skinSet = defaultSkinSet;
        }

        this.partsName = [];
        // reset the old offsets
        this.partOffsets = {};
        for (const skinId of skinSet) {
            const localData = ResourceManager.instance.getLocalSkinById(skinId, ItemType.NULL);
            if (!localData) continue;
            if (localData.icons && Array.isArray(localData.icons)) {
                this.partsName.push(...localData.icons);
                const partKey = localData.icons[0].split("-")[2];
                this.currentSkinSet[partKey] = skinId;
            
                if (localData.posX != null && localData.posY != null) {
                    this.partOffsets[partKey] = new Vec3(localData.posX, localData.posY, 0);
                } else {
                    this.partOffsets[partKey] = Vec3.ZERO;
                }
            }
        }
        // Only pass the offset for part "H"
        const hOffset = this.partOffsets['H'] || Vec3.ZERO;
        await this.tryLoadDefaultSkin(hOffset);
    }
    
    private async tryLoadDefaultSkin(hOffset: Vec3) {
        if (!LoadBundleController.instance) {
            return;
        }
        this.isInitDone = false;
        await LoadBundleController.instance.isInitDone();
        this.avatars = [];
        for (const part of this.partsName) {
            let index = parseInt(part.split("-")[0]);
            let bundleName = "SkinBundle" + (Math.ceil(index / 10))
            let bundleData = {
                bundleName: bundleName,
                bundlePath: part
            }
            let sprite = await LoadBundleController.instance.spriteBundleLoader.getBundleData(bundleData);
            this.avatars.push(sprite);
        }
        // Only apply the offset for part H
        this.initSkinSet(this.avatars, hOffset);
        this.isInitDone = true;
    }

    public async waitForSkinInitDone(): Promise<boolean> {
        while (!this.isInitDone) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }


    public changeSkin(skinData: Item, applyToPlayer: boolean) {

        let parts = skinData.iconSF;
        let part = parts[0].name.split('-')[2];
        this.avatars = this.avatars.filter(x  => x!= null);
        let remainPart = this.avatars.filter(x => x.name.split('-')[2] != part);
        remainPart.push(...parts);
        this.currentSkinSet[part] = skinData.id;
        let offset = null;
        if (skinData.mappingLocalData.posX != null && skinData.mappingLocalData.posY != null) {
            offset = new Vec3(skinData.mappingLocalData.posX, skinData.mappingLocalData.posY, 0);
        }

        this.initSkinSet(remainPart, offset);

        if (applyToPlayer) {
            UserMeManager.Get.user.skin_set = [];
            for (const key in this.currentSkinSet) {
                if (this.currentSkinSet.hasOwnProperty(key)) {
                    UserMeManager.Get.user.skin_set.push(this.currentSkinSet[key]);
                }
            }

            ServerManager.instance.updatePlayerSkin(UserMeManager.Get.user.skin_set);
        }
    }

    public initSkinSet(avatars: SpriteFrame[], offsetPos: Vec3 = null) {
        this.offsetPos = offsetPos;
        this.characterPartAnim = new CharacterPartAnim();
        this.avatars = avatars;
        avatars.forEach(avatar => {
            if (avatar) {
                // SetIndex - Anim (Idle, Move, Lie, Kneel, Sit, Happy) - Part (Head, Eyes, Hair, Upper, Lower) - ItemIndex
                switch (avatar.name.split("-")[1]) {
                    case "I":
                        this.setAnimatePart(avatar, this.characterPartAnim.idleFrames);
                        break;
                    case "M":
                        this.setAnimatePart(avatar, this.characterPartAnim.moveFrames);
                        break;
                    case "L":
                        this.setAnimatePart(avatar, this.characterPartAnim.lieFrames);
                        break;
                    case "K":
                        this.setAnimatePart(avatar, this.characterPartAnim.kneelFrames);
                        break;
                    case "S":
                        this.setAnimatePart(avatar, this.characterPartAnim.sitFrames);
                        break;
                    case "H":
                        this.setAnimatePart(avatar, this.characterPartAnim.happyFrames);
                        break;
                }
            }
        });
        this.fillFramePart();
    }

    private setAnimatePart(avatar, characterPartAnim: CharacterPartFrame) {
        switch (avatar.name.split("-")[2]) {
            case "U":
                characterPartAnim.upper.push(avatar);
                break;
            case "L":
                characterPartAnim.lower.push(avatar);
                break;
            case "F":
                characterPartAnim.face.push(avatar);
                break;
            case "E":
                characterPartAnim.eyes.push(avatar);
                break;
            case "H":
                characterPartAnim.hair.push(avatar);
                break;
        }
    }

    private fillFramePart() {
        // happy
        this.characterPartAnim.happyFrames.face.push(this.characterPartAnim.idleFrames.face[0]);
        this.characterPartAnim.happyFrames.eyes.push(this.characterPartAnim.idleFrames.eyes[0]);
        this.characterPartAnim.happyFrames.hair.push(this.characterPartAnim.idleFrames.hair[0]);
        this.characterPartAnim.happyFrames.lower.push(this.characterPartAnim.idleFrames.lower[0]);

        // kneel
        this.characterPartAnim.kneelFrames.face.push(this.characterPartAnim.idleFrames.face[0]);
        this.characterPartAnim.kneelFrames.eyes.push(this.characterPartAnim.idleFrames.eyes[0]);
        this.characterPartAnim.kneelFrames.hair.push(this.characterPartAnim.idleFrames.hair[0]);
        this.characterPartAnim.kneelFrames.upper.push(this.characterPartAnim.idleFrames.upper[0]);

        // lie
        this.characterPartAnim.lieFrames.face.push(this.characterPartAnim.idleFrames.face[0]);
        this.characterPartAnim.lieFrames.eyes.push(this.characterPartAnim.idleFrames.eyes[0]);
        this.characterPartAnim.lieFrames.hair.push(this.characterPartAnim.idleFrames.hair[0]);

        // move
        this.characterPartAnim.moveFrames.face.push(this.characterPartAnim.idleFrames.face[0]);
        this.characterPartAnim.moveFrames.eyes.push(this.characterPartAnim.idleFrames.eyes[0]);
        this.characterPartAnim.moveFrames.hair.push(this.characterPartAnim.idleFrames.hair[0]);
        this.characterPartAnim.moveFrames.upper.push(this.characterPartAnim.idleFrames.upper[0]);
        this.characterPartAnim.moveFrames.lower.push(this.characterPartAnim.idleFrames.lower[0]);

        // sit
        this.characterPartAnim.sitFrames.face.push(this.characterPartAnim.idleFrames.face[0]);
        this.characterPartAnim.sitFrames.eyes.push(this.characterPartAnim.idleFrames.eyes[0]);
        this.characterPartAnim.sitFrames.hair.push(this.characterPartAnim.idleFrames.hair[0]);
        this.characterPartAnim.sitFrames.upper.push(this.characterPartAnim.idleFrames.upper[0]);
    }

    private animationDataPart = [];
    private animName: string = "";
    private index: number = 0;
    private targetSkinSet: CharacterPartFrame;
    public onAnimationEvent(animationData: string) {
        if (!this.isInitDone) {
            return;
        }

        this.animationDataPart = animationData.split('-');
        this.animName = this.animationDataPart[0];
        this.index = this.animationDataPart[1];
        switch (this.animName) {
            case "idle":
                this.targetSkinSet = this.characterPartAnim.idleFrames;
                break;
            case "move":
                this.targetSkinSet = this.characterPartAnim.moveFrames;
                break;
            case "lie":
                this.targetSkinSet = this.characterPartAnim.lieFrames;
                break;
            case "happy":
                this.targetSkinSet = this.characterPartAnim.happyFrames;
                break;
            case "kneel":
                this.targetSkinSet = this.characterPartAnim.kneelFrames;
                break;
            case "sit":
                this.targetSkinSet = this.characterPartAnim.sitFrames;
                break;
            default:
                break;
        }

        this.changeSkinSet(this.targetSkinSet, this.index);

        if (this.offsetPos) {
            this.characterParts.hair.node.setPosition(this.offsetPos.x, this.offsetPos.y, 0);
        }
    }

    private changeSkinSet(skinSet: CharacterPartFrame, index: number) {
        if (index < skinSet.face.length) {
            this.characterParts.head.spriteFrame = skinSet.face[index];
        }
        if (index < skinSet.eyes.length) {
            this.characterParts.eyes.spriteFrame = skinSet.eyes[index];
        }
        if (index < skinSet.hair.length) {
            this.characterParts.hair.spriteFrame = skinSet.hair[index];
        }
        if (index < skinSet.upper.length) {
            this.characterParts.upper.spriteFrame = skinSet.upper[index];
        }
        if (index < skinSet.lower.length) {
            this.characterParts.lower.spriteFrame = skinSet.lower[index];
        }
    }
}