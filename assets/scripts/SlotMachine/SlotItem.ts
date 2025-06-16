import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SlotTooltip } from '../ui/SlotToolTip';
import { TooltipManager } from '../ui/TooltipManager';
const { ccclass, property } = _decorator;

@ccclass('SlotItem')
export class SlotItem extends Component {
   @property({ type: Sprite }) iconFrame: Sprite = null;
   public iconSF: SpriteFrame[] = [];
   @property({ type: SlotTooltip }) slotTooltip: SlotTooltip = null;

   setupIcon(tooltipManager: TooltipManager, iconReceive: SpriteFrame, name: string, rate: number = 0) {
      this.iconFrame.spriteFrame = iconReceive;
      this.slotTooltip.setFullValue(name, rate, tooltipManager);
   }
}