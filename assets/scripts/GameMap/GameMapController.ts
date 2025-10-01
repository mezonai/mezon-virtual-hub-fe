import { _decorator, Component, Node, Vec3, tween, game, director, Label, Tween, randomRangeInt } from 'cc';
import { Office } from "./Office";
import { SceneManagerController } from '../utilities/SceneManagerController';
import { SceneName } from '../utilities/SceneName';
import { WebRequestManager } from '../network/WebRequestManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { AnimationController } from '../gameplay/player/AnimationController';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { MapData, UserDataResponse } from '../Interface/DataMapAPI';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { OfficeSenenParameter } from './OfficeScene/OfficeSenenParameter';
import { RoomType } from './RoomType';
import { OfficePosition } from './OfficePosition';
import { Constants } from '../utilities/Constants';
import { ServerMapManager } from '../core/ServerMapManager';
const { ccclass, property } = _decorator;

@ccclass('GameMapController')
export class GameMapController extends Component {
    private static _instance: GameMapController = null;
    public static get instance(): GameMapController {
        return this._instance
    }

    @property({ type: RandomlyMover }) planeNotice: RandomlyMover = null;
    @property(Node) target: Node = null;
    @property(Office) offices: Office[] = [];
    @property({ type: Node }) playerNode: Node = null;
    private _playerSkin: AnimationEventController = null;
    private _playerAnim: AnimationController = null;

    private get playerSkin() {
        if (!this._playerSkin) {
            this._playerSkin = this.getComponentInChildren(AnimationEventController);
        }

        return this._playerSkin;
    }

    private get playerAnim() {
        if (!this._playerAnim) {
            this._playerAnim = this.getComponentInChildren(AnimationController);
        }

        return this._playerAnim;
    }

    /////Bubble Chat
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    private currentOffice: Office = null;
    public isBackMap: boolean = false;

    onLoad() {
        if (GameMapController._instance == null) {
            GameMapController._instance = this;
        }

        director.addPersistRootNode(this.target);
    }

    protected start(): void {
        this.playerNode.active = false;

        game.on(EVENT_NAME.ON_OFFICE_SCENE_LOADED, () => {
            this.onSceneLoaded();
        })
    }

    private async onSceneLoaded() {
        await this.waitForPlayerMove();

        game.off(EVENT_NAME.ON_OFFICE_SCENE_LOADED);
        director.removePersistRootNode(this.target);
        this.target.destroy();
    }

    protected onDestroy(): void {
        GameMapController._instance = null;
    }

    public onClickGoToNextOffice(office: Office) {
        if (office.officeBrach === OfficePosition.NONE) {
            Constants.showConfirm("Văn phòng đang chưa có sẵn", "Thông báo");
            return;
        }

        this.updateUserDataUserClient(office);
    }

    private async updateUserDataUserClient(office: Office) {
        let userMe = UserMeManager.Get;
        let userData = {
            "map_id": office.map.id,
            "position_x": null,
            "position_y": null,
            "display_name": userMe.user.display_name != "" ? userMe.user.display_name : userMe.user.username,
            "gender": userMe.user.gender,
            "skin_set": UserMeManager.Get.user.skin_set
        }
        WebRequestManager.instance.updateProfile(
            userData,
            (response) => this.onUpdateDataSuccess(response, office),
            (error) => this.onError(error)
        );
    }

    private async onUpdateDataSuccess(respone, office: Office) {
        this.SetMapUserChoosen(office);
        const officeParam = new OfficeSenenParameter(office.officeBrach, RoomType.NONE, RoomType.COMPLEXNCC, Constants.convertNameRoom(office.officeBrach, RoomType.COMPLEXNCC));
        if (this.currentOffice.region == office.region) {
            if (this.currentOffice.mapKey == office.mapKey) {
                this.waitForMove = false;
            }
            else {
                this.playerWalkToPosition(office.officePoint.worldPosition.clone());
            }
        }
        else {
            let startPoint: Node = this.currentOffice.officePoint;
            let endNode: Node = office.officePoint;
            this.spawnAndMove(startPoint.worldPosition, endNode.worldPosition);
        }

        this.currentOffice = office;
        SceneManagerController.loadScene(SceneName.SCENE_OFFICE, officeParam);
    }

    private waitForMove = false;
    private playerWalkToPosition(target: Vec3) {
        this.bubbleChat.active = false;
        this.playerAnim.play("move");
        this.waitForMove = true;
        this.playerNode.scale = new Vec3(
            target.x > this.playerNode.worldPosition.x ? this.playerNode.scale.x : -this.playerNode.scale.x,
            this.playerNode.scale.y,
            this.playerNode.scale.z);

        tween(this.playerNode)
            .to(1, { worldPosition: target })
            .call(() => {
                this.waitForMove = false;
            })
            .start()
    }

