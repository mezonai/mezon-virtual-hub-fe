import { MapData } from "../Interface/DataMapAPI";
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
    public static ConvertPet(petData: string): PetDTO[] {
        const dataArray = JSON.parse(petData);
        return dataArray.map((data: any) => {
            const petDTO = new PetDTO();
            petDTO.id = data.id;
            petDTO.name = data.name;
            petDTO.species = data.species;
            petDTO.is_caught = data.is_caught;
            petDTO.is_brought = data.is_brought;
            petDTO.room_code = data.room_code;
            return petDTO;
        });
    }
}

