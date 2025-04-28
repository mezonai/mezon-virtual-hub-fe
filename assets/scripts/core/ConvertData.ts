import { MapData } from "../Interface/DataMapAPI";

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
}

