
export interface MissionDTO {
    id: string;
    name: string;
    description: string;
    frequency: MissionType;
    progress: number;
    total_progress: number;
    is_completed: boolean;
    isClaimed: boolean;
    type: MissionType;
    rewards: RewardDTO[];
}

export interface RewardDTO {
  id: string;
  name: string;
  description: string;
  type: string;
  items: RewardItem[];
}

export interface RewardItem {
  id: string;
  type: string;
  quantity: number;
  reward_id: string;
  item_id?: string | null;
  food_id?: string | null;
}

export interface MissionListDTO {
    daily: MissionDTO[];
    weekly: MissionDTO[];
}

export enum MissionType {
    DAILY = 'Daily',
    WEEKLY = 'Weekly',
}