import { MapData } from "../Interface/DataMapAPI";
import { Food, Item, RewardItemDTO, RewardType } from "../Model/Item";
import { PetDTO } from "../Model/PetDTO";

export default class ConvetData {
    public static ConvertMap(mapData: any): MapData[] {
        if (!mapData?.data || !Array.isArray(mapData.data)) {
            console.error("Dữ liệu API không hợp lệ:", mapData);
            return [];
        }

        return mapData.data.map((mapItem: any) => ({
            id: mapItem.id,
            name: mapItem.name,
            map_key: mapItem.map_key,
            isLocked: mapItem.is_locked
        }));
    }
    public static ConvertPets(petData: string): PetDTO[] {
        const dataArray = JSON.parse(petData);
        return dataArray.map((data: any) => {
            const petDTO = new PetDTO();
            petDTO.id = data.id;
            petDTO.name = data.name;
            petDTO.species = data.species;
            petDTO.is_caught = data.is_caught;
            petDTO.is_brought = data.is_brought;
            petDTO.room_code = data.room_code;
            petDTO.rarity = data.rarity;
            return petDTO;
        });
    }

    public static ConvertPet(petData: string): PetDTO {
        const data = JSON.parse(petData);
        const petDTO = new PetDTO();
        petDTO.id = data.id;
        petDTO.name = data.name;
        petDTO.species = data.species;
        petDTO.is_caught = data.is_caught;
        petDTO.is_brought = data.is_brought;
        petDTO.room_code = data.room_code;
        petDTO.rarity = data.rarity;
        return petDTO;
    }

    public static ConvertReward(data: any): RewardItemDTO[] {
        if (!Array.isArray(data)) return [];

        return data
            .filter((d: any) => d && typeof d === 'object')
            .map((entry: any) => {
                const rewardItem = new RewardItemDTO();

                switch (entry.type) {
                    case RewardType.ITEM:
                        rewardItem.type = RewardType.ITEM;
                        rewardItem.item = this.parseItem(entry.item);
                        rewardItem.quantity = 1;
                        break;

                    case RewardType.FOOD:
                        rewardItem.type = RewardType.FOOD;
                        rewardItem.food = this.parseFood(entry.food);
                        rewardItem.quantity = entry.quantity ?? 0;
                        break;

                    case RewardType.GOLD:
                    default:
                        rewardItem.type = RewardType.GOLD;
                        rewardItem.amount = entry.amount ?? 0;
                        break;
                }

                return rewardItem;
            });
    }

    public static parseFood(foodData: any): Food {
        const food = new Food();
        Object.assign(food, foodData);
        return food;
    }

    public static parseItem(itemData: any): Item {
        const item = new Item();
        Object.assign(item, itemData);
        item.iconSF = [];
        item.mappingLocalData = null;
        return item;
    }
}

