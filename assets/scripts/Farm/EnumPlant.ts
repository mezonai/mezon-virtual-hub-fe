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

export interface WarehouseSlotDTO {
  id: string;
  farm_id: string;
  plant_id: string;
  quantity: number;
  is_harvested: boolean;
}

export interface FarmDTO {
  farm_id: string;
  slots: FarmSlotDTO[];
  warehouseSlots: WarehouseSlotDTO[];
}
