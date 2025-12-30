import { _decorator, CCFloat, Component, Enum, JsonAsset, Label, Node, randomRange, randomRangeInt, resources, tween, Tween, Vec3 } from 'cc';
import { UserMeManager } from '../../core/UserMeManager';
import { ResourceManager } from '../../core/ResourceManager';
import { FactData, JokeData } from '../../Model/NPCLocalData';
import { ServerManager } from '../../core/ServerManager';
import { EVENT_NAME } from '../../network/APIConstant';
import { UserManager } from '../../core/UserManager';
import { UIManager } from '../../core/UIManager';
import { UIID } from '../../ui/enum/UIID';
import { MathProblemParam, MathProblemPopup } from '../../ui/MathProblemPopup';
import { PopupManager } from '../../PopUp/PopupManager';
const { ccclass, property } = _decorator;

export enum NPC_TYPE {
    FACT = 0,
    JOKE = 1,
    POOR = 2,
    MATH = 3
}

@ccclass('NPCController')
export class NPCController extends Component {
    @property({ type: Enum(NPC_TYPE) }) type: NPC_TYPE = NPC_TYPE.FACT;
    @property({ type: CCFloat }) showContentInterval: number = 60;
    private showContentIntervalId: number = 0;
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;
    @property({ type: CCFloat }) showDialogueTime: number = 8;
    private inited: boolean = false;
    private maxDistancePlayerCanInteract = 100;

    private readonly praiseResponse = [
        "Khá lắm",
        "Waoooo, giỏi vậy sao",
        "Hack à",
        "Tuyệt, bây giờ chúng ta có 2 học sinh giỏi"
    ];

    private readonly criticizeResponse = [
        "Sai rồi",
    ];

    protected onEnable(): void {
        if (this.checkCanDisplay()) {
            this.node.active = true;
            this.loadDialogue()
                .then(() => {
                    this.inited = true;
                })
        }
        else {
            this.node.active = false;
        }


        if (ServerManager.instance) {
            ServerManager.instance.node.on(EVENT_NAME.ON_QUIZ, (data) => {
                this.checkShowDialogue(data);
            });

            if (this.type != NPC_TYPE.MATH) return;

            ServerManager.instance.node.on(EVENT_NAME.ON_QUIZ_ANSWER, (data) => {
                this.onQuizAnwser(data);
            });
        }
    }

    private onQuizAnwser(data) {
        if (this.type != NPC_TYPE.MATH) return;
        const { correct, userGold } = data;
        if (correct && userGold) {
            this.zoomBubbleChat(this.praiseResponse[randomRangeInt(0, this.praiseResponse.length)], 4);
        }
        else {
            this.zoomBubbleChat(this.criticizeResponse[randomRangeInt(0, this.criticizeResponse.length)], 4);
        }
    }

    protected onDisable(): void {
        clearInterval(this.showContentIntervalId);

        if (ServerManager.instance) {
            ServerManager.instance.node.off(EVENT_NAME.ON_QUIZ);
            ServerManager.instance.node.off(EVENT_NAME.ON_QUIZ_ANSWER);
        }
    }

    private checkShowDialogue(data) {
        if (!this.inited || UserManager.instance.GetMyClientPlayer?.isInBattle) return;
        if (this.type == NPC_TYPE.FACT) {
            let content = ResourceManager.instance.FactData.data[randomRangeInt(0, ResourceManager.instance.FactData.data.length)].fact;
            if (content != "") {
                this.zoomBubbleChat(content, this.showDialogueTime);
            }
        }
        else if (this.type == NPC_TYPE.JOKE) {
            let content = ResourceManager.instance.JokeData.data[randomRangeInt(0, ResourceManager.instance.JokeData.data.length)];
            if (content.question != "") {
                this.zoomBubbleChat(content.question, this.showDialogueTime);
                if (content.answer != null && content.answer != "") {
                    setTimeout(() => {
                        this.zoomBubbleChat(content.answer, this.showDialogueTime);
                    }, this.showDialogueTime * 1000);
                }
            }
        }
        else if (this.type == NPC_TYPE.MATH) {
            const { id, options, question } = data;
            this.zoomBubbleChat(question, this.showDialogueTime);

            if (UserManager.instance?.GetMyClientPlayer) {
                let distance = Vec3.distance(this.node.worldPosition, UserManager.instance.GetMyClientPlayer.node.worldPosition);
                if (distance < this.maxDistancePlayerCanInteract) {
                    const mathParam: MathProblemParam = {
                        id: id,
                        question: question,
                        options: options.split(","),
                    };
                    this.ShowBubbleChatMath(mathParam);
                }
            }
        }
    }

    async ShowBubbleChatMath(mathParam: MathProblemParam) {
        const popup = await PopupManager.getInstance().openPopup("MathProblemPopup", MathProblemPopup, mathParam);
        if (popup?.isValid) {
            setTimeout(() => {
                popup.closePopup();
            }, this.showDialogueTime * 1000);
        }
    }

    private loadDialogue() {
        return new Promise<void>((resolve, reject) => {
            if (this.type == NPC_TYPE.FACT && ResourceManager.instance.FactData?.data == null) {
                this.loadJsonData("factConfig")
                    .then((response) => {
                        ResourceManager.instance.FactData = new FactData();
                        ResourceManager.instance.FactData.data = response;
                        resolve();
                    })
                    .catch((e) => {
                        reject();
                    })
            }
            else if (this.type == NPC_TYPE.JOKE && ResourceManager.instance.JokeData?.data == null) {
                this.loadJsonData("jokeConfig")
                    .then((response) => {
                        ResourceManager.instance.JokeData = new JokeData();
                        ResourceManager.instance.JokeData.data = response;
                        resolve();
                    })
                    .catch((e) => {
                        reject();
                    })
            }
            else {
                resolve();
            }
        });
    }

    private async loadJsonData(filename: string) {
        return new Promise<any>((resolve, reject) => {
            resources.load(filename, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.error("Failed to load config:", err);
                    reject();
                    return;
                }
                const config = jsonAsset.json;

                resolve(config);
            });
        })
    }

    private checkCanDisplay() {
        if (UserMeManager.CurrentOffice?.nameRoomServer == null) return true;

        if (this.type == NPC_TYPE.JOKE) {
            return randomRange(0, 1) <= 0.5;
        }

        switch (UserMeManager.CurrentOffice.nameRoomServer) {
            case "hn1":
            case "hn3":
            case "dn":
                return this.type == NPC_TYPE.FACT;
            case "hn2":
            case "vinh":
            case "sg":
            case "qn":
                return this.type == NPC_TYPE.MATH;
        }

        return false;
    }

    public shrinkBubbleChat(timeShrink: number) {
        if (this.bubbleChat == null) return;

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

    public zoomBubbleChat(contentChat: string, showDuration) {
        if (this.bubbleChat == null) return;

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
        }, showDuration * 1000);
    }
}