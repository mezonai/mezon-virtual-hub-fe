import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TooltipView')
export class TooltipView extends Component {
    @property(Label)
    public nameLabel: Label = null;
    @property(Label)
    public rateLabel: Label = null;

    setData(name: string, rate: string) {
        this.nameLabel.string = name;
        this.rateLabel.string = rate + " %";
    }
}