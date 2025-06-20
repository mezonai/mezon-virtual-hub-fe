import { _decorator, Component, director, Node, randomRangeInt } from 'cc';
import { APIManager } from './APIManager';
import APIConstant, { APIConfig, EVENT_NAME } from './APIConstant';
import UIPopup from '../ui/UI_Popup';
import ConvetData from '../core/ConvertData';
import { UserMeManager } from '../core/UserMeManager';
import { MapData } from '../Interface/DataMapAPI';
import { ServerManager } from '../core/ServerManager';
const { ccclass, property } = _decorator;

@ccclass("WebRequestManager")
export class WebRequestManager extends Component {
    private static _instance: WebRequestManager = null;

    @property({ type: UIPopup }) noticePanel: UIPopup = null;
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
        APIManager.getData(this.combineWithSlash(APIConstant.ANIMAL, mapCode), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMyPetData(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.ANIMAL), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getRewardsSpin(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.GAME, APIConstant.SPIN), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public async GetMapInfo(): Promise<MapData[]> {
        return new Promise((resolve, reject) => {
            this.toggleLoading(true);
            APIManager.getData("map", (data: any) => {
                console.log("Map: " + JSON.stringify(data, null, 2))
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

    public login(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.AUTH, APIConstant.LOGIN), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getUserProfile(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.USER), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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
        APIManager.putData(this.combineWithSlash(APIConstant.GAME_EVENT,eventId,APIConstant.COMPLETE), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public updateListPetFollowUser(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.ANIMAL, APIConstant.BRING), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllItemFood(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.FOOD), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postBuyFood(foodId, quantity, type, successCallback, errorCallback) {
        const url = `${APIConstant.INVENTORY}/${APIConstant.BUY}/${foodId}?quantity=${quantity}&type=${type}`;
        APIManager.postData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public createPet(data,successCallback, errorCallback) {
        APIManager.postData(APIConstant.ANIMAL, data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public deletePet(foodId,successCallback, errorCallback) {
         const url = `${APIConstant.ANIMAL}/${foodId}`;
        APIManager.deleteData(url, {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postGetReward(successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.GAME, APIConstant.INITIAL_REWARD), {}, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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
            if (this.errorMessageMap.has(json.code)) {
                json.error_message = this.errorMessageMap.get(json.code) || '';

            }
        }
        catch (e) {
            console.log(e);
        }

        this.noticePanel.showOkPopup(null, json.error_message, () => {
            APIConfig.token = "";
            if (ServerManager.instance?.Room) {
                ServerManager.instance.Room.leave();
            }
            director.emit(EVENT_NAME.RELOAD_SCENE);
            director.loadScene("GameMap");
        }, "Refresh");
        onError(json);
    }
}