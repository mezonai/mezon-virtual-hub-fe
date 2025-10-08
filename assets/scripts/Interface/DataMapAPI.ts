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
    clan: ClansData; // Before it was map but now changed to clan
    animals: PetDTO[];
}

export class UserProfileDTO {
    clanId: string;
    positionX: number;
    positionY: number;
    displayName: string;
    gender: string;
    skinSet: string[];
}

///////////////////////---------------------MAP-----------------------------------------------------------
export class ClansData {
    id: string;
    name: string;
    score: number;
    fund: number;
    member_count?: number;
    max_members?: number;
}
export class ClansPageInfo {
    page: number;
    size: number;
    total: number;
    total_page: number;
    has_previous_page: boolean;
    has_next_page: boolean;
}

export class ClansResponseDTO {
    result: ClansData[];
    pageInfo: ClansPageInfo;
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
