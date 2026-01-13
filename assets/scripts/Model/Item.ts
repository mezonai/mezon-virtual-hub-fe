import { _decorator, SpriteFrame } from "cc";
import { LocalItemDataConfig } from "./LocalItemConfig";
import { AnimalRarity, PetDTO, Species, Element } from "./PetDTO";
import { Enum } from "cc";

export class BaseInventoryDTO {

}

export class InventoryDTO extends BaseInventoryDTO {
    public id: string;
    public equipped: boolean = false;
    public quantity?: number;
    public item?: Item;
    public inventory_type: InventoryType;
    public food?: Food;
}

export class ItemDTO {
    public data: Item[];
}

export class Item extends BaseInventoryDTO {
    public id: string = "";
    public name: string = "";
    public gender?: string = "";
    public gold: number = 0;
    public type: ItemType = ItemType.HAIR;
    public iconSF?: SpriteFrame[] = [];
    public mappingLocalData?: LocalItemDataConfig = null;
    public item_code?: ItemCode;
    public rate?: number;
}

export class FoodDTO {
    public data: Food[];
}

export class Food extends BaseInventoryDTO {
    public id: string = "";
    public name: string;
    public type: FoodType;
    public purchase_method: PurchaseMethod;
    public price: number;
    public catch_rate_bonus: number;
    public description: string;
    public iconSF: SpriteFrame[] = [];
}

export class PetReward {
    public rarity: AnimalRarity;
    public id: string;
    public type: Element;
    public species: Species;
}

export interface WeeklyRewardDto {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  items: RewardItemDTO[];
}

export class RewardItemDTO {
    public id?: string;
    public type: RewardType;
    public item?: Item;
    public food?: Food;
    public pet?: PetReward;
    public quantity?: number;
}

export class RewardNewbieDTO {
    public id: string;
    public quest_id: string;
    public end_at: string;
    public name: string;
    public description?: string;
    public is_claimed: boolean;
    public is_available: boolean;
    public quest_type: QuestType;
    public rewards: RewardItemDTO[] = [];
}

export class EventRewardDTO {
    public rewards: RewardNewbieDTO[];
    public isShowFirstDay: boolean = false;
    public eventType: EventType;
}

export interface RewardResponse {
    rewards: RewardItemDTO[];
    user_gold: number;
}

export enum EventType {
    EVENT_LOGIN_PLANT = 'event_login_plant',
    EVENT_LOGIN_PET = 'event_login_pet',
    EVENT_LOGIN_CLAN = 'event_login_clan',
}

export enum RewardType {
    ITEM = 'item',
    GOLD = 'gold',
    DIAMOND = 'diamond',
    FOOD = 'food',
    PET = 'pet',
    PLANT = 'plant',

    WEEKLY_RANKING_MEMBER_1 = 'weekly_ranking_member_1',
    WEEKLY_RANKING_MEMBER_2 = 'weekly_ranking_member_2',
    WEEKLY_RANKING_MEMBER_3 = 'weekly_ranking_member_3',
    WEEKLY_RANKING_MEMBER_TOP_10 = 'weekly_ranking_member_top_10',
}

export enum ItemType {
    NULL = 'null',
    HAIR = 'hair',
    HAT = 'hat',
    FACE = 'face',
    EYES = 'eyes',
    UPPER = 'upper',
    LOWER = 'lower',
    GLASSES = 'glasses',
    PET_CARD = 'pet_card',
    PET_FOOD = 'pet_food',
    FARM_TOOL = 'farm_tool',
    FARM_PLANT = 'farm_plant',
}

export enum InventoryType {
    ITEM = 'item',
    FOOD = 'food',
}

export enum InventoryClanType {
  PLANT = 'plant',

  HARVEST_TOOL_1 = 'harvest_tool_1',
  HARVEST_TOOL_2 = 'harvest_tool_2',
  HARVEST_TOOL_3 = 'harvest_tool_3',
  HARVEST_TOOL_4 = 'harvest_tool_4',
  HARVEST_TOOL_5 = 'harvest_tool_5',

  GROWTH_PLANT_TOOL_1 = 'growth_plant_tool_1',
  GROWTH_PLANT_TOOL_2 = 'growth_plant_tool_2',
  GROWTH_PLANT_TOOL_3 = 'growth_plant_tool_3',
  GROWTH_PLANT_TOOL_4 = 'growth_plant_tool_4',
  GROWTH_PLANT_TOOL_5 = 'growth_plant_tool_5',

  INTERRUPT_HARVEST_TOOL_1 = 'interrupt_harvest_tool_1',
  INTERRUPT_HARVEST_TOOL_2 = 'interrupt_harvest_tool_2',
  INTERRUPT_HARVEST_TOOL_3 = 'interrupt_harvest_tool_3',
  INTERRUPT_HARVEST_TOOL_4 = 'interrupt_harvest_tool_4',
  INTERRUPT_HARVEST_TOOL_5 = 'interrupt_harvest_tool_5',
  
  LOCK_PLANT_TOOL = 'lock_plant_tool',
  LOCK_PICK_TOOL = 'lock_pick_tool',
}


export enum FoodType {
    NORMAL = 'normal',
    PREMIUM = 'premium',
    ULTRA_PREMIUM = 'ultra-premium',
}

export enum PurchaseMethod {
    GOLD = 'gold',
    DIAMOND = 'diamond',
    SLOT = 'slot',
}

export enum ItemGenderFilter {
    ALL = 'ALL',
    FEMALE = 'female',
    MALE = 'male',
    UNISEX = 'unisex'
}

export enum QuestType {
    NEWBIE_LOGIN,
    NEWBIE_LOGIN_SPECIAL,
}

export interface RewardDisplayData {
    spriteFrame: SpriteFrame | null;
    name: string;
    rate: number;
    isItem?: boolean;
}

export interface SpinRewardsFoodDTO {
    normal: number;
    premium: number;
    ultra: number;
}

export interface SpinRewardsPercentDTO {
    item: number;
    gold: number;
    food: SpinRewardsFoodDTO;
    none: number;
}

export interface SpinCostsDTO {
    spinGold: number;
    upgradeStarsDiamond: number;
}

export interface PercentConfigDTO {
    upgradeStars: Record<AnimalRarity, number>;
    upgradeRarity: Partial<Record<AnimalRarity, number>>;
    spinRewards: SpinRewardsPercentDTO;
}

export interface UpgradeStarsPercentDTO {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
}

export interface UpgradeRarityPercentDTO {
    rare: number;
    epic: number;
    legendary: number;
}

export interface StatsConfigDTO {
    costs: SpinCostsDTO;
    percentConfig: PercentConfigDTO;
    farmLimit: FarmLimitDTO;
}

export enum ItemCode {
    RARITY_CARD_RARE = 'rarity_card_rare',
    RARITY_CARD_EPIC = 'rarity_card_epic',
    RARITY_CARD_LEGENDARY = 'rarity_card_legendary',
}

export interface BuyItemPayload {
    clanId?: string | number;
    itemId: string | number;
    quantity: number;
    type: string;
}

export interface FarmLimitPlantDTO {
    enabledLimit: boolean;
    maxHarvest: number;
}

export interface FarmLimitHarvestDTO {
    enabledLimit: boolean;
    maxHarvest: number;
    maxInterrupt: number;
}

export interface FarmLimitDTO {
    plant: FarmLimitPlantDTO;
    harvest: FarmLimitHarvestDTO;
}
