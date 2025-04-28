import { _decorator, Component, Node } from 'cc';
import { APIManager } from './APIManager';
import APIConstant from './APIConstant';
import UIPopup from '../ui/UI_Popup';
const { ccclass, property } = _decorator;

@ccclass("WebRequestManager")
export class WebRequestManager extends Component {
    private static _instance: WebRequestManager = null;
    private projectRoot = null;

    @property({ type: UIPopup }) errorPanel: UIPopup = null;
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

    public init(projectRoot) {
        this.projectRoot = projectRoot;
    }

    private combineWithSlash(...params: string[]): string {
        return params.join('/');
    }

    public getGameConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CONFIG, APIConstant.GAME_CONFIG), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getGameDataConfig(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.CONFIG, APIConstant.GAME_DATA_CONFIG), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public login(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.USER, APIConstant.LOGIN), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public loginPrivy(data, token, successCallback, errorCallback) {
        APIManager.postDataPrivy(this.combineWithSlash(APIConstant.USER, APIConstant.LOGIN_PRIVY), data, token, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); });
    }

    public loginTele(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.USER, APIConstant.LOGIN_TELE), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, false);
    }

    public getProfile(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.USER, APIConstant.PROFILE), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postEarnPoint(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.USER, APIConstant.EARN_POINT), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getLeaderBoardRank(rankName, pageSize, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.LEADER_BOARD, APIConstant.DAILY_POINT) + "?rank_name=" + rankName + "&page=1&size=" + pageSize, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getAllFriend(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.FRIEND, APIConstant.ALL), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getFriendGift(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.FRIEND, APIConstant.INVITE_GIFT), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postClaimFriendGift(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.FRIEND, APIConstant.CLAIM_GIFT), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getPowerUpInfos(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.POWERUP, APIConstant.INFOS), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postBuyPowerup(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.POWERUP, APIConstant.BUY), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postClaimDailyReward(successCallback, errorCallback) {
        let data = {}
        APIManager.postData(this.combineWithSlash(APIConstant.DAILY_LOGIN, APIConstant.CLAIM), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postFinishTutorial(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.TUTORIAL, APIConstant.UPDATE), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postClaimBasicQuest(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.QUEST, APIConstant.CLAIM_BASIC), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postClaimDailyQuest(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.QUEST, APIConstant.CLAIM_DAILY), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postClaimMission(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.QUEST, APIConstant.CLAIM_MISSION), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postPreTransaction(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.PRE_BUY_PRODUCT), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postPreCheckin(successCallback, errorCallback) {
        let data = {};
        APIManager.postData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.PRE_CHECK_IN), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getPendingTransaction(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.PENDING), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postVerifyTransaction(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.VERIFY), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postRefundTransaction(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.REFUND), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postSuccessFullPaymenTransaction(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.TRANSACTION, APIConstant.SUCCESSFULL_PAYMENT_CALLBACK), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postEquipCosmetic(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.COSMETIC, APIConstant.EQUIP), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getShopSkins(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.SHOP, APIConstant.SKINS), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postBuyShopSkins(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.SHOP, APIConstant.SKINS, APIConstant.BUY), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postEquipSkins(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.SKINS, APIConstant.EQUIP), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getInviteFriend(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.QUEST, APIConstant.INVITE_FRIEND), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getDailyReward(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.QUEST, APIConstant.DAILY_REWARD), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMission(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.QUEST, APIConstant.MISSION), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getShopPremium(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.SHOP, APIConstant.SKINS, APIConstant.PREMIUM), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getLeaderboardDistance(pageNum, pageSize, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.LEADER_BOARD, APIConstant.DISTANCE) + "?page=" + pageNum + "&size=" + pageSize, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getWeeklyLeaderboardDistance(pageNum, pageSize, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.LEADER_BOARD, APIConstant.WEEKLY_DISTANCE) + "?page=" + pageNum + "&size=" + pageSize, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getMapData(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.MATCH, APIConstant.START), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public getPatternData(gameSessionId, successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.MATCH, APIConstant.PATTERNS) + "?gameSessionId=" + gameSessionId, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postActionsHistoryEndGame(gameSessionId, data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.MATCH, APIConstant.END) + "?gameSessionId=" + gameSessionId, data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    // Animal

    public getAnimalInfos(successCallback, errorCallback) {
        APIManager.getData(this.combineWithSlash(APIConstant.ANIMAL, APIConstant.INFOS), (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
    }

    public postUpgradeAnimal(data, successCallback, errorCallback) {
        APIManager.postData(this.combineWithSlash(APIConstant.ANIMAL, APIConstant.UPGRADE), data, (data) => { this.onSuccessHandler(data, successCallback, errorCallback); }, (data) => { this.onErrorHandler(data, errorCallback); }, true);
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

    private onSuccessHandler(response, onSuccess: (response: string) => void, onError, needShowPopupWhenError: boolean = true) {
        if (!response.error_message) {
            onSuccess(response);
        } else {
            if (needShowPopupWhenError) {
                this.onErrorHandler(JSON.stringify(response), onError);
            }
        }
    }

    private onErrorHandler(response, onError) {
        console.log(response)
        let json = JSON.parse(response);
        if (this.errorMessageMap.has(json.error_code)) {
            json.error_message = this.errorMessageMap.get(json.error_code) || '';
            this.errorPanel.node.active = true;
            this.errorPanel.node.setSiblingIndex(this.errorPanel.node.parent.children.length - 1);
            if (json.error_code == 401) {
                this.errorPanel.showOkPopup("Warning", json.error_message, () => {
                    this.projectRoot.relogin();
                }, "Login Again?");
            }
            else {
                this.errorPanel.showOkPopup("Warning", json.error_message);
            }
        }

        onError(json);
    }
}