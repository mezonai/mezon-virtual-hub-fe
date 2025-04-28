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
        this._playerProperty = new PlayerPropertyWatcher(me.user.gold, "");
    }

    public static set playerCoin(coin) {
        UserMeManager.PlayerProperty.gold = coin;
    }

    public static get playerCoin() {
        return UserMeManager.PlayerProperty.gold;
    }
}


