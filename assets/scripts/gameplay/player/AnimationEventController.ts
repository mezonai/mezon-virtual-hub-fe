import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
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
    @property({ type: CharacterPart }) characterParts: CharacterPart;
    private readonly characterPartAnim: CharacterPartAnim = new CharacterPartAnim();
    
    protected start(): void {
        this.init(this.avatars);
        console.log(this.characterPartAnim);
    }

    public init(avatars: SpriteFrame[]) {
        this.avatars = avatars;
        avatars.forEach(avatar => {
            // Anim - Part
            switch (avatar.name[0]) {
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
        });
    }

    private setAnimatePart(avatar, characterPartAnim: CharacterPartFrame) {
        switch (avatar.name[2]) {
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

    public onAnimationEvent(name) {
        console.log(name)
    }
}


