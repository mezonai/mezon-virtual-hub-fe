import { _decorator, SpriteFrame } from "cc";
import { LocalItemDataConfig } from "./LocalItemConfig";
import { AnimalRarity, PetDTO, Species, Element } from "./PetDTO";
import { Enum } from "cc";
import { PlantDataDTO } from "../Farm/EnumPlant";

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
    public index?: number;
    public remainingQuantity?: number;
    public takenQuantity?: number;
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

export interface WeeklyRewardDTO {
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
    public plant?: PlantDataDTO;
    public type_item?: RewardType;
    public weight_point?: number;
    public rate?: number;
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

export class FragmentDTO {
    public species: Species;
    public recipeId : string;
    public fragmentItems: FragmentItemDTO[];
}

export class FragmentItemDTO {
    public id: string;
    public inventory_type: InventoryType;
    public equipped: boolean;
    public quantity: number;
    public index: number;
    public item: Item;
}

export interface FragmentExchangeResponseDTO {
    removed: Item[];
    reward: Item;
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
    PETFRAGMENT = 'pet_fragment',

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
    PETFRAGMENT = 'pet_fragment',
    PET = 'pet',
}

export enum InventoryType {
    ITEM = 'item',
    FOOD = 'food',
    FARMTOOL = 'farm_tool',
    PETFRAGMENT = 'pet_fragment',
}

export enum ToolCategory {
    HARVEST = 'harvest',
    GROWTH = 'growth',
    INTERRUPT = 'interrupt',
    LOCK = 'lock',
}

export enum ItemClanType {
  PLANT = 'plant',
  TOOL = 'farm_tool',
}

export enum InventoryClanType {
  PLANT = 'Plant',
  TOOLS = 'Tool',
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

export enum SlotWheelType {
    NORMAL_WHEEL = 'normal_wheel',
}

export enum QuestType {
    NEWBIE_LOGIN,
    NEWBIE_LOGIN_SPECIAL,
}

export interface RewardDisplayData {
    spriteFrame: SpriteFrame | null;
    name: string;
    rate: number;
    quantity: number;
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
    clanId?: string;
    itemId: string;
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

export class SpinResultDTO {
  wheel_type: string;
  rewards: RewardItemDTO[];
  user_balance: number;
}

export class WheelDTO {
  id: string;
  type: string;
  base_fee: number;
  slots: RewardItemDTO[];
}

export interface RecipeDTO {
  id: string;
  type: string; 
  item_id: string | null;
  pet_id: string | null;
  plant_id: string | null;

  item?: Item | null;
  pet?: PetDTO | null;
  plant?: PlantDataDTO | null;
  ingredients: IngredientDTO[];
}

export interface IngredientDTO {
  id: string;
  recipe_id: string;
  item_id: string | null;
  plant_id: string | null;
  gold: number;
  diamond: number;
  part: number;
  required_quantity: number;
  item?: Item | null;
  plant?: PlantDataDTO | null;
  current_quantity: number;
}

