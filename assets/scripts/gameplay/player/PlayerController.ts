import { _decorator, CCFloat, Component, EventKeyboard, Input, input, KeyCode, Vec3, Node, BoxCollider2D, Contact2DType, CCString, tween, PhysicsSystem2D, Vec2, Graphics, RigidBody2D, ERigidBody2DType, EventTouch, find, misc, debug, Collider2D, IPhysics2DContact, Camera, RichText, Color, director, Tween, Label, sys, randomRangeInt, UITransform, randomRange } from 'cc';
const { ccclass, property } = _decorator;
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { MoveAbility } from './ability/MoveAbility';
import { AnimationEventController } from './AnimationEventController';
import { ResourceManager } from '../../core/ResourceManager';
import { UserMeManager } from '../../core/UserMeManager';
import { ObjectPoolManager } from '../../pooling/ObjectPoolManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { Item } from '../../Model/Item';
import { Tutorial } from '../../tutorial/Tutorial';
import { PlayerCameraController } from '../camera/PlayerCameraController';
import { P2PInteractManager } from './ability/P2PInteractManager';
import { AudioType, SoundManager } from '../../core/SoundManager';
import { GoKart } from '../MapItem/GoKart';
import { PetCatchingController } from './PetCatchingController';
import { AnimalController } from '../../animal/AnimalController';

@ccclass('PlayerController')
export class PlayerController extends Component {
    private room: Colyseus.Room<any>;
    @property({ type: CCString }) myID: string = "";
    @property({ type: CCString }) userName: string = "";
    @property({ type: CCString }) userId: string = "";
    private rigidbody = false;
    private _body: RigidBody2D | null = null;
    @property({ type: Collider2D }) collider: Collider2D | null = null;
    @property({ type: RichText }) playerNameText: RichText = null;
    @property({ type: MoveAbility }) moveAbility: MoveAbility = null;
    @property({ type: AnimationEventController }) animationEventController: AnimationEventController = null;
    @property({ type: Node }) equipItemAnchor: Node = null;
    @property({ type: [Color] }) playerNameColor: Color[] = [];
    @property({ type: P2PInteractManager }) p2PInteractManager: P2PInteractManager = null;
    /////Bubble Chat
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    @property({ type: PetCatchingController }) petCatching: PetCatchingController;
    @property petFollowPrefabs: AnimalController[] = [];
    myClientBattleId: string = "";
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;
    private showNameTimer: number | null = null;
    public CanUpdateAnim: boolean = true;
    public get get_MoveAbility(): MoveAbility {
        return this.moveAbility;
    }
    public get isMyClient() {
        if (this.room == null || this.myID == "")
            return false;

        return this.room.sessionId == this.myID
    }

    private get UserProfile() {
        return UserMeManager.Get;
    }

    public get IsHasAttachItem(): boolean {
        return this.equipItemAnchor.children.length > 0;
    }

    public get UserId() {
        return this.userId;
    }

    protected start(): void {
        director.on(EVENT_NAME.BACK_TO_NORMAL, () => {
            this.onBackToNormal();
        });
        director.on(EVENT_NAME.PREVENT_OUT_MAP, () => {
            if (!this.isMyClient)
                this.onPreventOutMap();
        });
    }

    protected onDisable(): void {
        director.off(EVENT_NAME.BACK_TO_NORMAL);
        director.off(EVENT_NAME.PREVENT_OUT_MAP);
    }

    private onBackToNormal() {
        this.showName(true);
    }

    private onPreventOutMap() {
        this.showName(false);
    }

    savePetFollow(petPrefab: AnimalController) {
        this.petFollowPrefabs.push(petPrefab);
    }

    public async init(sessionId, room, name = "", skinSet: string, userID: string, isShowName: boolean) {
        this.room = room;
        this.myID = sessionId;
        this.userId = userID;
        this.shrinkBubbleChat(0);
        await this.animationEventController.init(this.isMyClient ? UserMeManager.Get.user.skin_set : skinSet != "" ? skinSet.split("/") : ResourceManager.instance.LocalSkinConfig.male.defaultSet);
        if (this.rigidbody) {
            this._body = this.node.getComponent(RigidBody2D);
        }
        this.moveAbility.init(sessionId, this, room);

        if (this.isMyClient) {
            let camera = find("Canvas/Camera");
            let cameraController = camera.getComponent(PlayerCameraController);
            cameraController.target = this.node;
        }
        this.p2PInteractManager.init(sessionId, this, room);
        director.on(EVENT_NAME.UPDATE_INFO_PROFILE, this.updateProfile, this);
        this.userName = name != "" ? name : this.UserProfile.user.display_name != "" ? this.UserProfile.user.display_name : this.UserProfile.user.username;
        // this.playerNameText.string = this.UserProfile.user.display_name ? this.UserProfile.user.display_name : this.UserProfile.user.username;
        this.setPlayerName(this.userName);
        this.playerNameText.fontColor = this.isMyClient ? this.playerNameColor[0] : this.playerNameColor[1];
        this.showName(this.isMyClient || (!this.isMyClient && isShowName));
        if (localStorage.getItem(Tutorial.tutorial_completed) != "true") {
            this.zoomBubbleChat("Không khí thật trong lành, đi dạo một vòng nào !!!");
            sys.localStorage.setItem(Tutorial.tutorial_completed, true);
        }
    }

