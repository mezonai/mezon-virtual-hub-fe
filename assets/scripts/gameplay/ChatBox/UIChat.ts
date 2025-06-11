import { _decorator, Button, Component, EditBox, game, instantiate, Layout, Prefab, ScrollView, Node, SystemEvent, systemEvent, KeyCode, Color, RichText, UITransform, input, Input, UI } from 'cc';
import { UserManager } from '../../core/UserManager';
import { ObjectPoolManager } from '../../pooling/ObjectPoolManager';
import { ToolSpawnPet } from '../../utilities/ToolSpawnPet';
import { UIManager } from '../../core/UIManager';

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
    private maxItemCanShow: 50;
    isShowUI(isShow: boolean) {
        this.backgroundUI.active = isShow;
        this.scrollBar.active = isShow;
    }
    onLoad() {
        this.isShowUI(false);
        this.buttonSend.node.on(Button.EventType.CLICK, () => this.sendMessage(), this);
        this.editBox.node.on("editing-return", () => this.sendMessage(), this);
        input.on(Input.EventType.KEY_DOWN, ((event) => {
            if (event.keyCode === KeyCode.ENTER) {
                this.isShowUI(true);
                this.editBox.focus();
            }
        }), this);
    }

    sendMessage() {
        const message = this.editBox.string.trim();
        if (message == "toolcreatePet") {
            this.editBox.blur();
            this.editBox.string = "";
            game.canvas.focus();
            this.isShowUI(false);
            UIManager.Instance.toolcreatePet.node.active = true
            return;
        }
        if (message != "") UserManager.instance.sendMessageChat(message);
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
}


