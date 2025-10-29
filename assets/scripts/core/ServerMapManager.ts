import { ClansData } from "../Interface/DataMapAPI";

export class ServerMapManager {
    private static maps: ClansData[] | null = null;
    
        public static get Get(): ClansData[] | null {
            return this.maps;
        }
    
        public static set Set(maps: ClansData[]) {
            if (Array.isArray(maps)) {
                this.maps = maps;
                console.log("✅ Maps stored in ServerMapManager:", this.maps);
            } else {
                console.error("❌ Invalid data: maps should be an array!");
            }
        }
}


