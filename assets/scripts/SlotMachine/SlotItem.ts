import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { RewardDisplayData } from '../Model/Item';
import { SlotTooltip } from '../Tooltip/SlotToolTip';
const { ccclass, property } = _decorator;

@ccclass('SlotItem')
export class SlotItem extends Component {
   @property({ type: Sprite }) iconFrame: Sprite = null;
   public iconSF: SpriteFrame[] = [];
   @property({ type: SlotTooltip }) slotTooltip: SlotTooltip = null;

   setupIcon(data: RewardDisplayData, parentHover: Node) {
      this.iconFrame.spriteFrame = data.spriteFrame;
      this.slotTooltip.setFullValue(data, parentHover);
   }
}