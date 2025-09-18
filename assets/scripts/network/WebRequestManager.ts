import { _decorator, Component, director, Node, randomRangeInt } from 'cc';
import { APIManager } from './APIManager';
import APIConstant, { APIConfig, EVENT_NAME } from './APIConstant';
import UIPopup from '../ui/UI_Popup';
import ConvetData from '../core/ConvertData';
import { UserMeManager } from '../core/UserMeManager';
import { MapData } from '../Interface/DataMapAPI';
import { ServerManager } from '../core/ServerManager';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { PopupManager } from '../PopUp/PopupManager';
import { RewardItemDTO, RewardNewbieDTO, RewardPecent } from '../Model/Item';
import { GameManager } from '../core/GameManager';
import { PetDTO } from '../Model/PetDTO';
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

    public async GetMapInfo(): Promise<MapData[]> {
        return new Promise((resolve, reject) => {
            this.toggleLoading(true);
            APIManager.getData("map", (data: any) => {
                const maps: MapData[] = ConvetData.ConvertMap(data);
                this.toggleLoading(false);
                resolve(maps); // Trả về danh sách MapData
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

    public getRewardsPercentAsync(): Promise<RewardPecent> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.getRewardsPercent(
                (response) => {
                    const rewardPercent = ConvetData.convertRewardsPercent(response.data);
                    console.log("rewardPercent ", rewardPercent);
                    resolve(rewardPercent);
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

    public postMergePetAsync(data): Promise<PetDTO> {
        return new Promise((resolve, reject) => {
            WebRequestManager.instance.postMergePet(
                data,
                (response) => {
                    const petMerge = ConvetData.ConvertPet(response.data);
                    console.log("petMerge ", petMerge);
                    resolve(petMerge);
                },
                (error) => {
                    resolve(null);
                }
            );
        });
    }

    public getGameConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CONFIG, APIConstant.GAME_CONFIG), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getMapConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.MAP), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getAllItem(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.ITEM), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllPetData(mapCode, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PET_PLAYERS, mapCode), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postMergePet(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.PET_PLAYERS, APIConstant.MERGE_PET), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMyPetData(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.PET_PLAYERS), (data) => { UserMeManager.SetMyPets = data.data; this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getRewardsSpin(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME, APIConstant.SPIN), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getRewardsPercent(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME, APIConstant.REWARD_PERCENT), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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

    public postBuySkin(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.INVENTORY, APIConstant.BUY, data), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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

    public postBuyFood(foodId, quantity, type, successCallback, errorCallback) {
        const url = `${APIConstant.INVENTORY}/${APIConstant.BUY}/${foodId}?quantity=${quantity}&type=${type}`;
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
        console.log("questId", questId);
        const url = `${APIConstant.PLAYER_QUESTS}/${questId}/${APIConstant.FINISH_QUEST}`;
        APIManager.putData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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