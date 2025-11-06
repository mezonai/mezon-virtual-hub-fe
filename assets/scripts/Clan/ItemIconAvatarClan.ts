import { _decorator, Component, Node, Sprite, SpriteFrame, Toggle, Vec3, tween} from 'cc';
import { AvatarIconHelper } from './AvatarIconHelper';
import { SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('ItemIconAvatarClan')
export class ItemIconAvatarClan extends Component {
    @property({ type: AvatarIconHelper }) avatarIconHelper: AvatarIconHelper = null;
    @property({ type: Node }) selectedMark: Node = null;
    @property({ type: Sprite }) stasSprite: Sprite = null;
    @property({ type: [SpriteFrame] }) stasFrame: SpriteFrame[] = [];
    @property({ type: Toggle }) toggle: Toggle = null;

    public start(): void {
        this.toggle.node.on("toggle", this.onToggle, this);
    }
    
    public toggleActive(isActive) {
        this.stasSprite.spriteFrame = isActive ? this.stasFrame[1] : this.stasFrame[0];
        this.toggle.isChecked = isActive;
    }

    public onToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.selectedMark.active = toggle.isChecked;
            this.selectedMark.scale = Vec3.ONE;
            tween(this.selectedMark)
                .to(0.1, { scale: new Vec3(1.3, 1.3, 1.3) })
                .to(0.1, { scale: Vec3.ONE })
                .start();
        }
    }
}


