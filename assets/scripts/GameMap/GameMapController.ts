import { _decorator, Component, Node, Vec3, tween, game, Label, Tween, randomRangeInt } from 'cc';
import { Office } from "./Office";
import { SceneManagerController } from '../utilities/SceneManagerController';
import { SceneName } from '../utilities/SceneName';
import { WebRequestManager } from '../network/WebRequestManager';
import { UserMeManager } from '../core/UserMeManager';
import { EVENT_NAME } from '../network/APIConstant';
import { AnimationEventController } from '../gameplay/player/AnimationEventController';
import { AnimationController } from '../gameplay/player/AnimationController';
import { LoadBundleController } from '../bundle/LoadBundleController';
import { ClansData, UserDataResponse } from '../Interface/DataMapAPI';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { OfficeSenenParameter } from './OfficeScene/OfficeSenenParameter';
import { RoomType } from './RoomType';
import { OfficePosition, Season } from './OfficePosition';
import { Constants } from '../utilities/Constants';
import { ServerMapManager } from '../core/ServerMapManager';
import { LoadingManager } from '../PopUp/LoadingManager';
import { Enum } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameMapController')
export class GameMapController extends Component {
    @property({ type: RandomlyMover }) planeNotice: RandomlyMover = null;
    @property(Node) target: Node = null;
    @property(Office) offices: Office[] = [];
    @property({ type: Node }) playerNode: Node = null;
    @property(AnimationEventController) private playerSkin: AnimationEventController = null;
    @property(AnimationController) private playerAnim: AnimationController = null;
    @property({ type: Enum(Season) }) season: Season = Season.NONE;
    /////Bubble Chat
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    private currentOffice: Office = null;
    public isBackMap: boolean = false;

    protected start(): void {
        Constants.season = this.season;
        this.playerNode.active = false;
    }

    public async onClickGoToNextOffice(office: Office) {
        if (office.officeBrach === OfficePosition.NONE) {
            Constants.showConfirm("Văn phòng đang chưa có sẵn", "Thông báo");
            return;
        }

        this.updateUserData(office);
    }

    private async updateUserData(office: Office) {
        let userMe = UserMeManager.Get;
        if (userMe == null) return;
        try {
            let userData = {
                "position_x": Constants.POSX_PLAYER_INIT,
                "position_y": Constants.POSY_PLAYER_INIT,
                "display_name": userMe.user.display_name != "" ? userMe.user.display_name : userMe.user.username,
                "gender": userMe.user.gender,
                "skin_set": UserMeManager.Get.user.skin_set
            }
            const success = await WebRequestManager.instance.updateProfileAsync(userData);
            if (!success) return;
            await this.playAnimMoveOffice(office);
            LoadingManager.getInstance().openLoading();
            await this.changeOffice(office);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu clan:", error);

        } finally {
            LoadingManager.getInstance().closeLoading();
        }
    }

    private async changeOffice(office: Office) {
        //this.SetMapUserChoosen(office); Temporarily disable clan update on office select — player may not have a clan yet.
        const officeParam = new OfficeSenenParameter(office.officeBrach, RoomType.NONE, RoomType.COMPLEXNCC, Constants.convertNameRoom(office.officeBrach, RoomType.COMPLEXNCC), office.clans.id);
        this.currentOffice = office;
        localStorage.setItem(Constants.LAST_VISITED_CLAN, office.mapKey);
        await SceneManagerController.loadSceneAsync(SceneName.SCENE_OFFICE, officeParam);
    }

    async playAnimMoveOffice(office: Office) {
        if (this.currentOffice.region == office.region) {
            if (this.currentOffice.clans.name == office.clans.name) {
                return;
            }
            await this.playerWalkToPosition(office.officePoint.worldPosition.clone());
            return;
        }
        let startPoint: Node = this.currentOffice.officePoint;
        let endNode: Node = office.officePoint;
        await this.spawnFlightAndMove(startPoint.worldPosition, endNode.worldPosition);
    }

    private playerWalkToPosition(target: Vec3): Promise<void> {
        return new Promise<void>((resolve) => {
            this.bubbleChat.active = false;
            this.playerAnim.play("move");

            // Đảo hướng nhân vật
            this.playerNode.scale = new Vec3(
                target.x > this.playerNode.worldPosition.x ? this.playerNode.scale.x : -this.playerNode.scale.x,
                this.playerNode.scale.y,
                this.playerNode.scale.z);

            // Bắt đầu tween di chuyển
            tween(this.playerNode)
                .to(1, { worldPosition: target })
                .call(() => {
                    resolve(); // ✅ Báo Promise hoàn thành
                })
                .start();
        });
    }

