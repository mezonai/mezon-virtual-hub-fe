export default class APIConstant {
    static CONFIG: string = "config";
    static GAME_CONFIG: string = "game-config";
    static USER: string = "users";
    static LOGIN: string = "login";
}

export class APIConfig {
    static token: string = "";
    static apiPath: string = ""; 
    static websocketPath: string = "";
}

export class EVENT_NAME {
    static ON_PAUSE_GAME = "ON_PAUSE_GAME";
    static ON_RESUME_GAME = "ON_RESUME_GAME";
}
