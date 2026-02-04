import { InventoryDTO, PurchaseMethod } from "../Model/Item";
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
    clan_role: string | null;
    isPetTutorialCompleted : boolean = false;
    isPlantTutorialCompleted : boolean = false;
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
    weekly_score: number;
    fund: number;
    description: string | null;
    member_count?: number;
    max_members?: number;

    leader?: UserClan | null;
    vice_leaders?: UserClan[] | null;

    //temp
    join_status?: ClanStatus;
    rank?: number;
    avatar_url?: string;
    funds: ClanFund[];
}

export interface ClanFund {
    id: string;
    clan_id: string;
    type: string;
    amount: number;
}

export class UserClan {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    gender: string | null;
    clan_role: string | null;
    total_score?: number | null;
    weekly_score?: number | null;
    rank: number | null;
}


export enum ClanStatus {
    NONE = "none",
    PENDING = "pending",
    REJECTED = "rejected",
    APPROVED = "approved",
    CANCELLED = 'cancel',
}

export class PageInfo {
    page: number;
    size: number;
    total: number;
    total_page: number;
    has_previous_page: boolean;
    has_next_page: boolean;
}

export class ClansResponseDTO {
    result: ClansData[];
    pageInfo: PageInfo;
}

export class MemberResponseDTO {
    result: UserClan[];
    pageInfo: PageInfo;
}

export interface ClanContributorDTO {
  user_id: string;
  username: string;
  type: string;
  total_amount: string;
  clan_role: string | null;
  avatar_url?: string;
  rank?: number;
}

export interface ClanContributorsResponseDTO {
  result: ClanContributorDTO[];
  pageInfo: PageInfo;
}

export enum MemberAction {
    ACCEPT = 'accept',
    REJECT = 'reject',
}

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}

export enum SortBy {
    CREATED_AT = "created_at",
    USERNAME = "username",
    TOTAL_AMOUNT = "total_amount"
}

export enum ScoreType {
  TOTAL = 'total',
  WEEKLY = 'weekly',
  ALL = 'all',
}

export class ClanFundPayload {
    clanId: string;
    type: string;
    amount: number;
}

export interface ClanFundItemDTO {
    type: string;
    amount: number;
    spent_amount:number
}

export interface ClanFundResponseDTO {
    clan_id: string;
    funds: ClanFundItemDTO[];
}

export interface RemoveMembersPayload {
    targetUserIds: string[];
}

export class ClanDescriptionDTO {
    description: string;
}

export class MemberClanRequestDTO {
  id: string;
  status: ClanStatus;
  created_at: string;
  user: User;
  clan?: ClansData;
}

export class ClanRequestResponseDTO {
  result: MemberClanRequestDTO[];
  pageInfo: PageInfo;
}

export enum ClanRole {
  LEADER = 'leader',
  VICE_LEADER = 'vice_leader',
  MEMBER = 'member',
}

export class ClanActivityItemDTO {
  userName: string;
  actionType: string;
  itemName?: string;
  quantity?: number;
  amount?: number;
  time: string;
  createdAt: string;
  officeName?: string; 
}

export class ClanActivityResponseDTO {
    result: ClanActivityItemDTO[];
    pageInfo: PageInfo;
}

export enum ClanActivityActionType {
    HARVEST = 'harvest',
    HARVEST_INTRUDER = 'harvest_intruder',
    HARVESTED_OTHER_FARM = 'harvest_other_farm',
    PURCHASE = 'purchase',
    FUND = 'fund',
    JOIN = 'join',
    LEAVE = 'leave',
    WEEKLY_RANKING_MEMBER_1 = 'weekly_ranking_member_1',
    WEEKLY_RANKING_MEMBER_2 = 'weekly_ranking_member_2',
    WEEKLY_RANKING_MEMBER_3 = 'weekly_ranking_member_3',
    WEEKLY_RANKING_MEMBER_TOP_10 = 'weekly_ranking_member_top_10',

    WEEKLY_RANKING_CLAN_1 = 'weekly_ranking_clan_1',
    WEEKLY_RANKING_CLAN_2 = 'weekly_ranking_clan_2',
    WEEKLY_RANKING_CLAN_3 = 'weekly_ranking_clan_3',
}

export interface RequestToJoinDTO {
  canRequestAt?: string;
  request?: MemberClanRequestDTO;
}

export interface AssignViceLeadersDto {
  targetUserIds: string[];
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