    async spawnFlightAndMove(start: Vec3, end: Vec3) {
        this.playerNode.active = false;
        this.planeNotice.node.worldPosition = start.clone();
        await this.runTween(end);
    }

    runTween(position: Vec3): Promise<void> {
        return new Promise(resolve => {
            this.planeNotice.moveToTargetWorld(position, false, 60, () => {
                resolve();
            })
        });
    }

    public async LoadMapUI(userme: UserDataResponse): Promise<void> {
        this.planeNotice.node.parent.active = false;
        if (!this.offices?.length) {
            this.reloadScene();
            return;
        }
        const clans = await WebRequestManager.instance.GetClanInfo();
        if (clans == null) {
            this.reloadScene();
            return;
        }
        ServerMapManager.Set = clans;
        try {
            for (const office of this.offices) {
                const clanData = clans.find(c => c.name === office.mapKey);
                if (clanData) office.setData(clanData, this.onClickGoToNextOffice.bind(this));
            }
            this.currentOffice = this.resolveTargetOffice(userme);

            if (LoadBundleController.instance) {
                this.playerNode.active = true;
                this.playerNode.worldPosition = this.currentOffice.officePoint.worldPosition.clone();
                this.playerChat([]);
            }
        } catch (error) {
            this.reloadScene();
            console.error("Failed to load maps:", error);
        }
    }

    private resolveTargetOffice(userme: UserDataResponse): Office {
        let targetOffice: Office | null = null;
        const savedKey = localStorage.getItem(Constants.LAST_VISITED_CLAN);
        const userClanName = userme.clan?.name ?? null;

        switch (true) {
            case !!savedKey && savedKey !== userClanName: {
                targetOffice = this.offices.find(o => o.mapKey === savedKey) ?? null;
                if (targetOffice) {
                    return targetOffice;
                }
            }

            case !!userClanName: {
                targetOffice = this.offices.find(o => o.mapKey === userClanName) ?? null;
                if (targetOffice) {
                    return targetOffice;
                }
            }
            default: {
                targetOffice = this.offices[0];
                return targetOffice;
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

    public async CheckLoadMap(autoLoadMap: boolean) {
        const userClan = UserMeManager.Get.clan;
        const hasOffices = this.offices && this.offices.length > 0;
        if (userClan && hasOffices && autoLoadMap) {
            const officeLoad = this.offices.find(o => o.mapKey === userClan.name);
            if (officeLoad) {
                this.handleAutoLoadOffice(officeLoad);
                localStorage.setItem(Constants.LAST_VISITED_CLAN, officeLoad.mapKey);
                return;
            }
        }
        await this.LoadMapUI(UserMeManager.Get);
    }

    private handleAutoLoadOffice(officeLoad: any) {
        const clanName = UserMeManager.Get.clan?.name;
        const officeParam = new OfficeSenenParameter(
            officeLoad.officeBrach,
            RoomType.NONE,
            RoomType.NONE,
            Constants.convertNameToKey(clanName),
            UserMeManager.Get.clan?.id
        );

        if (this.planeNotice.IsInSideMap) {
            this.planeNotice.node.parent.active = true;
            this.planeNotice.node.active = true;

            this.planeNotice.moveToTargetWorld(
                officeLoad.officePoint.getWorldPosition(),
                false,
                60,
                () => this.animatePlayerAndEnterOffice(officeLoad, officeParam)
            );
        } else {
            SceneManagerController.loadScene(SceneName.SCENE_OFFICE, officeParam);
        }
    }

    private animatePlayerAndEnterOffice(officeLoad: any, officeParam: OfficeSenenParameter) {
        this.playerNode.active = true;
        this.playerNode.worldPosition = officeLoad.officePoint.worldPosition.clone();
        this.playerNode.scale = Vec3.ZERO;

        tween(this.playerNode)
            .to(0.2, { scale: Vec3.ONE })
            .call(() => {
                this.playerChat(["Hello"]);
                setTimeout(() => {
                    this.playerChat(["Chờ tí đang vào game"], false);
                    SceneManagerController.loadScene(SceneName.SCENE_OFFICE, officeParam);
                }, 500);
            })
            .start();
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

    reloadScene() {
        SceneManagerController.loadScene(SceneName.SCENE_GAME_MAP, null);
    }
}


