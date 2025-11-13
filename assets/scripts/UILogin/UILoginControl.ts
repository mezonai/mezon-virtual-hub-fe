import { _decorator, Component, EditBox, Label, Node, Sprite, SpriteFrame, log, RichText, Toggle, ToggleContainer, Button, Prefab, resources, __private, JsonAsset, tween, Vec3, Input } from 'cc';
import { MezonAppEvent, MezonWebViewEvent } from '../../webview';
import { WebRequestManager } from '../network/WebRequestManager';
import { MezonDTO, UserDTO } from '../Model/Player';
import { APIConfig } from '../network/APIConstant';
import { ResourceManager } from '../core/ResourceManager';
import { GameMapController } from '../GameMap/GameMapController';
import { UserMeManager } from '../core/UserMeManager';
import { LocalItemConfig } from '../Model/LocalItemConfig';
import { Tutorial } from '../tutorial/Tutorial';
import { PopupSelectionMini, SelectionMiniParam } from '../PopUp/PopupSelectionMini';
import { PopupManager } from '../PopUp/PopupManager';
import { PetDTO } from '../Model/PetDTO';
import { Constants } from '../utilities/Constants';
import { sys } from 'cc';
import { LoadingManager } from '../PopUp/LoadingManager';
import { SceneManagerController } from '../utilities/SceneManagerController';
import { SceneName } from '../utilities/SceneName';

const { ccclass, property } = _decorator;

@ccclass('UILoginController')
export class UILoginControll extends Component {

    @property(RichText)
    usernameLabel: RichText = null;

    @property(RichText)
    genderLabel: RichText = null;

    @property(Node)
    loginPanel: Node = null;

    @property(Button)
    login_Btn: Button = null;

    @property(SpriteFrame)
    avatarSprites: SpriteFrame[] = [];

    @property(Sprite)
    avatarNode: Sprite = null;

    @property(Node)
    btnLeft: Node = null;

    @property(Node)
    btnRight: Node = null;

    @property(Node)
    btnLogin: Node = null;

    @property(Tutorial)
    tutorial: Tutorial = null;

    @property(GameMapController)
    gameMapController: GameMapController = null;

    private selectedCharacter: number = 0;

    private myMezonInfo: MezonDTO;

    private static _instance: UILoginControll;
    public static get instance() {
        return UILoginControll._instance;
    }

    public init() {
        if (APIConfig.token != "") {
            this.closePanel(false, false);
        }
        else {
            this.loadData();
            this.updateAvatar();
            this.login_Btn.interactable = false;

            this.btnLeft.on(Node.EventType.TOUCH_END, this.prevCharacter, this);
            this.btnRight.on(Node.EventType.TOUCH_END, this.nextCharacter, this);
            this.login_Btn.node.on('click', () => this.updateGender());
        }
    }

    private async loadData() {
        this.loginPanel.active = false;
        await this.loadLocalSkinConfig();
        await this.loadConfig();
        this.loginMezon();
    }

