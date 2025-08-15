import { ServerMapManager } from "../core/ServerMapManager";
import { OfficePosition } from "../GameMap/OfficePosition";
import { RoomType } from "../GameMap/RoomType";
import { MapData } from "../Interface/DataMapAPI";

export class Constants {

    public readonly minFeeBattle: number = 1000;
    public readonly maxFeeBattle: number = 10000;
    ///
    public static readonly PLAYER_LAYER: number = 1 << 30;
    public static readonly BORDER_LAYER: number = 1 << 3;
    public static readonly WiSH_FEE: number = 5;
    public static TUTORIAL_CACTH_PET = "tutorialCatchPet";
    public static NOTICE_TRANSFER_DIAMOND = "dont_show_buy_notice";

    public static convertKeyOffice(positionTarget: OfficePosition): string {
        switch (positionTarget) {
            case OfficePosition.HANOI1:
                return "hn1";
            case OfficePosition.HANOI2:
                return "hn2";
            case OfficePosition.HANOI3:
                return "hn3";
            case OfficePosition.QUYNHON:
                return "qn";
            case OfficePosition.DANANG:
                return "dn";
            case OfficePosition.VINH:
                return "vinh";
            case OfficePosition.SAIGON:
            default:
                return "sg";
        }
    }

    public static convertNameRoom(officeTeleport: OfficePosition, roomTypeTeleport: RoomType): string {
        switch (roomTypeTeleport) {
            case RoomType.OFFICE:
                return `${this.convertKeyOffice(officeTeleport)}-office`;
            case RoomType.SHOP1:
            case RoomType.SHOP2:
                return `${this.convertKeyOffice(officeTeleport)}-shop1`;
            case RoomType.MEETING:
                return `${this.convertKeyOffice(officeTeleport)}-office-meeting-room1`;
            case RoomType.COMPLEXNCC:
            default:
                return this.convertKeyOffice(officeTeleport);
        }
    }

    public static convertNameOffice(positionTarget: OfficePosition): string {
        switch (positionTarget) {
            case OfficePosition.HANOI1:
                return "Hà Nội 1";
            case OfficePosition.HANOI2:
                return "Hà Nội 2";
            case OfficePosition.HANOI3:
                return "Hà Nội 3";
            case OfficePosition.QUYNHON:
                return "Quy Nhơn";
            case OfficePosition.DANANG:
                return "Đà Nẵng";
            case OfficePosition.VINH:
                return "Vinh";
            case OfficePosition.SAIGON:
            default:
                return "Sài Gòn";
        }
    }

    public static GetMapData(office: OfficePosition): MapData {
        let mapData = ServerMapManager.Get.find(map => map.map_key == this.convertKeyOffice(office));
        return mapData == null ? ServerMapManager.Get[0] : mapData;
    }

    public static capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static waitUntil(condition: () => boolean): Promise<void> {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (condition()) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });
    }

    public static isNullOrWhiteSpace(input: string | null | undefined): boolean {
        return !input || input.trim().length === 0;
    }

    public static async waitForSeconds(seconds: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => resolve(), seconds * 1000);
        });
    }
}


