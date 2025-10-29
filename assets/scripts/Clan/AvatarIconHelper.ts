import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AvatarIconHelper')
export class AvatarIconHelper extends Component {
    @property([SpriteFrame])
    avatarIcons: SpriteFrame[] = [];

    @property(Sprite)
    avatarSprite: Sprite | null = null;

    private avatarMap: Record<string, SpriteFrame> = {};
    private isInit = false;

    onLoad() {
        this.buildAvatarMap();
        this.isInit = true;
    }

    private buildAvatarMap() {
        this.avatarMap = {};
        for (const sf of this.avatarIcons) {
            if (sf && sf.name) {
                const match = sf.name.match(/avatar_(\d+)/);
                if (match) {
                    this.avatarMap[match[1]] = sf;
                }
                this.avatarMap[sf.name.toLowerCase()] = sf;
            }
        }
    }

    public setAvatar(avatarName: string | number) {
        if (!this.avatarSprite) return;
        if (!this.isInit) {
            this.buildAvatarMap();
            this.isInit = true;
        }

        const key = avatarName.toString().trim().toLowerCase();
        let frame = this.avatarMap[key];

        if (!frame) {
            const match = key.match(/(\d+)/);
            if (match) frame = this.avatarMap[match[1]];
        }

        if (!frame) {
            console.warn(`[AvatarIconHelper] Không tìm thấy avatar: ${avatarName}`);
        }

        this.avatarSprite.spriteFrame = frame ?? null;
    }

}
