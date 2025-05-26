import { UserDataResponse } from "../Interface/DataMapAPI";
import { Food, InventoryDTO } from "../Model/Item";
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
        this._playerProperty = new PlayerPropertyWatcher(me.user.gold, me.user.diamond, "");
    }

    public static get GetFoods():InventoryDTO[] | null {
       return this.me == null
        ? null
        : this.me.inventories
            .filter((inv): inv is InventoryDTO & { food: Food } => inv.food != null)         
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


