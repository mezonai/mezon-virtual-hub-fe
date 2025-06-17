import { _decorator, Component, Label, Node } from 'cc';
import { RewardDisplayData } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('TooltipView')
export class TooltipView extends Component {
    @property(Label)
    public nameLabel: Label = null;
    @property(Label)
    public rateLabel: Label = null;
    @property(Node)
    public description: Node = null;

    setData(data: RewardDisplayData) {
        this.nameLabel.string = data.name;
        this.rateLabel.string = data.rate + " %";
        this.description.active = data.isItem;
    }
}