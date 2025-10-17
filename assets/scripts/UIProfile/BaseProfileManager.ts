import { _decorator, assetManager, Component, ImageAsset, Label, Sprite, SpriteFrame, Texture2D, Color, debug, director, Vec3 } from 'cc';
import { MezonDTO } from '../Model/Player';
import { ResourceManager } from '../core/ResourceManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import { UserDataResponse } from '../Interface/DataMapAPI';
import { BasePopup } from '../PopUp/BasePopup';
import { Constants } from '../utilities/Constants';

const { ccclass, property } = _decorator;

@ccclass('BaseProfileManager')
export class BaseProfileManager extends BasePopup {
    @property(Sprite)
    protected sprite_Avatar: Sprite = null!;

    protected UserProfileData: UserDataResponse;

    public init(param?: any): void {
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

    protected loadAvatar(url: string) {
       Constants.loadAvatar(this.sprite_Avatar, url);
    }

    protected capitalizeWords(text: string): string {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }

}