    public attachItem(item: Node) {
        item.setParent(this.equipItemAnchor, true);
        return this.equipItemAnchor;
    }

    public addMoveSpeed(speed: number) {
        this.moveAbility.moveSpeed += speed;
        if (this.moveAbility.moveSpeed < this.moveAbility.originMoveSpeed) {
            this.moveAbility.moveSpeed = this.moveAbility.originMoveSpeed;
        }
        if (this.moveAbility.moveSpeed > this.moveAbility.originMoveSpeed + Math.abs(speed)) {
            this.moveAbility.moveSpeed = this.moveAbility.originMoveSpeed + Math.abs(speed);
        }
    }

    private setPlayerName(name: string) {
        this.userName = name;
        this.playerNameText.string = `<outline color=#000000 width=1>${name}</outline>`;
    }

    protected updateProfile(data: any) {
        if (!data || !data.fullname || !this.isMyClient) return;
        this.setPlayerName(data.fullname);
    }

    resetPets(onDone: () => void) {
        this.petFollowPrefabs ??= [];
        // Nếu không có pet nào thì kết thúc luôn
        if (this.petFollowPrefabs.length === 0) {
            onDone();
            return;
        }
        this.petFollowPrefabs.forEach(pet => {
            pet.closeAnimal();
        });
        const checkInterval = setInterval(() => {
            const allInactive = this.petFollowPrefabs?.every(p => p?.node && !p.node.active) ?? true;
            if (allInactive) {
                clearInterval(checkInterval);
                if (!Array.isArray(this.petFollowPrefabs)) {
                    this.petFollowPrefabs = [];
                } else {
                    this.petFollowPrefabs.length = 0;
                }
                onDone(); // Gọi callback
            }
        }, 10);
    }

    public removePlayer() {
        for (const attach of this.equipItemAnchor.children) {
            const goKart = attach.getComponent(GoKart);
            goKart.ResetSpeedPlayer();
            this.moveAbility.moveSpeed = 300;
            attach.parent = null;
        }

        ObjectPoolManager.instance.returnToPool(this.node);
    }

    setPositonPet() {
        setTimeout(() => {
            if (this.petFollowPrefabs?.length) {
                this.petFollowPrefabs.forEach(x => {
                    if (x?.node?.isValid) {
                        x.node.active = true;
                        x.node.setPosition(this.node.getPosition());
                    }
                });
            }

        }, 500); // chờ 0.5 giây
    }

    public updateRemotePosition(data) {
        if (this.isMyClient) return;

        this.moveAbility.updateRemotePosition(data);
    }

    public leaveRoom(onDone?: () => void) {
        this.resetPets(async () => {
            await this.room.leave();
            console.log("Left Room");
            if (onDone) {
                onDone();
            }
        });
    }

    public updateSkinLocal(skinData: Item, applyToPlayer: boolean) {
        if (this.isMyClient) {
            this.animationEventController.changeSkin(skinData, applyToPlayer);
        }
    }

    public happyAction(resetAfter: number = 2) {
        this.moveAbility.updateAction("happy", true);
        SoundManager.instance.playSound(AudioType.ReceiveReward);
        setTimeout(() => {
            if (this.moveAbility?.animationController) {
                if (this.moveAbility.animationController.getCurrentAnim == "happy") {
                    this.moveAbility.updateAction("idle", true);
                }
            }
        }, resetAfter * 1000);
    }

    public sadAction() {
        this.moveAbility.updateAction(randomRange(0, 1) < 0.5 ? "kneel" : "lie", true);
        SoundManager.instance.playSound(AudioType.Lose);
    }

    public updateSkinRemote(skinSet: string[]) {
        if (this.isMyClient) return;

        this.animationEventController.loadSkin(skinSet);
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

    public zoomBubbleChat(contentChat: string) {
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
        this.hideTimeout = setTimeout(() => {
            this.shrinkBubbleChat(0.5);
        }, 4000);
    }

    showName(isShow: boolean) {
        return;
        if (this.playerNameText) {
            this.playerNameText.node.active = isShow;
        }
    }

    public showNameTemporarily(duration: number = 5) {
        if (this.showNameTimer !== null) {
            clearTimeout(this.showNameTimer);
        }
        this.showName(true);

        this.showNameTimer = setTimeout(() => {
            this.showName(false);
            this.showNameTimer = null;
        }, duration * 1000);
    }
}