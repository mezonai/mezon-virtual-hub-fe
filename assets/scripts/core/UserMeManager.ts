import { UserDataResponse } from "../Interface/DataMapAPI";
import { PlayerPropertyWatcher } from "../utilities/PlayerPropertyWatcher";

export class UserMeManager {
    private static me: UserDataResponse | null = null;
    private static _playerProperty = null;

    public static get Get(): UserDataResponse | null {
        return this.me;
    }

    public static set SetMap(mapData) {
        this.me.map = mapData;
    }

    public static get PlayerProperty() {
        return this._playerProperty;
    }

    public static set Set(me: UserDataResponse | null) {
        this.me = me;
        if(this._playerProperty == null){
            this._playerProperty = new PlayerPropertyWatcher(me.user.gold, me.user.diamond, "");
            return;
        }
        this.PlayerProperty.gold = me.user.gold;
        this.PlayerProperty.diamond = me.user.diamond;
    }

    public static set playerCoin(coin) {
        UserMeManager.PlayerProperty.gold = coin;
    }

    public static get playerCoin() {
        return UserMeManager.PlayerProperty.gold;
    }

    public static set playerDiamond(diamond) {
        UserMeManager.PlayerProperty.diamond = diamond;
    }

    public static get playerDiamond() {
        return UserMeManager.PlayerProperty.diamond;
    }
}


