export enum PlantState {
  NONE = 0,
  SEED = 1,
  SMALL = 2,
  GROWING = 3,
  HARVESTABLE = 4
}

export class PlantData {
  id: string;
  plant_id: string;
  plant_name: string;
  planted_by: string;
  grow_time: number;
  grow_time_remain: number;
  stage: PlantState;
  can_harvest: boolean;
  need_water: boolean;
  has_bug: boolean;
  harvest_at: Date | null;
}

export interface FarmSlotDTO {
  id: string;
  slot_index: number;
  currentPlant: PlantData;
}

export interface PlantDataDTO {
  id: string;
  name: string;
  grow_time: number;
  harvest_point: number;
  buy_price: PlantState;
  description: boolean;
}

export interface ClanWarehouseSlotDTO {
  id: string;
  farm_id: string;
  plant_id: string;
  quantity: number;
  is_harvested: boolean;
  purchased_by: string;
  plant?: PlantDataDTO;
}

export interface FarmDTO {
  farm_id: string;
  slots: FarmSlotDTO[];
  warehouseSlots: ClanWarehouseSlotDTO[];
}

export interface FarmPDTO {
  farm_id: string;
  slots: FarmSlotDTO[];
  warehouseSlots: ClanWarehouseSlotDTO[];
}

export interface PlantToSlotPayload {
  farm_slot_id: string;
  plant_id?: string;
}

export interface HarvestCountDTO {
  harvest_count: number;
  harvest_count_use: number;
  harvest_interrupt_count: number;
  harvest_interrupt_count_use: number;
}

export enum SlotActionType {
  Water = 'water',
  CatchBug = 'catch_bug',
  Harvest = 'harvest',
}

