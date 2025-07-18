import { _decorator, Button, director, Label, randomRange, Vec3 } from 'cc';
import { BaseProfileManager } from './BaseProfileManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import Utilities from '../utilities/Utilities';
import { EffectManager } from '../core/EffectManager';
import { UserManager } from '../core/UserManager';
import { ServerManager } from '../core/ServerManager';
import { ExchangeCoinController } from '../core/ExchangeCoinController';
import { RewardType } from '../Model/Item';
import { MoneyTooltip } from '../Tooltip/MoneyTooltip';
import { PopupManager } from '../PopUp/PopupManager';
import { MyProfileManager } from './MyProfileManager';

const { ccclass, property } = _decorator;

@ccclass('MyProfileHUD')
export class MyProfileHUD extends BaseProfileManager {
    @property(Label) private fullName_txt: Label = null!;
    @property(Label) private gold_txt: Label = null!;
    @property(Label) private dimond_txt: Label = null!;
    private inited: boolean = false;
    @property({ type: Vec3 }) spawnTextEffectOffset: Vec3 = new Vec3();

    @property(MoneyTooltip)
    tooltip1: MoneyTooltip = null;
    @property(MoneyTooltip)
    tooltip2: MoneyTooltip = null;
    @property(Button) infoButton: Button = null;

    start(): void {
        director.on(EVENT_NAME.UPDATE_INFO_PROFILE, this.updateProfile, this);
        this.loadProfileUI();

        if (UserMeManager.Get) {
            UserMeManager.PlayerProperty.onChange("gold", (newCoin, oldValue) => {
                this.onCoinChangeGold(newCoin, oldValue);
            });
            this.onCoinChangeGold(UserMeManager.playerCoin, UserMeManager.playerCoin);
        }

        if (UserMeManager.Get) {
            UserMeManager.PlayerProperty.onChange("diamond", (newDiamond, oldValue) => {
                this.onCoinChangeDiamond(newDiamond, oldValue);
            });
            this.onCoinChangeDiamond(UserMeManager.playerDiamond, UserMeManager.playerDiamond);
        }
        this.infoButton.node.on('click', this.onShowInfo, this);
    }

    private onShowInfo(){
        PopupManager.getInstance().openAnimPopup('UI_My_Profile', MyProfileManager);
    }

    protected onCoinChangeGold(value, oldValue) {
        this.gold_txt.string = Utilities.convertBigNumberToStr(value);
        this.tooltip1.setFullValue(value);

        if (!this.inited) {
            this.inited = true;
        }
        else if (UserManager.instance?.GetMyClientPlayer != null) {
            ServerManager.instance.playerUpdateGold(UserManager.instance?.GetMyClientPlayer.myID, value, oldValue, ExchangeCoinController.instance.amount < 0);
            EffectManager.instance.spawnPointEffect(value - oldValue, UserManager.instance?.GetMyClientPlayer.node.worldPosition.clone().add(new Vec3(randomRange(-this.spawnTextEffectOffset.x, this.spawnTextEffectOffset.x), this.spawnTextEffectOffset.y, this.spawnTextEffectOffset.z)), RewardType.GOLD)
        }
    }

    protected onCoinChangeDiamond(value, oldValue) {
        if (!this.dimond_txt) return;
        this.dimond_txt.string = Utilities.convertBigNumberToStr(value);
        this.tooltip2.setFullValue(value);
        if (!this.inited) {
            this.inited = true;
        }
        else if (UserManager.instance?.GetMyClientPlayer != null) {
            ServerManager.instance.playerUpdateDiamond(UserManager.instance?.GetMyClientPlayer.myID, value, oldValue, ExchangeCoinController.instance.amount < 0);
            EffectManager.instance.spawnPointEffect(value - oldValue, UserManager.instance?.GetMyClientPlayer.node.worldPosition.clone().add(new Vec3(randomRange(-this.spawnTextEffectOffset.x, this.spawnTextEffectOffset.x), this.spawnTextEffectOffset.y, this.spawnTextEffectOffset.z)), RewardType.DIAMOND)
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