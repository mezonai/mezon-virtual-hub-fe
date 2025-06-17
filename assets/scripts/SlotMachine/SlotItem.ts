import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SlotTooltip } from '../ui/SlotToolTip';
import { TooltipManager } from '../ui/TooltipManager';
import { RewardDisplayData } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('SlotItem')
export class SlotItem extends Component {
   @property({ type: Sprite }) iconFrame: Sprite = null;
   public iconSF: SpriteFrame[] = [];
   @property({ type: SlotTooltip }) slotTooltip: SlotTooltip = null;

   setupIcon(tooltipManager: TooltipManager, data: RewardDisplayData) {
      this.iconFrame.spriteFrame = data.spriteFrame;
      this.slotTooltip.setFullValue(tooltipManager, data);
   }
}