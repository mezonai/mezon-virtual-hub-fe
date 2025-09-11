import UIPopup from '../ui/UI_Popup';
import { UIID } from '../ui/enum/UIID';
import { UIIdentify } from '../ui/UIIdentify';
import { EVENT_NAME } from '../network/APIConstant';
import Utilities from '../utilities/Utilities';
import { _decorator, Component, Enum, view, Node, director, Button, View } from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { PopupOwnedAnimals } from '../PopUp/PopupOwnedAnimals';
import { ToolSpawnPet } from '../utilities/ToolSpawnPet';
import { PopupBattlePet } from '../PopUp/PopupBattlePet';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    private static _instance: UIManager = null;
    @property({ type: Enum(UIID) }) defaultUI: UIID = UIID.Home;
    @property({ type: [Node] }) listPanel: Node[] = [];
    @property({ type: Node }) popupNode: Node;
    @property({ type: Node }) bigPopupNode: Node;
    @property({ type: Node }) fadePopupNode: Node;
    @property({ type: Button }) outmapButton: Button;
    @property({ type: ToolSpawnPet }) toolcreatePet: ToolSpawnPet;
    @property({ type: PopupBattlePet }) batteScene: PopupBattlePet;
    private _popup: UIPopup = null;
    private _bigPopup: UIPopup = null;
    private _fadePopup: UIPopup = null;

    private get popup() {
        if (this._popup == null) {
            this._popup = this.popupNode.getComponent(UIPopup);
        }

        return this._popup;
    }

    private get bigPopup() {
        if (this._bigPopup == null) {
            this._bigPopup = this.bigPopupNode.getComponent(UIPopup);
        }

        return this._bigPopup;
    }

    private get fadePopup() {
        if (this._fadePopup == null) {
            this._fadePopup = this.fadePopupNode.getComponent(UIPopup);
        }

        return this._fadePopup;
    }

    private _listPanel: UIIdentify[] = [];

    public static get Instance(): UIManager {
        return this._instance
    }

    onLoad() {
        if (UIManager._instance == null) {
            UIManager._instance = this;
        }
        view.on('canvas-resize', UIManager.Instance.onResize.bind(UIManager.Instance));
        this.batteScene.node.active = false;
    }

    onResize() {
        director.emit(EVENT_NAME.CANVAS_RESIZE);
    }


    protected onDestroy(): void {
        UIManager._instance = null;
    }

    public init() {
        this.listPanel.forEach(panel => {
            this._listPanel.push(panel.getComponent(UIIdentify));
        });
        this.showUI(this.defaultUI, false);
        this._listPanel.forEach(panel => {
            panel.init();
        });
    }

    public checkResumeGame() {
        if (!this.isAnyPanelOpen) {
            this.node.emit(EVENT_NAME.ON_RESUME_GAME);
        }
    }

    public get isAnyPanelOpen() {
        for (const panel of this._listPanel) {
            if (panel.node.active) {
                return true;
            }
        }

        return false;
    }

    public registCountDown(time: number, callbackCountDown, callBackDone = null) {
        let id = -1;
        callbackCountDown(Utilities.secondsToHMS(time), id);
        id = setInterval(() => {
            time--;
            callbackCountDown(Utilities.secondsToHMS(time), id);

            if (time <= 0) {
                clearInterval(id);

                if (callBackDone)
                    callBackDone();
            }

        }, 1000);
    }

    public showUI(id: UIID, pauseGame: boolean = true): Node {
        if (pauseGame) {
            this.node.emit(EVENT_NAME.ON_PAUSE_GAME);
        }
        if (this._listPanel == null) return;
        //Popup
        for (const panel of this._listPanel) {
            if (panel && panel.id === id && panel.isPopup) {
                panel.show();
                return panel.node;
            }
        }
        //Panel
        let tempPanel = null;
        for (const panel of this._listPanel) {
            if (panel.node) {
                if (panel.id == id) {
                    if (id == UIID.Home) {
                        this.node.emit("HOME_AGAIN", this);
                    }
                    tempPanel = panel;
                    panel.show();
                } else if (panel.node.active) {
                    panel.hide();
                }
            }
        }

        if (tempPanel?.node) {
            return tempPanel.node;
        }
    };

    public FindUIIndetify(id: UIID): UIIdentify {
        for (const panel of this._listPanel) {
            if (panel.id == id) {
                return panel;
            }
        }
    };

    public showYesNoPopup(title: string, content: string, yesCallback, noCallback = null, txt_Yes: string = "Yes", txt_No: string = "No", closeAfter: number = -1): void {
        this.popup.showYesNoPopup(title, content, yesCallback, txt_Yes, txt_No, noCallback, closeAfter);
    };

    public showNoticePopup(title = "Chú Ý", content = "", callback = null) {
        this.popup.showOkPopup(title, content, callback, "OK");
    }

    public showBigNoticePopup(title = "Chú Ý", content = "", callback = null) {
        this.bigPopup.showOkPopup(title, content, callback, "OK");
    }

    public showMessageTimeout(content: string, closeAfter: number) {
        this.fadePopup.showMessageTimeout(content, closeAfter);
    }

    public hideMessageTimeout() {
        this.fadePopup.hide();
    }

    public HideUI(id: UIID) {
        for (const panel of this._listPanel) {
            if (panel.id == id) {
                panel.hide();
            }
        }
    }

    // TweenEasing = "linear" | "smooth" | "fade" | "constant" | "quadIn" | "quadOut" | "quadInOut" |
    //  "quadOutIn" | "cubicIn" | "cubicOut" | "cubicInOut" | "cubicOutIn" | "quartIn" | "quartOut" |
    //  "quartInOut" | "quartOutIn" | "quintIn" | "quintOut" | "quintInOut" | "quintOutIn" | "sineIn" |
    //  "sineOut" | "sineInOut" | "sineOutIn" | "expoIn" | "expoOut" | "expoInOut" | "expoOutIn" | "circIn" |
    //  "circOut" | "circInOut" | "circOutIn" | "elasticIn" | "elasticOut" | "elasticInOut" | "elasticOutIn" |
    //  "backIn" | "backOut" | "backInOut" | "backOutIn" | "bounceIn" | "bounceOut" | "bounceInOut" | "bounceOutIn";
}


