import { _decorator, Component, director, Node, randomRangeInt } from 'cc';
import { APIManager } from './APIManager';
import APIConstant, { APIConfig, EVENT_NAME } from './APIConstant';
import ConvetData from '../core/ConvertData';
import { UserMeManager } from '../core/UserMeManager';
import { ClanContributorsResponseDTO, ClanDescriptionDTO as ClanDescriptionDTO, ClanFundResponseDTO, ClanRequestResponseDTO, ClansData, ClansResponseDTO, MemberResponseDTO, RemoveMembersPayload, SortBy, SortOrder, UserDataResponse } from '../Interface/DataMapAPI';
import { ServerManager } from '../core/ServerManager';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { PopupManager } from '../PopUp/PopupManager';
import { BuyItemPayload, InventoryDTO, Item, RewardItemDTO, RewardNewbieDTO, StatsConfigDTO } from '../Model/Item';
import { GameManager } from '../core/GameManager';
import { UpgradePetResponseDTO, PetDTO } from '../Model/PetDTO';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass("WebRequestManager")
export class WebRequestManager extends Component {
    private static _instance: WebRequestManager = null;
    @property({ type: Node }) loadingPanel: Node = null;

    public static get instance(): WebRequestManager {
        return WebRequestManager._instance
    }

    onLoad() {
        if (WebRequestManager._instance == null) {
            WebRequestManager._instance = this;
        }
    }

    protected onDestroy(): void {
        WebRequestManager._instance = null;
    }

    private combineWithSlash(...params: string[]): string {
        this.toggleLoading(true);
        return params.join('/');
    }

    public toggleLoading(show) {
        this.loadingPanel.active = show;
    }

    public async GetClanInfo(): Promise<ClansResponseDTO> {
        return new Promise((resolve, reject) => {
            this.toggleLoading(true);
            APIManager.getData(APIConstant.CLANS, (data: any) => {
                const clans: ClansResponseDTO = ConvetData.ConvertClans(data);
                this.toggleLoading(false);
                resolve(clans); // Trả về danh sách MapData
            },
                (error: string) => {
                    this.toggleLoading(false);
                    reject(error);
                },
                true
            );
        });
    }

