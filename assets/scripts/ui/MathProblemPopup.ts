import { _decorator, Button, Component, Label, Node, RichText } from 'cc';
import { ServerManager } from '../core/ServerManager';
import { UIIdentify } from './UIIdentify';
import { BasePopup } from '../PopUp/BasePopup';
import { PopupManager } from '../PopUp/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('MathProblemPopup')
export class MathProblemPopup extends BasePopup {
    @property({type: RichText}) question: RichText = null;
    @property({type: Button}) options: Button[] = [];
    @property({type: Button}) close: Button = null;
    private id: string = "";
    
    public init(param?: MathProblemParam): void {
        this.close.node.on(Button.EventType.CLICK, this.closePopup, this);
        if (!param) return;
        this.setData(param.id, param.question, param.options);
    }

    public setData(id, question, options) {
        this.id = id;
        this.question.string = question;

        this.options.forEach(button => {
            button.node.off(Node.EventType.TOUCH_START);
        });
       for (let i = 0; i < options.length; i++) {
            if (i < this.options.length) {
                this.options[i].getComponentInChildren(Label).string = options[i];
                this.options[i].node.once(Node.EventType.TOUCH_START, () => {
                    this.onChooseOption(options[i])
                }, this);
            }
       }
    }

    private onChooseOption(answer: string) {
        ServerManager.instance.answerMathQuestion(this.id, answer.trim());
        this.closePopup();
    }

    public closePopup(){
        PopupManager.getInstance().closePopup(this.node?.uuid);
    }
}

export interface MathProblemParam {
    id: string;
    question: string;
    options: string[];
}