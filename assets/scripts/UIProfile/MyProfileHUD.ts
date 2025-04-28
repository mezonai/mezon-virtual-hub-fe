import { _decorator, Color, director, Label, randomRange, Vec2, Vec3 } from 'cc';
import { BaseProfileManager } from './BaseProfileManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import Utilities from '../utilities/Utilities';
import { EffectManager } from '../core/EffectManager';
import { UserManager } from '../core/UserManager';
import { ServerManager } from '../core/ServerManager';
import { ExchangeCoinController } from '../core/ExchangeCoinController';

const { ccclass, property } = _decorator;

@ccclass('MyProfileHUD')
export class MyProfileHUD extends BaseProfileManager {
    @property(Label) private fullName_txt: Label = null!;
    @property(Label) private money_txt: Label = null!;
    private inited: boolean = false;
    @property({type: Vec3}) spawnTextEffectOffset: Vec3 = new Vec3();

    start(): void {
        director.on(EVENT_NAME.UPDATE_INFO_PROFILE, this.updateProfile, this);
        this.loadProfileUI();

        if (UserMeManager.Get) {
            UserMeManager.PlayerProperty.onChange("gold", (newCoin, oldValue) => {
                this.onCoinChange(newCoin, oldValue);
            });
            this.onCoinChange(UserMeManager.playerCoin, UserMeManager.playerCoin);
        }
    }

    protected onCoinChange(value, oldValue) {
        console.log(value, oldValue)
        this.money_txt.string = Utilities.convertBigNumberToStr(value);

        if (!this.inited) {
            this.inited = true;
        }
        else if (UserManager.instance?.GetMyClientPlayer != null){
            ServerManager.instance.playerUpdateGold(UserManager.instance?.GetMyClientPlayer.myID, value, oldValue, ExchangeCoinController.instance.buyAmount < 0);
            EffectManager.instance.spawnPointEffect(value - oldValue, UserManager.instance?.GetMyClientPlayer.node.worldPosition.clone().add(new Vec3(randomRange(-this.spawnTextEffectOffset.x, this.spawnTextEffectOffset.x), this.spawnTextEffectOffset.y, this.spawnTextEffectOffset.z)))
        }
    }

    protected loadProfileUI() {
        this.UserProfileData = UserMeManager.Get;

        if (!this.UserProfileData || !this.UserProfileData.user) return;
        this.loadAvatar(this.UserProfileData.user.avatar_url);
        this.fullName_txt.string = this.UserProfileData.user.display_name || this.UserProfileData.user.username;
    }

    protected updateProfile(data: any) {
        if (!data || !data.fullname) return;
        this.fullName_txt.string = data.fullname;
    }
}