    public async getRewardNewbieLoginAsync(): Promise<RewardNewbieDTO[]> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getNewbieReward(
                (response) => {
                    const rewardData = ConvetData.ConvertRewardNewbieList(response.data) ?? [];
                    const hasAvailableReward = rewardData.some(
                        (reward: RewardNewbieDTO) => !reward.is_claimed && reward.is_available
                    );

                    if (GameManager.instance) {
                        GameManager.instance.playerHubController.showNoticeDailyReward(hasAvailableReward);
                    }

                    resolve(rewardData);
                },
                (error) => {
                    resolve([]);
                }
            );
        });
    }

    public async claimRewardAsync(questId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.putRecievedReward(
                questId,
                async (response) => {
                    resolve(true);
                },
                (error) => {
                    resolve(false);
                }
            );
        });
    }

    public getMyPetAsync(): Promise<PetDTO[]> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getMyPetData(
                (response) => resolve(response.data),
                (error) => {
                    resolve([]);
                }
            );
        });
    }

    public checkUnclaimedQuest(): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getCheckUnclaimedQuest(
                (response) => {
                    if (response && response.data) {
                        if (GameManager.instance != null) {
                            GameManager.instance.playerHubController.onMissionNotice(response.data.has_unclaimed);
                        }
                    }
                    resolve();
                },
                (error) => {
                    resolve();
                }
            );
        });
    }

    public postGetRewardAsync(): Promise<RewardItemDTO[]> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postGetReward(
                (response) => {
                    const rewardData = ConvetData.ConvertReward(response.data.rewards) ?? [];
                    resolve(rewardData);
                },
                (error) => {
                    resolve([]);
                }
            );
        });
    }

    public getConfigRateAsync(): Promise<StatsConfigDTO> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getConfigRate(
                (response) => {
                    const statsConfigDTO = ConvetData.parseStatsConfigDTO(response.data);
                    resolve(statsConfigDTO);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getUserProfileAsync(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getUserProfile(
                (response) => {
                    resolve(true);
                },
                (error) => {
                    resolve(false);
                }
            );
        });
    }

    public postUpgradeStarPetAsync(data): Promise<UpgradePetResponseDTO> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postUpgradeStarPet(
                data,
                (response) => {
                    const result: UpgradePetResponseDTO = {
                        pet: ConvetData.ConvertPet(response.data.pet),
                        user_diamond: response.data.user_diamond,
                        success: response.data.success
                    };
                    resolve(result);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getItemTypeAsync(type: string): Promise<InventoryDTO[]> {
        return new Promise((resolve) => {
            WebRequestManager.instance.getItemType(
                type,
                (response) => {
                    const inventoryList = ConvetData.ConvertInventoryDTO(response.data);
                    resolve(inventoryList);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public postUpgradeRarityPetAsync(pet_player_id): Promise<UpgradePetResponseDTO> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postUpgradeRarityPet(
                pet_player_id,
                (response) => {
                    const result: UpgradePetResponseDTO = {
                        pet: ConvetData.ConvertPet(response.data.pet),
                        success: response.data.success
                    };
                    resolve(result);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getAllClansync(page: number = 1, search ?: string, sortby: SortBy = SortBy.CREATED_AT, sortOrder: SortOrder = SortOrder.DESC, limit: number = 30): Promise<ClansResponseDTO> {
        return new Promise((resolve) => {
            WebRequestManager.instance.getAllClan(
                page, sortby, sortOrder, limit,
                (response) => {
                    const clans = ConvetData.ConvertClans(response);
                    resolve(clans);
                },
                (error) => {
                    resolve(null);
                },
                search
            );
        });
    }

    public getAllClanRequestsync(page: number = 1, search ?: string, sortby: SortBy = SortBy.CREATED_AT, sortOrder: SortOrder = SortOrder.DESC, limit: number = 30): Promise<ClansResponseDTO> {
        return new Promise((resolve) => {
            WebRequestManager.instance.getAllClanRequest(
                page, sortby, sortOrder, limit,
                (response) => {
                    const clans = ConvetData.ConvertClans(response);
                    resolve(clans);
                },
                (error) => {
                    resolve(null);
                },
                search
            );
        });
    }

    public postJoinClanAsync(clanId: string): Promise<UserDataResponse> {
        return new Promise((resolve) => {
             WebRequestManager.instance.postJoinClan(
                clanId,
                (response) => {
                    resolve(response.data);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public postCancelJoinClanAsync(clanId: string): Promise<string> {
        return new Promise((resolve) => {
            WebRequestManager.instance.postCancelJoinClan(
                clanId,
                (response) => {
                    resolve(response.data);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public postLeaveClanAsync(clanId: string): Promise<UserDataResponse> {
        return new Promise((resolve) => {
             WebRequestManager.instance.postLeaveClan(
                clanId,
                (response) => {
                    UserMeManager.UpdateClanUser = response.data;
                    resolve(response.data);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getClanDetailAsync(clanId: string): Promise<ClansData> {
        return new Promise((resolve) => {
            WebRequestManager.instance.getClanDetail(
                clanId,
                (response) => {
                    const clanDetailData = ConvetData.ConvertClanDetail(response);
                    resolve(clanDetailData);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getClanFundAsync(clanId: string): Promise<ClanFundResponseDTO> {
        return new Promise((resolve) => {
            WebRequestManager.instance.GetClanFund(
                clanId,
                (response) => {
                    const clanFundData = ConvetData.convertClanFund(response);
                    resolve(clanFundData);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public postUpdateNoticeAsync(clanId: string, data: ClanDescriptionDTO): Promise<ClanDescriptionDTO> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postUpdateNoticeOffice(
                clanId,
                data,
                (response) => {
                   resolve({ description: response.data.description });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public getListMemberClanAsync(clanId: String, page: number = 1, search ?: string, sortOrder: SortOrder = SortOrder.DESC, sortby: SortBy = SortBy.USERNAME, limit: number = 30): Promise<MemberResponseDTO> {
        return new Promise((resolve, reject) => {
           WebRequestManager.instance.getListMemberClan(
                clanId, page, sortOrder, sortby,  limit,
                (response) => {
                    const clans = ConvetData.ConvertMemberClan(response);
                    resolve(clans);
                },
                (error) => {
                    resolve(null);
                },
                search
            );
        });
    }

   public GetClanFundContributorsAsync(clanId: String, page: number = 1, search ?: string, sortOrder: SortOrder = SortOrder.DESC, sortby: SortBy = SortBy.TOTAL_AMOUNT, limit: number = 30): Promise<ClanContributorsResponseDTO> {
        return new Promise((resolve, reject) => {
           WebRequestManager.instance.GetClanFundContributors(
                clanId, page, sortOrder, sortby,  limit,
                (response) => {
                    const clans = ConvetData.convertContributorsClan(response);
                    resolve(clans);
                },
                (error) => {
                    resolve(null);
                },
                search
            );
        });
    }

    public getListMemberClanPendingAsync(clanId: string, page: number = 1, search ?: string, sortby: SortBy = SortBy.CREATED_AT, sortOrder: SortOrder = SortOrder.DESC, limit: number = 30): Promise<ClanRequestResponseDTO> {
        return new Promise((resolve) => {
            WebRequestManager.instance.getListMemberClanPending(
                clanId, page, sortby, sortOrder, limit,
                (response) => {
                    const clanDetailData = ConvetData.ConvertClanRequests(response);
                    resolve(clanDetailData);
                },
                (error) => {
                    resolve(null);
                },
                search
            );
        });
    }
    
    public postApproveMembersAsync(clanId: string, target_user_id: string, is_approved: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.patchApproveMembers(
                clanId,
                target_user_id,
                is_approved,
                (response) => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public patchTransferLeaderShipAsync(clanId: string, target_user_id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.patchTransferLeaderShip(
                clanId,
                target_user_id,
                (response) => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public patchAssignViceLeaderAsync(clanId: string, target_user_id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.patchAssignViceLeader(
                clanId,
                target_user_id,
                (response) => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public patchRemoveViceLeaderAsync(clanId: string, target_user_id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.patchRemoveViceLeader(
                clanId,
                target_user_id,
                (response) => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public removeMemberAsync(clanId: string, target_user_id: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.removeMembers(
                clanId,
                target_user_id,
                (response) => {
                    resolve();
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    public getGameConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CONFIG, APIConstant.GAME_CONFIG), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getMapConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CLANS), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getAllItem(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.ITEM), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllPetData(mapCode, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PET_PLAYERS, mapCode), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postUpgradeStarPet(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.PET_PLAYERS, APIConstant.UPGRADE_STAR_PET), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postUpgradeRarityPet(pet_player_id, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.PET_PLAYERS, pet_player_id, APIConstant.UPGRADE_RARITY_PET), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMyPetData(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PET_PLAYERS), (data) => { UserMeManager.SetMyPets = data.data; this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getRewardsSpin(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME, APIConstant.SPIN), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getConfigRate(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME, APIConstant.CONFIG), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public login(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.AUTH, APIConstant.LOGIN), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getUserProfile(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.USER), (data) => {
            UserMeManager.Set = data.data;
            this.onSuccessHandler(data, successCallback, errorCallback);
        }
            , (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getItemType(type, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.INVENTORY, APIConstant.ITEM_TYPE, type), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateProfile(data, successCallback, errorCallback) {
        APIManager.putData(this.combineWithSlash(APIConstant.USER), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMissionEvent(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME_EVENT, APIConstant.CURRENT), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateCompletedMission(eventId, data, successCallback, errorCallback) {
        APIManager.putData(this.combineWithSlash(APIConstant.GAME_EVENT, eventId, APIConstant.COMPLETE), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMission(params: { page?: number; limit?: number; sort_by?: string; order?: 'ASC' | 'DESC' } = {}, successCallback?: (data: any) => void, errorCallback?: (error: any) => void) {
        const { page = 1, limit = 50, sort_by = 'start_at', order = 'ASC' } = params;
        const url = `${this.combineWithSlash(APIConstant.PLAYER_QUESTS, APIConstant.QUEST_FREQUENCY)}?page=${page}&limit=${limit}&sort_by=${sort_by}&order=${order}`;
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateListPetFollowUser(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.PET_PLAYERS, APIConstant.BRING), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateListPetBattleUser(data, successCallback, errorCallback) {
        APIManager.patchData(this.combineWithSlash(APIConstant.PET_PLAYERS, APIConstant.BATTLE_PET), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateSkillsPetBattleUser(petplayerId, data, successCallback, errorCallback) {
        const url = `${APIConstant.PET_PLAYERS}/${petplayerId}`;
        APIManager.putData(this.combineWithSlash(url, APIConstant.BATTLE_SKILLS), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllItemFood(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.FOOD), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postBuyItem(params: BuyItemPayload, successCallback, errorCallback) {
        const { itemId: itemId, quantity, type } = params;
        const url = `${APIConstant.INVENTORY}/${APIConstant.BUY}/${itemId}?quantity=${quantity}&type=${type}`;
        APIManager.postData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public createPet(data, successCallback, errorCallback) {
        APIManager.postData(APIConstant.PET_PLAYERS, data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public deletePet(foodId, successCallback, errorCallback) {
        const url = `${APIConstant.PET_PLAYERS}/${foodId}`;
        APIManager.deleteData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postGetReward(successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.GAME, APIConstant.INITIAL_REWARD), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getCheckUnclaimedQuest(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PLAYER_QUESTS, APIConstant.CHECK_UNCLAIMED_QUEST), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getNewbieReward(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PLAYER_QUESTS, APIConstant.NEWBIE_LOGIN), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public putRecievedReward(questId, successCallback, errorCallback) {
        const url = `${APIConstant.PLAYER_QUESTS}/${questId}/${APIConstant.FINISH_QUEST}`;
        APIManager.putData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    //Clan
    public getAllClan(page = 1,sortby: SortBy, sortOrder: SortOrder, limit = 30, successCallback, errorCallback, search?: string) {
        let  url = `${APIConstant.CLANS}?page=${page}&sort_by=${sortby.toString()}&order=${sortOrder.toString()}&limit=${limit}`;
        if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllClanRequest(page = 1,sortby: SortBy, sortOrder: SortOrder, limit = 30, successCallback, errorCallback, search?: string) {
        let  url = `${APIConstant.CLANS}/${APIConstant.CLAN_REQUESTS}?page=${page}&sort_by=${sortby.toString()}&order=${sortOrder.toString()}&limit=${limit}`;
        if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postJoinClan(clan_id, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.CLANS, clan_id, APIConstant.REQUEST_JOIN), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postCancelJoinClan(clan_id, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.CLANS, clan_id, APIConstant.CANCEL_JOIN), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }
    
    public postLeaveClan(clan_id, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.CLANS, clan_id, APIConstant.LEAVE), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getClanDetail(clan_id, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CLANS, clan_id), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postUpdateNoticeOffice(clan_id, data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.CLANS, clan_id, APIConstant.DESCRIPTION), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getListMemberClan(clan_id, page = 1, sortOrder: SortOrder, sortby: SortBy, limit = 30, successCallback, errorCallback, search?: string) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.USERS}?`;
        if (search && search.trim() !== "") {
            url += `search=${encodeURIComponent(search.trim())}&`;
        }
        url += `page=${page}&order=${sortOrder.toString()}&sort_by=${sortby.toString()}&limit=${limit}`;
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public GetClanFundContributors(clan_id, page = 1, sortOrder: SortOrder, sortby: SortBy, limit = 30, successCallback, errorCallback, search?: string) {
        let url = `${APIConstant.CLAN_FUNDS}/${clan_id}/${APIConstant.CONTRIBUTORS}?`;
        if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        url += `page=${page}&order=${sortOrder.toString()}&sort_by=${sortby.toString()}&limit=${limit}`;
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public GetClanFund(clan_id, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CLAN_FUNDS, clan_id), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getListMemberClanPending(clan_id, page = 1,sortby: SortBy, sortOrder: SortOrder, limit = 30, successCallback, errorCallback, search?: string) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.CLAN_REQUESTS}/${APIConstant.PENDING}?`;
        if (search && search.trim() !== "") {
            url += `&search=${encodeURIComponent(search.trim())}`;
        }
        url += `page=${page}&order=${sortOrder.toString()}&sort_by=${sortby.toString()}&limit=${limit}`;
        APIManager.getData(url, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public patchApproveMembers(clan_id, clan_request_id, is_approved, successCallback, errorCallback) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.CLAN_REQUESTS}/${clan_request_id}/${APIConstant.APPROVE}?is_approved=${is_approved}`;
        APIManager.patchData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public patchTransferLeaderShip (clan_id, target_user_id, successCallback, errorCallback) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.MEMBERS}/${target_user_id}/${APIConstant.TRANSFER_LEADERSHIP}`;
        APIManager.patchData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public patchAssignViceLeader (clan_id, target_user_id, successCallback, errorCallback) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.MEMBERS}/${target_user_id}/${APIConstant.ASSIGN_VICE_LEADER}`;
        APIManager.patchData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public patchRemoveViceLeader (clan_id, target_user_id, successCallback, errorCallback) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.MEMBERS}/${target_user_id}/${APIConstant.REMOVE_VICE_LEADER}`;
        APIManager.patchData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public removeMembers (clan_id, target_user_id: string[], successCallback, errorCallback) {
        let url = `${APIConstant.CLANS}/${clan_id}/${APIConstant.MEMBERS}`;
        const data: RemoveMembersPayload = { targetUserIds: target_user_id };
        APIManager.deleteData(url, data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    private errorMessageMap: Map<number, string> = new Map([
        [400, 'Bad Request'],
        [401, 'Unauthorized'],
        [403, 'Forbidden'],
        [404, 'Not Found'],
        [500, 'Internal Server Error'],
        [502, 'Bad Gateway'],
        [503, 'Service Unavailable'],
        [504, 'Gateway Timeout'],
        [5, "Wrong Username or Password"],
        [12, "Not Enough Coin"],
        [17, "Insufficient Resource"],
        [19, "Quest Not Completed"],
        [22, "Invalid Quest"],
        [24, "Quest Already Claimed"],
        [23, "Quest Not Completed"],
        [36, "Mission Not Completed"]
    ]);

    private unexpectedErrorMessage = [
        "Có lỗi rồi đại nhân, xin bình tĩnh!!!",
        "Có lỗi rồi, xấu hổ quá (┬┬﹏┬┬).",
        "Éc ô éc, không vào được game ＞︿＜."
    ]

    private onSuccessHandler(response, onSuccess: (response: string) => void, onError, needShowPopupWhenError: boolean = true) {
        this.toggleLoading(false);
        if (response.code < 400) {
            onSuccess(response);
        } else {
            if (needShowPopupWhenError) {
                this.onErrorHandler(JSON.stringify(response), onError);
            }
        }
    }

    private onSuccessHandlerGeneric<T>(
        response: any,
        onSuccess: (data: T) => void,
        onError: (error: string) => void,
        needShowPopupWhenError: boolean = true
    ) {
        if (!response.error_message) {
            onSuccess(response as T);
        } else {
            if (needShowPopupWhenError) {
                this.onErrorHandler(JSON.stringify(response), onError);
            }
        }
    }

    private onErrorHandler(response, onError) {
        console.error(response);
        this.toggleLoading(false);
        let json = {
            code: 400,
            error_message: this.unexpectedErrorMessage[randomRangeInt(0, this.unexpectedErrorMessage.length)]
        }
        try {
            json = JSON.parse(response);
            const errorCode = Number(json.code)
            if (this.errorMessageMap.has(errorCode)) {
                json.error_message = this.errorMessageMap.get(errorCode) || '';
            }

        }
        catch (e) {
            console.log(e);
        }

        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: json.error_message,
            textButtonLeft: "",
            textButtonRight: "",
            textButtonCenter: "Refresh",
            onActionButtonCenter: () => {
                APIConfig.token = "";
                if (ServerManager.instance?.Room) {
                    ServerManager.instance.Room.leave();
                }
                director.emit(EVENT_NAME.RELOAD_SCENE);
                director.loadScene("GameMap");
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
        onError(json);
    }
}