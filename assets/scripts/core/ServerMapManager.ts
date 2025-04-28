import { MapData } from "../Interface/DataMapAPI";

export class ServerMapManager {
    private static maps: MapData[] | null = null;
    
        public static get Get(): MapData[] | null {
            return this.maps;
        }
    
        public static set Set(maps: MapData[]) {
            if (Array.isArray(maps)) {
                this.maps = maps;
                console.log("✅ Maps stored in ServerMapManager:", this.maps);
            } else {
                console.error("❌ Invalid data: maps should be an array!");
            }
        }
}