    private async loadConfig() {
        return new Promise<void>((resolve, reject) => {
            if (APIConfig.websocketPath != "") {
                resolve();
                return;
            }

            resources.load("config", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error("Failed to load config:", err);
                    reject();
                    return;
                }
                const config = jsonAsset.json;
                APIConfig.websocketPath = `${config.websocketDomain}:${config.websocketPort}`;
                APIConfig.apiPath = `${config.schema}://${config.apiDomain}:${config.apiPort}`;
                APIConfig.mezon_app_id = config.mezon_app_id;
                APIConfig.recive_token_botid = config.recive_token_botid;
                resolve();
            });
        })
    }

    private async loadLocalSkinConfig() {
        return new Promise<void>((resolve, reject) => {
            if (ResourceManager.instance.LocalSkinConfig != null) {
                resolve();
                return;
            }
            resources.load("itemSkinConfig", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error("Failed to load config:", err);
                    reject();
                    return;
                }
                const config = jsonAsset.json;
                ResourceManager.instance.LocalSkinConfig = config as LocalItemConfig;
                resolve();
            });
        })
    }

    private loginMezon() {
        if (window.Mezon) {
            const webView = window.Mezon.WebView;
            window.Mezon.WebView.postEvent(MezonWebViewEvent.Ping, {
                message: "Hello Mezon!"
            }, null);
            webView.onEvent(MezonAppEvent.CurrentUserInfo, this.handleCurrentUserInfo);
            webView.onEvent(MezonAppEvent.UserHashInfo, this.handleUserHashInfo);
        }
        else {
            let appData = "query_id=abOflweIXFgCSfZlNEjH7pXI&user=%7B%22id%22%3A%221831510401251020800%22%2C%22username%22%3A%22toan.nguyenthanh%22%2C%22display_name%22%3A%22toan.nguyenthanh%22%2C%22avatar_url%22%3A%22https%3A%2F%2Fcdn.mezon.vn%2F1779484504377790464%2F1840678703248445440%2F1831510401251020800%2F4371000005003.jpg%22%2C%22mezon_id%22%3A%22toan.nguyenthanh%40ncc.asia%22%7D&auth_date=1742783975&signature=ZWViZTM4YWExZmY4YzBiZDUxMjY5NmRhYWQ1ZTM0ODU4MjhjOTc0NTZjODU4MWUyYmMwNTQ4NDU1Yjk5MDA5MQ%3D%3D&hash=851b8cf3bab1c960c47fd4ab2b1d90fafbb9eef96aea419bb76600b29d0554ce";
            //let appData = "query_id=nc_MQN20O8mX90ud_04Irlxk&user=%7B%22id%22%3A%221838774373004087296%22%2C%22username%22%3A%22tam.canhlechi%22%2C%22display_name%22%3A%22tam.canhlechi%22%2C%22avatar_url%22%3A%22https%3A%2F%2Fcdn.mezon.vn%2F1779484504377790464%2F1833340253138587648%2F1838774373004087300%2F622_undefined461398087_2594678774067461_1520915077734667936_n.jpg%22%2C%22mezon_id%22%3A%22tam.canhlechi%40ncc.asia%22%7D&auth_date=1742551789&signature=NjYzYTc1MjYxM2M2NzBmNjNmNjRkOTUyNDI0NzQyZDk1ODZlMDFmZGRlNmEwNTdhODVmYTJkZjBhZWEyOWJlMg%3D%3D&hash=d9b1515435ebeccce5f3549c3383504282aa164d135828ec029c503721ecdd91";
            // let appData = "query_id=MqHtm6OFCCOL6569eLMbDiYJ&user=%7B%22id%22%3A%221833329094238932992%22%2C%22username%22%3A%22an.nguyentranthy%22%2C%22display_name%22%3A%22an.nguyentranthy%22%2C%22avatar_url%22%3A%22https%3A%2F%2Fcdn.mezon.vn%2F1779484504377790464%2F1840660683964813312%2F1833329094238933000%2F1739841664950_undefinedB612_20210211_164318_228.jpg%22%2C%22mezon_id%22%3A%22an.nguyentranthy%40ncc.asia%22%7D&auth_date=1742474029&signature=ZDMxZTYxOGNmNDRiNTYwMWMxM2E5ZGY1Yzg5OTRkODQwYTU5MWMxYjA4MzlmMGNlZjQ2MzFjYWY1ZmFkYmE0OQ%3D%3D&hash=9bb67b37acf3a64769d071d0433ebcff670f525b2c5d74e5ddf20ba2955f37cc";
            let loginData = {
                "web_app_data": appData,
            }
            WebRequestManager.instance.login(
                loginData,
                (response) => this.onLoginSuccess(response),
                (error) => this.onError(error)
            );
        }
    }

    private handleCurrentUserInfo = (type: string, data: any) => {
        this.onUsernameEntered(data.user.display_name);
        this.setInfo(data);

        window.Mezon.WebView.postEvent(MezonWebViewEvent.SendBotID,
            { appId: APIConfig.mezon_app_id },
            (response) => { }
        );
    };

    private handleUserHashInfo = (type: string, data: any) => {
        const loginData = {
            web_app_data: data.message.web_app_data
        };

        WebRequestManager.instance.login(
            loginData,
            (response) => this.onLoginSuccess(response),
            (error) => this.onError(error)
        );
    };


    private async onLoginSuccess(response: any) {
        if (!response) {
            console.log("Login Success: Response is null or undefined");
            return;
        }

        this.login_Btn.interactable = true;
        APIConfig.token = response.data.accessToken;
        LoadingManager.getInstance().openLoading();
        try {
            const getInfoSuccess = await WebRequestManager.instance.getUserProfileAsync();
            if (!getInfoSuccess) {
                await SceneManagerController.loadSceneAsync(SceneName.SCENE_GAME_MAP, null);
                return;
            }           
            const getDataMyPetSuccess = await WebRequestManager.instance.getMyPetAsync();
            if (!getDataMyPetSuccess) {
                await SceneManagerController.loadSceneAsync(SceneName.SCENE_GAME_MAP, null);
                return;
            }
            this.setUI();
        } catch {

        }
        finally {
            LoadingManager.getInstance().closeLoading();
        }

    }

    private setUI() {
        this.setDefaultSkinSet();

        if (UserMeManager.Get.user.gender == null) {// The firstTime login
            this.loginPanel.active = true;
            this.usernameLabel.string = UserMeManager.Get.user.username;
        }
        else {
            this.closePanel();
        }
    }

    private onError(error: any) {
        this.login_Btn.interactable = true;
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }


    private parseMezonDTO(data: any): MezonDTO {
        return {
            user: {
                id: data.user.id,
                username: data.user.username,
                display_name: data.user.display_name,
                avatar_url: data.user.avatar_url,
                lang_tag: data.user.lang_tag,
                metadata: typeof data.user.metadata === "string"
                    ? JSON.parse(data.user.metadata)
                    : data.user.metadata,
                google_id: data.user.google_id,
                online: data.user.online,
                edge_count: data.user.edge_count,
                create_time: data.user.create_time,
                update_time: data.user.update_time,
                dob: data.user.dob,
                gender: null,
                gold: data.user.gold
            },
            wallet: typeof data.wallet === "string"
                ? JSON.parse(data.wallet)
                : data.wallet,
            email: data.email,
            mezon_id: data.mezon_id,
            map: data.map
        };
    }

    private setInfo(currUserData: MezonDTO) {
        this.myMezonInfo = this.parseMezonDTO(currUserData);
        ResourceManager.instance.MezonUserData = this.myMezonInfo;
    }

    onUsernameEntered(username: string) {
        this.usernameLabel.string = "Name: " + username;
    }

    updateGender() {
        let genderMessage = "Giới tính sẽ không thể thay đổi."
        const param: SelectionMiniParam = {
            title: "Thông báo",
            content: genderMessage,
            textButtonLeft: "",
            textButtonRight: "",
            textButtonCenter: "Ok",
            onActionButtonCenter: () => {
                let data = {
                    "position_x": Constants.POSX_PLAYER_INIT,
                    "position_y": Constants.POSY_PLAYER_INIT,
                    "display_name": this.usernameLabel.string,
                    "gender": this.genderLabel.string.toLowerCase() == "nam" ? "male" : "female",
                    "skin_set": ResourceManager.instance.LocalSkinConfig.male.defaultSet
                }

                WebRequestManager.instance.updateProfile(data, (response) => this.onUpdateGender(response), (error) => this.onError(error));
                this.login_Btn.interactable = false;
            },
        };
        PopupManager.getInstance().openAnimPopup("PopupSelectionMini", PopupSelectionMini, param);
    }

    private onUpdateGender(respone) {
        UserMeManager.Get.user.display_name = this.usernameLabel.string;
        UserMeManager.Get.user.gender = this.genderLabel.string.toLowerCase() == "nam" ? "male" : "female";
        this.setDefaultSkinSet();
        this.closePanel(true, true);
    }

    private setDefaultSkinSet() {
        if (UserMeManager.Get.user.gender && UserMeManager.Get.user.skin_set == null) {
            if (UserMeManager.Get.user.gender.toLowerCase() == "male") {
                UserMeManager.Get.user.skin_set = ResourceManager.instance.LocalSkinConfig.male.defaultSet;
            }
            else {
                UserMeManager.Get.user.skin_set = ResourceManager.instance.LocalSkinConfig.female.defaultSet;
            }
        }
    }

    private closePanel(autoLoadMap: boolean = true, isFirstTime: boolean = false) {
        this.node.active = false;
        if (isFirstTime) {
            sys.localStorage.setItem(Constants.TUTORIAL_COMPLETE, false);
            this.tutorial.startTutorial();
            return;
        }
        this.gameMapController.CheckLoadMap(autoLoadMap);
    }

    updateAvatar() {
        tween(this.avatarNode.node)
            .to(0.1, { scale: new Vec3(0, 1, 1) })
            .call(() => {
                this.avatarNode.spriteFrame = this.avatarSprites[this.selectedCharacter];
                this.genderLabel.string = this.selectedCharacter === 1 ? "Nam" : "Nữ";
            })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    prevCharacter() {
        this.selectedCharacter = (this.selectedCharacter === 0) ? 1 : 0;
        this.updateAvatar();
    }

    nextCharacter() {
        this.selectedCharacter = (this.selectedCharacter === 0) ? 1 : 0;
        this.updateAvatar();
    }

}
