import { _decorator, Node, Vec3, UITransform, Prefab } from 'cc';
import { TooltipManager } from './TooltipManager';
import { RewardDisplayData } from '../Model/Item';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { TooltipView } from './TooltipView';
const { ccclass, property } = _decorator;

@ccclass('SlotTooltip')
export class SlotTooltip extends TooltipManager {
    @property({ type: Prefab })
    tooltipUIPrefab: Prefab = null;
    tooltipParentNode: Node = null;
    private data: RewardDisplayData;

    public setFullValue(data: RewardDisplayData, parentHover: Node) {
        this.data = data;
        this.tooltipParentNode = parentHover;
    }

    onLoad() {
        super.onLoad();
    }

    public override onHoverShow() {
        this.showGlobalTooltip(this.data, this.node);
    }

    public override onHoverHide() {
        this.hideGlobalTooltip();
    }

    public showGlobalTooltip(data: RewardDisplayData, sourceNode: Node,) {
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

    onDestroy() {
        super.onDestroy();
        this.onHoverHide();
    }
}