import { _decorator, Button, Component, EditBox, game, instantiate, Layout, Prefab, ScrollView, Node, KeyCode, Color, RichText, input, Input } from 'cc';
import { UserManager } from '../../core/UserManager';
import { ObjectPoolManager } from '../../pooling/ObjectPoolManager';
import { UIManager } from '../../core/UIManager';
import { PopupGetPet, PopupGetPetParam } from '../../PopUp/PopupGetPet';
import { PopupManager } from '../../PopUp/PopupManager';
import { PetDTO, SkillCode } from '../../Model/PetDTO';
import { Constants } from '../../utilities/Constants';
import { BasePopup } from '../../PopUp/BasePopup';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { sys } from 'cc';
import { UIMobileManager } from '../Mobile/UIMobileManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { Widget } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIChat')
export class UIChat extends Component {
    @property({ type: EditBox }) editBox: EditBox = null;
    @property({ type: ScrollView }) chatScrollView: ScrollView = null;
    @property({ type: Prefab }) chatMessagePrefab: Prefab = null;
    @property({ type: Layout }) layoutContent: Layout = null;
    @property({ type: Button }) buttonSend: Button = null;
    @property({ type: Node }) scrollBar: Node = null;
    @property({ type: Node }) backgroundUI: Node = null;
    @property({ type: [Color] }) chatColor: Color[] = [];
    @property({ type: Widget }) positionChat: Widget = null;
    private positionChatMobile = 360;
    private positionChatNoMobile = 53;
    private isShowUIByMobile: boolean = false;
    ////

    private maxItemCanShow: 50;
    private popupSpam: BasePopup = null;
   
    async onLoad() {
        this.isShowUIByMobile = false;
        this.positionChat.bottom = sys.isMobile ? this.positionChatMobile : this.positionChatNoMobile;
        this.isShowUI(false);
        this.buttonSend.node.on(Button.EventType.CLICK, () => this.sendMessage(), this);
        if (sys.isMobile) {
            await Constants.waitUntil(() => UIMobileManager.instance != null);
            UIMobileManager.instance?.node.on(EVENT_NAME.ON_CLICK_BUTTON_CHAT_MOBILE,
                () => {
                    this.isShowUIByMobile = !this.isShowUIByMobile;
                    if (this.isShowUIByMobile) {
                        this.showChatUi();
                    } else {
                        this.clearChat();
                    }
                }, this);
        } else {
            this.editBox.node.on("editing-return", () => this.sendMessage(), this);
            this.registerKey();
        }

    }

    showChatUi() {
        this.isShowUI(true);
        this.editBox.focus();
    }

    registerKey() {
        input.on(Input.EventType.KEY_DOWN, ((event) => {
            if (event.keyCode === KeyCode.ENTER) {
                this.showChatUi();
            }
        }), this);
    }
    async sendMessage() {
        const message = this.editBox.string.trim();
        if (message == "") {
            this.clearChat();
            return;
        }
        if (message == "VituralHub-X92J7K1M") {
            this.clearChat();
            // UIManager.Instance.toolcreatePet.node.active = true
            return;
        }
        if (!Constants.canSendChat()) {
            if (this.popupSpam != null && this.popupSpam.node != null) {
                await PopupManager.getInstance().closePopup(this.popupSpam.node.uuid);
            }
            this.clearChat();
            const timeRemaning = Math.ceil((Constants.muteUntil - Date.now()) / 1000);
            const param: ConfirmParam = {
                message: `Bạn chat quá nhiều , vui lòng thử lại sau ${timeRemaning}s`,
                title: "Thông Báo",
            };
            this.popupSpam = await PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, param);
            return;
        }
        if (sys.isMobile) this.isShowUIByMobile = false;
        UserManager.instance.sendMessageChat(message);
        this.clearChat();
    }

    clearChat() {
        this.editBox.blur();
        this.editBox.string = "";
        game.canvas.focus();
        this.isShowUI(false);
    }

    protected onDisable(): void {
        if (ObjectPoolManager.instance && this.chatScrollView?.content) {
            ObjectPoolManager.instance.returnArrayToPool(this.chatScrollView.content.children)
        }
    }

    public showChatMessage(sender: string, message: string) {
        if (this.chatScrollView.content.children.length >= this.maxItemCanShow) {
            ObjectPoolManager.instance.returnToPool(this.chatScrollView.content.children[0])
        }
        let parts = sender.split("/");
        let name = parts[0] != null ? parts[0] : " ";
        let userId = parts[1] != null ? parts[1]! : "";
        let newMessage = ObjectPoolManager.instance.spawnFromPool(this.chatMessagePrefab.name);
        newMessage.setParent(this.chatScrollView.content);
        newMessage.setSiblingIndex(this.chatScrollView.content.children.length - 1);
        let richText = newMessage.getComponent(RichText);
        // richText.fontColor = userId == UserManager.instance.GetMyClientPlayer.myID ? this.chatColor[0] : this.chatColor[1];
        richText.string = this.formatMessage(name, message);
        let player = UserManager.instance.getPlayerById(userId);
        if (player) {
            player.zoomBubbleChat(message);
        }

        this.chatScrollView.scrollToBottom(0.2);
    }

    private formatMessage(name: string, message: string): string {
        const now = new Date();
        const hours = ('0' + now.getHours()).slice(-2);
        const minutes = ('0' + now.getMinutes()).slice(-2);
        return `[${hours}:${minutes}] ${name}: ${message}`;
    }

     isShowUI(isShow: boolean) {
        this.backgroundUI.active = isShow;
        this.scrollBar.active = isShow;
    }
}


