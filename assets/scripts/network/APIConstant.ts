export default class APIConstant {
    static CONFIG: string = "config";
    static GAME_CONFIG: string = "game-config";
    static USER: string = "user";
    static LOGIN: string = "mezon-login";
    static AUTH: string = "auth";
    static MAP: string = "map";
    static INVENTORY: string = "inventory";
    static BUY = "buy";
    static ITEM = "item";
    static SPIN = "spin";
    static GAME = "game";
    static GAME_EVENT = "game-event";
    static CURRENT = "current";
    static COMPLETE = "complete"
    static PET_PLAYERS = "pet-players";
    static BRING = "bring-pets";
    static BATTLE_PET = "battle-slots";
    static FOOD = "food";
    static INITIAL_REWARD = "initial-reward";
    static REWARD_PERCENT = "reward-percent";
    static BATTLE_SKILLS = "battle-skills";
    static BATTLE = "battle";
    static PLAYER_QUESTS = "player-quests";
    static NEWBIE_LOGIN = "newbie-login";
    static FINISH_QUEST = "finish-quest";
}

export class APIConfig {
    static token: string = "";
    static apiPath: string = "";
    static websocketPath: string = "";
    static mezon_app_id: string = "";
    static recive_token_botid: string = "";
}

export class EVENT_NAME {
    static ON_PAUSE_GAME = "ON_PAUSE_GAME";
    static ON_RESUME_GAME = "ON_RESUME_GAME";
    static ON_CHANGE_TAB = "ON_CHANGE_TAB";
    static ON_ITEM_CLICK = "ON_ITEM_CLICK";
    static ON_FOOD_CLICK = "ON_ITEM_CLICK";
    static RESET = "RESET";
    static UPDATE_INFO_PROFILE = "UPDATE_INFO_PROFILE";
    static ON_BUY_TOKEN = "ON_BUY_TOKEN";
    static ON_WITHDRAW_TOKEN = "ON_WITHDRAW_TOKEN";
    static ON_CHANGE_DIAMOND_TO_COIN = "ON_CHANGE_DIAMOND_TO_COIN";
    static ON_OFFICE_SCENE_LOADED = "ON_OFFICE_SCENE_LOADED";
    static RELOAD_SCENE = "RELOAD_SCENE";
    static ON_PLAYER_ADDED = "ON_PLAYER_ADDED";
    static ON_SEND_GAME_COIN = "ON_SEND_GAME_COIN";
    static ON_QUIZ = "ON_QUIZ";
    static ON_QUIZ_ANSWER = "ON_QUIZ_ANSWER";
    static ON_SFX_VOLUMN_CHANGE = "ON_SFX_VOLUMN_CHANGE";
    static PREVENT_OUT_MAP = "PREVENT_OUT_MAP";
    static BACK_TO_NORMAL = "BACK_TO_NORMAL";
    static CANVAS_RESIZE = "CANVAS_RESIZE";
    static ON_TOUCH_PET = "ON_QUIZ_ANSWER";
}
