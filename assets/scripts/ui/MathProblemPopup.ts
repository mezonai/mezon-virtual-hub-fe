import { _decorator, Button, Component, Label, Node, RichText } from 'cc';
import { ServerManager } from '../core/ServerManager';
import { UIIdentify } from './UIIdentify';
const { ccclass, property } = _decorator;

@ccclass('MathProblemPopup')
export class MathProblemPopup extends Component {
    @property({type: RichText}) question: RichText = null;
    @property({type: [Button]}) options: Button[] = [];
    private id: string = "";

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
        this.node.getComponent(UIIdentify).hide();
    }
}