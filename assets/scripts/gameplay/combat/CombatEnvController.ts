import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
import { AnimalElement } from '../../Model/PetDTO';
const { ccclass, property } = _decorator;

type FrameMap = {
    [key in AnimalElement]?: {
        bg?: SpriteFrame;
        ground?: SpriteFrame;
    }
};

@ccclass('CombatEnvController')
export class CombatEnvController extends Component {
    @property({ type: Sprite }) background: Sprite = null;
    @property({ type: Sprite }) bgFoot1: Sprite = null;
    @property({ type: Sprite }) bgFoot2: Sprite = null;

    @property({ type: [SpriteFrame] }) allBgFrames: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] }) allGroundFrames: SpriteFrame[] = [];

    private frameMap: FrameMap = {};

    onLoad() {
        this.buildFrameMap();
    }

    private buildFrameMap() {
        this.mapFramesToType(this.allBgFrames, (entry, frame) => entry.bg = frame);
        this.mapFramesToType(this.allGroundFrames, (entry, frame) => entry.ground = frame);
    }

    private mapFramesToType(
        frames: SpriteFrame[],
        assignFn: (entry: { bg?: SpriteFrame; ground?: SpriteFrame }, frame: SpriteFrame) => void
    ) {
        for (const frame of frames) {
            const typeKey = this.getTypeFromName(frame.name);
            if (typeKey !== null) {
                const type = AnimalElement[typeKey as keyof typeof AnimalElement];
                if (!this.frameMap[type]) this.frameMap[type] = {};
                assignFn(this.frameMap[type]!, frame);
            }
        }
    }

    private getTypeFromName(name: string): string | null {
        for (const key in AnimalElement) {
            if (isNaN(Number(key))) {
                if (name.toLowerCase().includes(key.toLowerCase())) {
                    return key;
                }
            }
        }
        return null;
    }

    public setEnvironmentByType(type: AnimalElement) {
        const config = this.frameMap[type];
        if (config) {
            if (config.bg) this.background.spriteFrame = config.bg;
            if (config.ground) {
                this.bgFoot1.spriteFrame = config.ground;
                this.bgFoot2.spriteFrame = config.ground;
            }
        }
    }
}
