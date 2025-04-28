import { _decorator, assetManager, Component, ImageAsset, Label, Sprite, SpriteFrame, Texture2D, Color, debug, director, Vec3 } from 'cc';
import { MezonDTO } from '../Model/Player';
import { ResourceManager } from '../core/ResourceManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import { UserDataResponse } from '../Interface/DataMapAPI';

const { ccclass, property } = _decorator;

@ccclass('BaseProfileManager')
export class BaseProfileManager extends Component {
    @property(Sprite)
    protected sprite_Avatar: Sprite = null!;

    protected UserProfileData: UserDataResponse;

    onLoad() {
        if (!UserMeManager.Get) {
            return;
        }
        this.LoadUserProfile();
    }

    protected LoadUserProfile() {
        this.UserProfileData = UserMeManager.Get;
        this.loadProfileUI();
        this.loadAvatar(this.UserProfileData.user?.avatar_url);
    }

    protected loadProfileUI() {
    }

    protected updateProfile(data: any) {
    }

    private scaleFacor: number = 62.13;
    protected loadAvatar(url: string) {
        if (!this.sprite_Avatar || !url) return;

        assetManager.loadRemote(url, { ext: '.png' }, (err, imageAsset) => {
            if (err) {
                console.log("Failed to load image:", err);
                return;
            }

            if (!(imageAsset instanceof ImageAsset)) {
                console.log("Loaded asset is not an ImageAsset!");
                return;
            }
            const texture = new Texture2D();
            texture.image = imageAsset;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            let scaleValue = this.scaleFacor / spriteFrame.width;
            this.sprite_Avatar.node.scale = new Vec3(scaleValue, scaleValue, scaleValue);
            this.sprite_Avatar.spriteFrame = spriteFrame;
        });

    }

    protected capitalizeWords(text: string): string {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }

}
