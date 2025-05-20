import { InventoryDTO } from "../Model/Item";
import { PetDTO } from "../Model/PetDTO";

///////////////////////---------------------USER-----------------------------------------------------------
export class User {
    id: string;
    username: string;
    email: string | null;
    positionX: number | null;
    positionY: number | null;
    avatar_url: string| null;
    gold: number | null;
    diamond: number | null;
    gender: string | null;
    display_name: string | null;
    skin_set: string[] | null;
}

export class UserDataResponse {
    inited: boolean = false;
    user: User;
    inventories: InventoryDTO[];
    map: MapData | null;
    animals: PetDTO[];
}

export class UserProfileDTO {
    mapId: string;
    positionX: number;
    positionY: number;
    displayName: string;
    gender: string;
    skinSet: string[];
}

///////////////////////---------------------MAP-----------------------------------------------------------
export class MapData {
    id: string;
    name: string;
    map_key: string;
    isLocked: boolean;
}
///////////////////////---------------------Mission-----------------------------------------------------------
export class MissionEvent{
    id: string
    name: string;
    description: string;
    starttime: Date;
    end_time: Date;
    target_user: User;
    is_completed: boolean;
    completed_users: User[];
    max_completed_users: number;
}
