import { RewardItemDTO } from "./Item";

export interface MissionDTO {
    id: string;
    name: string;
    description: string;
    frequency: MissionType;
    progress: number;
    total_progress: number;
    is_completed: boolean;
    is_claimed: boolean;
    type: MissionType;
    rewards: RewardItemDTO[];
}

export interface MissionListDTO {
    daily: MissionDTO[];
    weekly: MissionDTO[];
}

export enum MissionType {
    DAILY = 'Daily',
    WEEKLY = 'Weekly',
}