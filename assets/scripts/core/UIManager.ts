import { _decorator, Button, CCFloat, CCString, Component, Label, Node, ProgressBar, RichText, Sprite, SpriteFrame, sys, tween, Vec3, view, Widget } from 'cc';
import UIPopup from '../ui/UI_Popup';
import { UIID } from '../ui/enum/UIID';
import { UIIdentify } from '../ui/UIIdentify';
import { EVENT_NAME } from '../network/APIConstant';
import Utilities from '../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('RankIconData')
export class RankIconData {
    @property({ type: CCString }) rankName: string = "";
    @property({ type: SpriteFrame }) icon;
    @property({ type: CCFloat }) offsetY: number = 0;
}

@ccclass('UIManager')
export class UIManager extends Component {
    private static _instance: UIManager = null;
    @property({ type: UIID }) public defaultUI: UIID = UIID.Home;
    @property({ type: Node }) public mainCanvas: Node = null;
    @property({ type: Node }) public buttonContainer: Node = null;
    @property({ type: Label }) public goldText: Label = null;
    @property({ type: Label }) public goldenHeartText: Label = null;
    @property({ type: UIIdentify }) public lstPanel: UIIdentify[] = [];
    @property({ type: UIPopup }) public popup: UIPopup;

    @property({ type: Node }) public topUI: Node = null;
    @property({ type: Node }) public footerUI: Node = null;
    @property({ type: Node }) public topGamePlayUI: Node = null;

    public static get Instance(): UIManager {
        return this._instance
    }
    private originTopUI: Vec3 = Vec3.ZERO;
    private originFooterUI: Vec3 = Vec3.ZERO;
    private originTopGamePlayUI: Vec3 = Vec3.ZERO;
    private originTextScale: Vec3 = new Vec3(1, 1, 1);
    private minTextScale: Vec3 = new Vec3(0.9, 0.9, 0.9);
    private maxTextScale: Vec3 = new Vec3(1.1, 1.1, 1.1);

    onLoad() {
        if (UIManager._instance == null) {
            UIManager._instance = this;
        }
    }

    protected onDestroy(): void {
        UIManager._instance = null;
    }

    start() {
        let that = this;
        view.setResizeCallback(function () {
            that.node.emit("ON_SCREEN_RESIZE", that);
        });
        this.originTopUI = this.topUI.position.clone();
        this.originFooterUI = this.footerUI.position.clone();
        this.originTopGamePlayUI = this.topGamePlayUI.position.clone();
    }

    public init(userName: string, currentRank: number) {
        this.showUI(this.defaultUI, false);
        this.lstPanel.forEach(panel => {
            panel.init();
        });
    }

    public checkResumeGame() {
        if (!this.isAnyPanelOpen) {
            this.node.emit(EVENT_NAME.ON_RESUME_GAME);
        }
    }

    public get isAnyPanelOpen () {
        for (const panel of this.lstPanel) {
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

    public updateGold(gold) {
        this.goldText.node.scale = this.originTextScale;
        tween(this.goldText.node)
            .to(0.1, { scale: this.minTextScale })
            .delay(0.1)
            .to(0.1, { scale: this.maxTextScale })
            .delay(0.1)
            .to(0.1, { scale: this.originTextScale })
            .start();
        this.goldText.string = Utilities.convertBigNumberToStr(gold, false);
    }

    public updateGoldenHeart(heart) {
        this.goldenHeartText.node.scale = this.originTextScale;
        tween(this.goldenHeartText.node)
            .to(0.1, { scale: this.minTextScale })
            .delay(0.1)
            .to(0.1, { scale: this.maxTextScale })
            .delay(0.1)
            .to(0.1, { scale: this.originTextScale })
            .start();
        this.goldenHeartText.string = Utilities.convertBigNumberToStr(heart, false);
    }

    public showUI(id: UIID, pauseGame: boolean = true): Node {
        if (pauseGame) {
            this.node.emit(EVENT_NAME.ON_PAUSE_GAME);
        }
        if (this.lstPanel == null) return;
        //Popup
        for (const panel of this.lstPanel) {
            if (panel && panel.id === id && panel.isPopup) {
                panel.show();
                return panel.node;
            }
        }
        //Panel
        let tempPanel = null;
        for (const panel of this.lstPanel) {
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
        for (const panel of this.lstPanel) {
            if (panel.id == id) {
                return panel;
            }
        }
    };

    public showYesNoPopup(title: string, content: string, yesCallback, noCallback = null, txt_Yes: string = "Yes", txt_No: string = "No", isResetVisual = true): void {
        this.popup.showYesNoPopup(title, content, yesCallback, txt_Yes, txt_No, noCallback, isResetVisual);
    };

    public showNoticePopup(title = "Warning", content = "", callback = null) {
        this.popup.showOkPopup(title, content, callback);
    }

    public HideUI(id: UIID) {
        for (const panel of this.lstPanel) {
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


    public activeUIWhenPlayGame(isActive: boolean) {

        const movePosY = isActive ? 120 : 0;

        tween(this.topUI)
            .to(0.4, { position: (this.originTopUI.clone().add(new Vec3(0, movePosY, 0))) }, { easing: 'sineInOut' })
            .start();
        tween(this.footerUI)
            .to(0.4, { position: (this.originFooterUI.clone().add(new Vec3(0, -movePosY, 0))) }, { easing: 'sineInOut' })
            .start();


        let movePos = isActive ? new Vec3(0, this.originTopGamePlayUI.y, 0) : this.originTopGamePlayUI;
        tween(this.topGamePlayUI)
            .to(0.4, { position: movePos }, { easing: 'sineInOut' })
            .start();
    }
}


