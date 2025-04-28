import { _decorator, CCString, Component, Sprite } from 'cc';
import { LoadBundleController } from './LoadBundleController';
const { ccclass, property } = _decorator;

@ccclass('SpriteBundleGetter')
export class SpriteBundleGetter extends Component {
    private sprite: Sprite;
    @property({type: CCString}) path: string = "";

    private get Sprite() {
        if (this.sprite == null) {
            this.sprite = this.node.getComponent(Sprite);
        }

        return this.sprite;
    }

    protected onEnable(): void {
        if (this.Sprite != null) {
            this.getSprite();
        }
    }

    private async getSprite() {
        await LoadBundleController.instance.isInitDone();
        let spriteFrame = LoadBundleController.instance.spriteBundleLoader.assetDictionary[this.path];
        if (spriteFrame != null) {
            this.sprite.spriteFrame = spriteFrame;
        }
    }
}


