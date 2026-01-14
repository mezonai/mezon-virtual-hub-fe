import { _decorator, Component, Node, RichText, Button } from 'cc';
import { AudioType, SoundManager } from '../core/SoundManager';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { ServerManager } from '../core/ServerManager';
import { WebRequestManager } from '../network/WebRequestManager';
import { UserMeManager } from '../core/UserMeManager';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { InventoryClanType } from '../Model/Item';
import { ClanWarehouseSlotDTO } from '../Farm/EnumPlant';
const { ccclass, property } = _decorator;

@ccclass('PopupActionInterruptHarvest')
export class PopupActionInterruptHarvest extends BasePopup {
    @property({ type: Button }) buttonLeft: Button = null;
    @property({ type: Button }) buttonRight: Button = null;
    @property({ type: InventoryClanUIItem }) inventoryClanUIItem: InventoryClanUIItem[] = [];
    @property(Node) noItem: Node = null!;

    public init(param?: PopupActionInterruptHarvestParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        SoundManager.instance.playSound(AudioType.Notice);

        this.buttonLeft.node.on(Button.EventType.CLICK, () => {
            this.InterruptHarvestNormal(param);
            this.closePopup();
        }, this);

        this.buttonRight.node.on(Button.EventType.CLICK, () => {
            this.closePopup();
        }, this);

        this.noItem.active = false;
        this.GetInventory(param);
    }

    private filterInterruptTools(inventory: ClanWarehouseSlotDTO[]) {
        return inventory.filter(e =>
            !!e.item &&
            e.type.startsWith('interrupt_')
        );
    }

    async GetInventory(param: PopupActionInterruptHarvestParam) {
        const interruptItems = this.filterInterruptTools(param.inventory);
        if (!interruptItems.length){
            this.noItem.active = true;
            return;
        } 
        this.renderInterruptItems(interruptItems, param);
    }

    private renderInterruptItems( items: ClanWarehouseSlotDTO[], param: PopupActionInterruptHarvestParam
    ) {
        for (let i = 0; i < this.inventoryClanUIItem.length; i++) {
            const uiItem = this.inventoryClanUIItem[i];

            const data = items[i];
            if (!data) {
                uiItem.node.active = false;
                continue;
            }
            uiItem.node.active = true;
            uiItem.initTool(
                data,
                () => {
                    this.sendInterrupt(param, data.item.id);
                },
                true
            );
        }
    }

    private sendInterrupt(param: PopupActionInterruptHarvestParam, toolId?: string
    ) {
        ServerManager.instance.sendInterruptHarvest({
            fromPlayerId: param.fromPlayerId,
            farm_slot_id: param.farm_slot_id,
            interrupt_tool_id: toolId,
        });

        this.scheduleOnce(() => {
            this.closePopup();
        }, 0);
    }

    closePopup() {
        PopupManager.getInstance().closePopup(this.node?.uuid);
    }

    InterruptHarvestNormal(param: PopupActionInterruptHarvestParam) {
        let data = {
            fromPlayerId: param.fromPlayerId,
            farm_slot_id: param.farm_slot_id,
        }
        ServerManager.instance.sendInterruptHarvest(data)
    }
}

export interface PopupActionInterruptHarvestParam {
    fromPlayerId: string;
    farm_slot_id: string;
    inventory: ClanWarehouseSlotDTO[];
}