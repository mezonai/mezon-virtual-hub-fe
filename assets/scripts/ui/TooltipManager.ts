import { _decorator, Component, Node, Prefab, instantiate, UITransform, Vec3 } from 'cc';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { TooltipView } from './TooltipView';
import { RewardDisplayData } from '../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('TooltipManager')
export class TooltipManager extends Component {
    @property({ type: Prefab })
    tooltipUIPrefab: Prefab = null;

    @property({ type: Node })
    tooltipParentNode: Node = null;

    private currentTooltipInstance: Node = null;

    public showGlobalTooltip(data: RewardDisplayData, sourceNode: Node, ) {
        this.hideGlobalTooltip();

        if (!this.tooltipUIPrefab || !this.tooltipParentNode) {
            return;
        }

        this.currentTooltipInstance = ObjectPoolManager.instance.spawnFromPool(this.tooltipUIPrefab.name);
        if (!this.currentTooltipInstance) {
            return;
        }

        const tooltipView = this.currentTooltipInstance.getComponent(TooltipView);
        if (tooltipView) {
            tooltipView.setData(data);
        } else {
            ObjectPoolManager.instance.returnToPool(this.currentTooltipInstance);
            this.currentTooltipInstance = null;
            return;
        }

        this.currentTooltipInstance.setParent(this.tooltipParentNode);
        const sourceUITransform = sourceNode.getComponent(UITransform);
        const parentUITransform = this.tooltipParentNode.getComponent(UITransform);
        if (sourceUITransform && parentUITransform) {
            const worldPos = sourceUITransform.convertToWorldSpaceAR(Vec3.ZERO);
            const localPos = parentUITransform.convertToNodeSpaceAR(worldPos);
            this.currentTooltipInstance.setPosition(localPos.x + 42, localPos.y, localPos.z);
        }
    }

    public hideGlobalTooltip() {
        if (this.currentTooltipInstance) {
            ObjectPoolManager.instance.returnToPool(this.currentTooltipInstance);
            this.currentTooltipInstance = null;
        }
    }
}