    private async waitForPlayerMove(interval: number = 100): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (!this.waitForMove) {
                    resolve();
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    private onError(error: any) {
        console.error("Error occurred:", error);

        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }

    async spawnAndMove(start: Vec3, end: Vec3) {
        this.playerNode.active = false;
        this.planeNotice.node.worldPosition = start.clone();
        this.waitForMove = true;
        await this.runTween(end);
        this.waitForMove = false;
    }

    runTween(position: Vec3): Promise<void> {
        return new Promise(resolve => {
            this.planeNotice.moveToTargetWorld(position, false, 60, () => {
                resolve();
            })
        });
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private SetMapUserChoosen(office: Office) {
        UserMeManager.SetMap = office.map;
    }


    private async LoadMapUI(userme: UserDataResponse, maps: MapData[]): Promise<void> {
        this.planeNotice.node.parent.active = false;
        try {
            if (maps == null || this.offices == null || this.offices.length <= 0) return;
            this.offices.map((office) => {
                let mapData = maps.find((map) => map.map_key == office.mapKey);
                if (mapData) office.setData(mapData, this);
            });
        } catch (error) {
            console.error("Failed to load maps:", error);
        }
        if (this.offices.length > 0) {
            if (!userme.map || !userme.map.map_key) {
                this.currentOffice = this.offices[0];
                return;
            }
            let officeAt = this.offices.find((office) => {
                return office.mapKey == userme.map.map_key
            });
            this.currentOffice = officeAt ?? this.offices[0];

            if (LoadBundleController.instance) {
                this.playerNode.active = true;
                this.playerNode.worldPosition = this.currentOffice.officePoint.worldPosition.clone();

                this.playerChat([]);
            }
        }
    }

    private playerChat(content: string[], isAutoShrink: boolean = true) {
        if (content.length == 0) {
            content = [
                "Đại ca muốn đi đâu?",
                "Hey!!!"
            ]
        }

        this.zoomBubbleChat(content[randomRangeInt(0, content.length)], isAutoShrink);
        this.playerSkin.init([]);
    }

    public async CheckLoadMap(autoLoadMap) {
        await this.LoadDataMapServer();
        if (autoLoadMap && UserMeManager.Get.map && this.offices && this.offices.length > 0) {
            let officeLoad = this.offices.find(office => office.mapKey == UserMeManager.Get.map.map_key);
            if (officeLoad) {
                if (this.planeNotice.IsInSideMap) {
                    this.planeNotice.node.parent.active = true;
                    this.planeNotice.node.active = true;
                    this.planeNotice.moveToTargetWorld(officeLoad.officePoint.getWorldPosition(), false, 60, () => {
                        this.playerNode.active = true;
                        this.playerNode.worldPosition = officeLoad.officePoint.worldPosition.clone();
                        this.playerNode.scale = Vec3.ZERO;
                        tween(this.playerNode)
                            .to(0.2, { scale: Vec3.ONE })
                            .call(() => {
                                this.playerChat(["Hello"]);
                                setTimeout(() => {
                                    this.playerChat(["Chờ tí đang vào game"], false);
                                    const officeParam = new OfficeSenenParameter(officeLoad.officeBrach, RoomType.NONE, RoomType.NONE, UserMeManager.Get.map.map_key);
                                    SceneManagerController.loadScene(SceneName.SCENE_OFFICE, officeParam);
                                }, 500);
                            })
                            .start();
                    })
                }
                else {
                    const officeParam = new OfficeSenenParameter(officeLoad.officeBrach, RoomType.NONE, RoomType.NONE, UserMeManager.Get.map.map_key);
                    SceneManagerController.loadScene(SceneName.SCENE_OFFICE, officeParam);
                }
                return;
            }
            console.error("Failed Find map");
        }

        await this.LoadMapUI(UserMeManager.Get, ServerMapManager.Get);
    }

    public async LoadDataMapServer(timeout: number = 5000, interval: number = 100): Promise<MapData[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const maps = await WebRequestManager.instance.GetMapInfo();
                ServerMapManager.Set = maps;
                const startTime = Date.now();
                while (ServerMapManager.Get === null) {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error("⏳ Timeout: ServerMapManager vẫn chưa có dữ liệu!"));
                        return;
                    }
                    await new Promise(resolve => setTimeout(resolve, interval));
                }

                resolve(ServerMapManager.Get);
            } catch (error) {
                console.error("❌ LoadMaps Error:", error);
                reject(error);
            }
        });
    }

    public shrinkBubbleChat(timeShrink: number) {
        if (this.tweenAction) {
            this.tweenAction.stop();
        }

        this.tweenAction = tween(this.bubbleChat)
            .to(timeShrink, {
                scale: new Vec3(0, 1, 1),
            }, { easing: 'backIn' })
            .call(() => {
                this.tweenAction = null;
            })
            .start();
    }

    public zoomBubbleChat(contentChat: string, autoShrink: boolean = true) {
        this.bubbleChat.active = true;
        if (this.tweenAction) {
            this.tweenAction.stop();
        }

        if (this.hideTimeout !== null) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.bubbleChat.setScale(0, 1, 1);
        this.contentBubbleChat.string = contentChat;
        this.tweenAction = tween(this.bubbleChat)
            .to(0.5, {
                scale: new Vec3(1, 1, 1),
            }, { easing: 'backOut' })
            .start();

        if (autoShrink) {
            this.hideTimeout = setTimeout(() => {
                this.shrinkBubbleChat(0.5);
            }, 4000);
        }
    }
}


