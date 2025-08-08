import { UserDataResponse } from "../Interface/DataMapAPI";
import { Food, FoodType, InventoryDTO } from "../Model/Item";
import { PetDTO } from "../Model/PetDTO";
import { PlayerPropertyWatcher } from "../utilities/PlayerPropertyWatcher";

export class UserMeManager {
    private static me: UserDataResponse | null = null;
    private static myPets: PetDTO[] | null = null;
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
        if (this._playerProperty == null) {
            this._playerProperty = new PlayerPropertyWatcher(me.user.gold, me.user.diamond, "");
            return;
        }
        this.PlayerProperty.gold = me.user.gold;
        this.PlayerProperty.diamond = me.user.diamond;
    }

    public static get GetFoods(): InventoryDTO[] | null {
        return this.me == null
            ? null
            : this.me.inventories
                .filter((inv): inv is InventoryDTO & { food: Food } => inv.food != null)
    }

    public static set SetMyPets(pets: PetDTO[]) {
        this.myPets = pets;
    }

    public static MyPets(): PetDTO[] | null {
        return this.myPets
    }

    public static set SetFood(food: Food) {
        if (!this.me || !this.me.inventories) return;

        const targetInventory = this.me.inventories.find(
            inv => inv.food != null && inv.food.type === food.type
        );

        if (targetInventory) {
            targetInventory.food = food;
        } else {
            console.warn(`Không tìm thấy inventory với food.type = ${food.type}`);
        }
    }

    public static AddQuantityFood(foodType: FoodType, quantity: number): boolean {
        if (!this.me || !this.me.inventories) return false;

        const targetInventory = this.me.inventories.find(
            inv => inv != null && inv.food != null && inv.food.type === foodType
        );

        if (targetInventory) {
            targetInventory.quantity += quantity;
            return true;
        }
        return false;
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


