import { _decorator, Component, Node, Label, RichText, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TalkAnimation')
export class TalkAnimation extends Component {
    @property(Node) bubbleChat: Node = null;
    @property(Label) contentBubbleChat: Label = null;
    private tweenAction: Tween<Node> | null = null;
    private hideTimeout: number | null = null;

    protected onLoad(): void {
        //this.bubbleChat.setScale(0, 1, 1);
    }

    canShowBubbleChat(): boolean {
        return this.bubbleChat.scale.x <= 0.95;
    }

    showBubbleChat(content: string, duration: number, onComplete?: () => void) {
        if (!this.canShowBubbleChat()) {
            return;
        }
        this.zoomBubbleChat(content, duration, onComplete);
    }

    showBubbleChatCombat(content: string, duration: number, onComplete?: () => void) {
        this.zoomBubbleChatCombat(content, duration, onComplete);
    }

    zoomBubbleChatCombat(textShow: string, timeShow: number, onComplete?: () => void) {
        let text = '';
        let index = 0;
        const totalLength = textShow.length;
        const interval = timeShow / totalLength;

        const callback = () => {
            if (index < totalLength) {
                text += textShow[index];
                this.contentBubbleChat.string = text;
                index++;
            } else {
                this.unschedule(callback);
                setTimeout(() => {
                    this.contentBubbleChat.string = "";
                    if (onComplete) {
                        onComplete();
                    }
                }, 500);
            }
        };

        this.schedule(callback, interval);
    }

    public zoomBubbleChat(contentChat: string, duration: number, onComplete?: () => void) {
        this.contentBubbleChat.string = ''
        if (this.tweenAction) {
            this.tweenAction.stop();
        }

        if (this.hideTimeout !== null) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        this.bubbleChat.setScale(0, 1, 1);
        this.tweenAction = tween(this.bubbleChat)
            .to(0.5, {
                scale: new Vec3(1, 1, 1),
            }, { easing: 'backOut' })
            .call(() => {
                this.displayDialog(contentChat, duration, onComplete);
            })
            .start();
    }

    public shrinkBubbleChat(timeShrink: number, onComplete?: () => void) {
        if (this.tweenAction) {
            this.tweenAction.stop();
        }

        this.tweenAction = tween(this.bubbleChat)
            .to(timeShrink, {
                scale: new Vec3(0, 1, 1),
            }, { easing: 'backIn' })
            .call(() => {
                this.tweenAction = null;
                if (onComplete) {
                    onComplete();
                }
            })
            .start();
    }

    displayDialog(textShow: string, timeShow: number, onComplete?: () => void) {
        let text = '';
        let index = 0;
        const totalLength = textShow.length;
        const interval = timeShow / totalLength;

        const callback = () => {
            if (index < totalLength) {
                text += textShow[index];
                this.contentBubbleChat.string = text;
                index++;
            } else {
                this.unschedule(callback);
                setTimeout(() => {
                    this.shrinkBubbleChat(0.5, onComplete);
                }, 500);

            }
        };

        this.schedule(callback, interval);
    }
}


