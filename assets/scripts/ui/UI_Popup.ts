import { _decorator, Button, Component, Label, RichText } from "cc";
import { UIIdentify } from "./UIIdentify";

const { ccclass, property } = _decorator;

@ccclass
export default class UIPopup extends Component {

    @property({
        type: Button
    }) public btn_Ok: Button;

    @property({
        type: Button
    }) public btn_Yes: Button;

    @property({
        type: Button
    }) public btn_No: Button;

    @property({
        type: RichText
    }) public txt_Ok: RichText;
    @property({
        type: RichText
    }) public txt_Yes: RichText;

    @property({
        type: RichText
    }) public txt_No: RichText;

    @property({
        type: RichText
    }) public title: RichText;

    @property({
        type: RichText
    }) public content: RichText;
    @property({
        type: Label
    }) public contentLabel: Label;
    @property({
        type: RichText
    }) public countDownText: RichText;

    @property({
        type: UIIdentify
    }) public popup: UIIdentify;

    private timeoutIntervalId: number = 0;
    private timeoutCloseId: number = 0;

    public showMessageTimeout(content: string, closeAfter: number) {
        this.clearListener();
        this.showPopup("", content);

        this.closeAfterTimeout("", "s", this.countDownText, closeAfter);
    }

    private closeAfterTimeout(prefix: string, afterfix: string, text: RichText, closeAfter: number) {
        text.string = prefix + closeAfter.toString() + afterfix;
        clearInterval(this.timeoutIntervalId);
        clearTimeout(this.timeoutCloseId);
        this.timeoutIntervalId = setInterval(() => {
            closeAfter--;
            text.string = prefix + closeAfter.toString() + afterfix;
        }, 1000);
        this.timeoutCloseId = setTimeout(() => {
            this.hide();
        }, closeAfter * 1000);
    }

    public showOkPopup(title: string, content: string, callback = null, txt_Ok: string = "Ok", closeAfter: number = -1): void {
        let popupTitle = title ? title : "Chú ý";
        this.clearListener();
        this.showPopup(popupTitle, content);

        this.showOkButton(true);

        if (closeAfter > 0) {
            this.closeAfterTimeout(txt_Ok + "(", "s)", this.txt_Ok, closeAfter);
        }

        //Change string
        if (this.txt_Ok)
            this.txt_Ok.string = txt_Ok;

        if (callback != null) {
            if (this.btn_Ok)
                this.btn_Ok.node.once('click', callback, this);
        }
    };

    public showYesNoPopup(title: string, content: string, yesCallback, txt_Yes: string, txt_No: string, noCallback, closeAfter: number = -1): void {
        this.clearListener();
        let popupTitle = title ? title : "Chú ý";
        this.showPopup(popupTitle, content);

        this.showOkButton(false);

       
        //Change string
        if (this.txt_Yes && txt_Yes)
            this.txt_Yes.string = txt_Yes;
        if (this.txt_No && txt_No)
            this.txt_No.string = txt_No;

        if (this.btn_Yes)
            this.btn_Yes.node.on('click', () => {
                yesCallback();
            }, this);
        if (noCallback != null) {
            if (this.btn_No)
                this.btn_No.node.on('click', () => {
                    noCallback();
                }, this);
        }

        if (closeAfter > 0) {
            this.closeAfterTimeout(txt_Yes + " (", "s)", this.txt_Yes, closeAfter);
        }
    };

    private clearListener(): void {
        if (this.btn_No)
            this.btn_No.node.off("click")
        if (this.btn_Yes)
            this.btn_Yes.node.off("click")
        if (this.btn_Ok)
            this.btn_Ok.node.off("click")
        //Re-assign hide
        if (this.btn_Yes)
            this.btn_Yes.node.on('click', this.hide, this);
        if (this.btn_No)
            this.btn_No.node.on('click', this.hide, this);
        if (this.btn_Ok)
            this.btn_Ok.node.on('click', this.hide, this);
    }

    private showOkButton(isActive: boolean): void {
        if (this.btn_Ok)
            this.btn_Ok.node.active = isActive;
        if (this.btn_Yes)
            this.btn_Yes.node.active = !isActive;
        if (this.btn_No)
            this.btn_No.node.active = !isActive;
    };

    public hide(): void {
        clearInterval(this.timeoutIntervalId);
        this.popup.hide();
    };

    private showPopup(title: string, content: string): void {
        //Fake data
        if (title) {
            this.title.string = title;
        }

        if (content) {
            this.content.string = content;
        }
        if (this.contentLabel) {
            this.contentLabel.string = content;
        }
        this.popup.show();
    };
}
