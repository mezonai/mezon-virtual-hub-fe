import { _decorator, SpriteFrame } from "cc";
import { LocalItemDataConfig } from "./LocalItemConfig";

export class BaseInventoryDTO {

}

export class InventoryDTO extends BaseInventoryDTO {
    public id: string;
    public equipped: boolean = false;
    public item: Item;
}

export class ItemDTO {
    public data: Item[];
}

export class Item extends BaseInventoryDTO{
    public id: string = "";
    public name: string = "";
    public gender: string = "";
    public gold: number = 0;
    public type: ItemType = ItemType.HAIR;
    public is_equippable: boolean = false;
    public is_static: boolean = false;
    public iconSF: SpriteFrame[] = [];
    public mappingLocalData: LocalItemDataConfig = null;
    public is_stackable: boolean = false;
}

export class RewardItemDTO {
    public type: RewardType;
    public item?: Item; 
    public quantity?: number;
    public amount?: number;
}

export interface RewardResponse {
    rewards: RewardItemDTO[];
    user_gold: number;
}

export enum RewardType {
    ITEM = 'item',
    GOLD = 'gold',
}

export enum ItemType {
    NULL = 0,
    HAIR = 1,
    HAT = 2,
    FACE = 3,
    EYES = 4,
    UPPER = 5,
    LOWER = 6,
    GLASSES = 7,
    PET_BAIT = 8,
    PET_FOOD = 9
}