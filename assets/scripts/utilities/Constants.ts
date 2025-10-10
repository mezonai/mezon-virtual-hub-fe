import { Sprite } from "cc";
import { ServerMapManager } from "../core/ServerMapManager";
import { OfficePosition } from "../GameMap/OfficePosition";
import { RoomType } from "../GameMap/RoomType";
import { ClansData } from "../Interface/DataMapAPI";
import { FoodType, InventoryType, ItemType, RewardItemDTO, RewardType } from "../Model/Item";
import { ConfirmParam, ConfirmPopup } from "../PopUp/ConfirmPopup";
import { PopupManager } from "../PopUp/PopupManager";
import { RewardNewType } from "../PopUp/PopupReward";
import Utilities from "./Utilities";
import { assetManager } from "cc";
import { ImageAsset } from "cc";
import { Texture2D } from "cc";
import { SpriteFrame } from "cc";
import { Vec3 } from "cc";

export class Constants {

    public readonly minFeeBattle: number = 1000;
    public readonly maxFeeBattle: number = 10000;
    ///
    public static readonly PLAYER_LAYER: number = 1 << 30;
    public static readonly BORDER_LAYER: number = 1 << 3;
    public static readonly WiSH_FEE: number = 5;
    public static TUTORIAL_CACTH_PET = "tutorialCatchPet";
    public static NOTICE_TRANSFER_DIAMOND = "dont_show_buy_notice";
    public static SHOW_DAILY_QUEST_FIRST_DAY = "show_daily_quest_first_day";
    public static LAST_VISITED_CLAN ="last_visited_clan";
    public static TUTORIAL_COMPLETE:string ="tutorial_completed";
    public static POSX_PLAYER_INIT = 912;
    public static POSY_PLAYER_INIT = -261;

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

    private static readonly NAME_TO_KEY: Record<string, string> = {
        "Sai Gon": "sg",
        "Ha Noi 1": "hn1",
        "Ha Noi 2": "hn2",
        "Ha Noi3": "hn3",
        "Vinh": "vinh",
        "Quy Nhon": "qn",
        "Da Nang": "dn",
    };

    public static convertNameToKey(clanName: string): string {
        return this.NAME_TO_KEY[clanName];
    }

    public static rarityUpgradeMap: Record<string, string | null> = {
        common: "rare",
        rare: "epic",
        epic: "legendary",
        legendary: null,
    };

    public static GetMapData(office: OfficePosition): ClansData {
        let mapData = ServerMapManager.Get.find(map => map.name == this.convertKeyOffice(office));
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

    public static mapRewardType(item: RewardItemDTO): RewardNewType {
        switch (item.type) {
            case RewardType.GOLD:
                return RewardNewType.GOLD;
            case RewardType.DIAMOND:
                return RewardNewType.DIAMOND;
            case RewardType.FOOD:
                switch (item.food.type) {
                    case FoodType.NORMAL: return RewardNewType.NORMAL_FOOD;
                    case FoodType.PREMIUM: return RewardNewType.PREMIUM_FOOD;
                    case FoodType.ULTRA_PREMIUM: return RewardNewType.ULTRA_PREMIUM_FOOD;
                    default: return RewardNewType.NORMAL_FOOD;
                }
            default:
                return RewardNewType.GOLD; // fallback
        }
    }

    public static registCountDown(time: number, callbackCountDown: (timeText: string) => void, callBackDone?: () => void): number {
        callbackCountDown(Utilities.secondsToHMS(time));

        const id = setInterval(() => {
            time--;
            if (time < 0) {
                clearInterval(id);
                if (callBackDone) callBackDone();
                return;
            }
            callbackCountDown(Utilities.secondsToHMS(time));
        }, 1000);

        return id;
    }

    public static clearCountDown(id: number) {
        if (id) {
            clearInterval(id);
        }
    }
  
    private static _tabMap: Map<string, string> = new Map([
        [ItemType.HAIR, 'Tóc'],
        [ItemType.FACE, 'Mặt'],
        [ItemType.EYES, 'Mắt'],
        [ItemType.UPPER, 'Áo'],
        [ItemType.LOWER, 'Quần'],
        [ItemType.PET_FOOD, 'Thức ăn pet'],
        [ItemType.PET_CARD, "Thẻ pet"]
    ]);

    public static getTabItemMap(): Map<string, string> {
        return this._tabMap;
    }

    public static get getTabShop(): Map<string, string> {
        return this._tabMap;
    }
    public static tabTypeInventory: string[] = Array.from(this._tabMap.keys());
    public static getTabShopPet: Map<string, string> = new Map([
        [InventoryType.FOOD, 'Thức ăn pet'],
    ]);

    public static async showConfirm(message: string, title: string = "Thông báo") {
        const param: ConfirmParam = {
            message,
            title: title,
        };
        PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, param);
    }    

    public static loadAvatar(sprite: Sprite, url: string, scaleFactor: number = 62.13): void {
        if (!sprite || !url) return;

        assetManager.loadRemote(url, { ext: '.png' }, (err, imageAsset) => {
            if (err) {
                console.warn("[AvatarLoader] Failed to load image:", err);
                return;
            }

            if (!(imageAsset instanceof ImageAsset)) {
                console.warn("[AvatarLoader] Loaded asset is not an ImageAsset!");
                return;
            }

            const texture = new Texture2D();
            texture.image = imageAsset;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;

            let scaleValue = scaleFactor / spriteFrame.width;
            sprite.node.scale = new Vec3(scaleValue, scaleValue, scaleValue);
            sprite.spriteFrame = spriteFrame;
        });
    }

    public static readonly notEnoughGoldResponse = [
        "Bạn nghĩ mình có nhiều tiền thế ư?",
        "Bạn điền nhiều tiền quá rồi",
        "Có tâm nhưng không có tiền"
    ];

    public static readonly invalidGoldResponse = [
        "0đ, thiệc luôn???",
        "Số tiền phải lớn hơn 0",
        "Có tâm nhưng không có tiền"
    ];
    
}