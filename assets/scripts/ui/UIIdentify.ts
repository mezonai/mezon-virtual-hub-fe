import { _decorator, Button, CCBoolean, Component, Enum, Node, tween, Tween, Vec3, Widget } from "cc";
import { UIManager } from "../core/UIManager";
import { UIID } from "./enum/UIID";
const { ccclass, property } = _decorator;

@ccclass('AttachNodeData')
export class AttachNodeData {
    @property({ type: Node }) public attachNode: Node = null;
    public widget: Widget = null;
    @property({ type: Vec3 }) public movePosition: Vec3 = new Vec3(0, 0, 0);
    @property({type: CCBoolean}) punchScaleIfNotMove: boolean = false;
    public originPosition: Vec3 = null;
}

export enum PanelType {
    ScaleOut,
    ScaleIn,
    InFromTop,
    OutToTop,
    InFromBottom,
    OutToBottom
}

@ccclass('UIIdentify')
export class UIIdentify extends Component {

    @property({
        type: Enum(UIID)
    }) public id: UIID = UIID.None;

    @property({ type: Node }) public panel: Node;

    @property({ type: Button }) public btnCloses: Button[] = [];
    @property({ type: [AttachNodeData] }) public attachNodes: AttachNodeData[] = [];

    @property({ type: Boolean }) public isPopup: boolean = false;
    @property({ type: Enum(PanelType) }) appearType: PanelType = PanelType.ScaleIn;
    @property({ type: Enum(PanelType) }) disappearType: PanelType = PanelType.ScaleOut;
    public originScale: Vec3 = Vec3.ONE;

    protected start(): void {

        this.btnCloses.forEach(btn => {
            btn?.node.on('click', this.hide, this);
        });
    }

    public hide(): void {
        if (!this.panel.active) return;
        if (this.isPopup && this.panel.children[1] != null) {
            this.hidePopups();
        }
        else {
            this.panel.active = false;
            if (UIManager.Instance) {
                UIManager.Instance.checkResumeGame();
            }
        }
    };

    public init() {
        this.attachNodes.forEach(attachNodeData => {
            let widget = attachNodeData.attachNode.getComponent(Widget);
            attachNodeData.widget = widget;
            attachNodeData.originPosition = new Vec3(widget.right, widget.top, 0);
        });

    }

    public show(): void {
        let parent = this.node.parent;
        this.node.parent = null;
        this.node.parent = parent;
        this.panel.active = true;
        if (this.isPopup && this.panel.children[1] != null) {
            this.showPopups();
        }
    };

    showPopups() {
        this.attachNodes.forEach(attachNodeData => {
            attachNodeData.widget.right = attachNodeData.originPosition.x + attachNodeData.movePosition.x;
            attachNodeData.widget.top = attachNodeData.originPosition.y + attachNodeData.movePosition.y;
            attachNodeData.attachNode.active = false;
        });

        this.doTweenPanel(this.appearType, () => { this.doShowAttachNodes() });
    }

    private doShowAttachNodes() {
        this.attachNodes.forEach(attachNodeData => {
            attachNodeData.attachNode.active = true;
            Tween.stopAllByTarget(attachNodeData.widget)
            if (!attachNodeData.movePosition.equals(Vec3.ZERO)) {
                tween(attachNodeData.widget)
                    .to(0.1, { right: attachNodeData.originPosition.x, top: attachNodeData.originPosition.y },)
                    .call(() => {
                        attachNodeData.widget.right = attachNodeData.originPosition.x;
                        attachNodeData.widget.top = attachNodeData.originPosition.y;
                    })
                    .start();
            }
            else if (attachNodeData.punchScaleIfNotMove){
                // attachNodeData.widget.alignMode = Widget.AlignMode.ALWAYS;
                attachNodeData.attachNode.scale = Vec3.ZERO;
                tween(attachNodeData.attachNode)
                    .to(0.1, { scale: new Vec3(1.1, 1.1, 1.1) },)
                    .to(0.05, { scale: new Vec3(0.95, 0.95, 0.95) },)
                    .to(0.05, { scale: Vec3.ONE })
                    // .call(() => {
                    //     attachNodeData.widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
                    // })
                    .start();
            }
        });
    }

    private scaleInPanel(callback) {
        Tween.stopAllByTarget(this.panel.children[1]);
        tween(this.panel.children[1])
            .to(0.1, { scale: this.originScale.clone().add(new Vec3(0.1, 0.1, 0.1)) },)
            .to(0.1, { scale: this.originScale })
            .call(() => {
                callback();
            })
            .start();
    }

    private scaleOutPanel(callback) {
        Tween.stopAllByTarget(this.panel.children[1]);
        this.panel.children[1].scale = Vec3.ONE;
        tween(this.panel.children[1])
            .to(0.1, { scale: this.originScale.clone().add(new Vec3(0.1, 0.1, 0.1)) },)
            .to(0.06, { scale: Vec3.ZERO },)
            .delay(0.1)
            .call(() => {
                callback();
            })
            .start();
    }

    private checkClosePanel() {
        this.panel.active = false;
        if (UIManager.Instance) {
            UIManager.Instance.checkResumeGame();
        }
    }

    hidePopups() {
        this.attachNodes.forEach(attachNodeData => {
            attachNodeData.attachNode.active = false;
        });

        this.doTweenPanel(this.disappearType, () => { this.checkClosePanel() });
    }

    private doTweenPanel(type: PanelType, callback) {
        switch (type) {
            case PanelType.ScaleOut:
                this.scaleOutPanel(() => { callback(); });
                break;
            case PanelType.ScaleIn:
                this.scaleInPanel(() => { callback() });
                break;
            case PanelType.InFromTop:
                this.inFromTop(() => { callback(); });
                break;
            case PanelType.OutToTop:
                this.outToTop(() => { callback() });
                break;
                case PanelType.InFromBottom:
                    this.inFromBottom(() => { callback(); });
                    break;
                case PanelType.OutToBottom:
                    this.outToBottom(() => { callback() });
                    break;
        }
    }

    private inFromTop(callback) {
        this.panel.children[1].position = new Vec3(0, 500, 0);
        tween(this.panel.children[1])
            .delay(0.01)
            .to(0.1, { position: new Vec3(0, -20, 0) },)
            .to(0.1, { position: Vec3.ZERO },)
            .call(() => {
                callback();
            })
            .start();
    }

    private outToTop(callback) {
        this.panel.children[1].position = new Vec3(0, 0, 0);
        tween(this.panel.children[1])
            .to(0.2, { position: new Vec3(0, 500, 0) },)
            .call(() => {
                callback();
            })
            .start();
    }

    private inFromBottom(callback) {
        this.panel.children[1].position = new Vec3(0, -100, 0);
        tween(this.panel.children[1])
            .delay(0.01)
            .to(0.1, { position: new Vec3(0, 10, 0) },)
            .to(0.1, { position: new Vec3(0, 0, 0) },)
            .call(() => {
                callback();
            })
            .start();
    }

    private outToBottom(callback) {
        this.panel.children[1].position = new Vec3(0, 0, 0);
        tween(this.panel.children[1])
            .to(0.2, { position: new Vec3(0, -100, 0) },)
            .call(() => {
                callback();
            })
            .start();
    }
}