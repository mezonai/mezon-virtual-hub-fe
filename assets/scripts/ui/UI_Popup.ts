import { _decorator, Button, Component, Label } from "cc";
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
        type: Label
    }) public txt_Ok: Label;
    @property({
        type: Label
    }) public txt_Yes: Label;

    @property({
        type: Label
    }) public txt_No: Label;

    @property({
        type: Label
    }) public title: Label;

    @property({
        type: Label
    }) public content: Label;

    @property({
        type: UIIdentify
    }) public popup: UIIdentify;

    start() {
        ; // show script in inspector
        this.clearListener();
    }

    public showOkPopup(title: string, content: string, callback = null, txt_Ok: string = "Ok"): void {

        this.showPopup(title, content);
        
        this.showOkButton(true);

        //Change string
        if (this.txt_Ok)
            this.txt_Ok.string = txt_Ok;

        if (callback != null){
            if (this.btn_Ok)
                this.btn_Ok.node.once('click', callback, this);
        }
    };

    public showYesNoPopup(title: string, content: string, yesCallback, txt_Yes: string, txt_No: string, noCallback, isResetVisual): void {

        this.showPopup(title, content);

        this.showOkButton(false);

        //Change string
        if (this.txt_Yes)
            this.txt_Yes.string = txt_Yes;
        if (this.txt_No)
            this.txt_No.string = txt_No;

        if (this.btn_Yes)
            this.btn_Yes.node.once('click', yesCallback, this);
        if (noCallback != null)
        {
            if (this.btn_No)
                this.btn_No.node.once('click', noCallback, this);
        }
    };

    private clearListener(): void {
        if (this.btn_No)
            this.btn_No.clickEvents = [];
        if (this.btn_Yes)
            this.btn_Yes.clickEvents = [];
        this.btn_Ok.clickEvents = [];

        //Re-assign hide
        if (this.btn_Yes)
            this.btn_Yes.node.on('click', this.hide, this);
        if (this.btn_No)
            this.btn_No.node.on('click', this.hide, this);
        this.btn_Ok.node.on('click', this.hide, this);
    }

    private showOkButton(isActive: boolean): void {
        this.btn_Ok.node.active = isActive;
        if (this.btn_Yes)
            this.btn_Yes.node.active = !isActive;
        if (this.btn_No)
            this.btn_No.node.active = !isActive;
    };

    public hide(): void {
        this.popup.hide();
    };

    private showPopup(title: string, content: string): void {
        //Fake data
        this.title.string = title;
        
        this.content.string = content;
        this.popup.show();
    };
}
