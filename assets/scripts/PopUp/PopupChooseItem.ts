import { _decorator, Component, Node, Button, instantiate, Prefab, ScrollView, RichText } from 'cc';
import { PopupManager } from './PopupManager';
import { ClanWarehouseSlotDTO, InteractToSlotPayload } from '../Farm/EnumPlant';
import { BasePopup } from './BasePopup';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { UserManager } from '../core/UserManager';
import { FarmSlot } from '../Farm/FarmSlot';
import { ServerManager } from '../core/ServerManager';
import { InventoryClanType, ToolCategory } from '../Model/Item';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('PopupChooseItem')
export class PopupChooseItem extends BasePopup {
    @property(ScrollView) itemListParent: ScrollView = null!;
    @property(Prefab) plantItemPrefab: Prefab = null!;
    @property(Button) closeButton: Button = null!;
    @property(RichText) titlert: RichText = null!;
    @property(Node) noItem: Node = null!;

    public init(param: PopupChooseItemParam) {
        this.closeButton.addAsyncListener(async () => {
            this.closeButton.interactable = false;
            this.CloseUI();
            this.closeButton.interactable = true;
        });
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.StopMove();
        this.noItem.active = false;
        this.InitItemInventory(param);
    }

    private async CloseUI() {
        UserManager.instance.GetMyClientPlayer.get_MoveAbility.startMove();
        PopupManager.getInstance().closePopup(this.node.uuid);
    }

    isPlant(type: string): boolean {
        return type === InventoryClanType.PLANT;
    }

    getToolCategory(type: string): ToolCategory | null {
        if (type.startsWith('harvest_')) return ToolCategory.HARVEST;
        if (type.startsWith('growth_')) return ToolCategory.GROWTH;
        if (type.startsWith('interrupt_')) return ToolCategory.INTERRUPT;
        if (type.startsWith('lock_')) return ToolCategory.LOCK;
        return null;
    }

    public InitItemInventory(param: PopupChooseItemParam) {
        this.titlert.string = param.titlert;
        if (!this.node.isValid || !this.itemListParent?.content) return;
        this.itemListParent.content.removeAllChildren();
        const items = this.filterItems(param);
        if (!items.length){
            this.noItem.active = true;
            return;
        } 
        this.renderItems(items, param);
    }

    private filterItems(param: PopupChooseItemParam): ClanWarehouseSlotDTO[] {
        const baseFilter = (e: ClanWarehouseSlotDTO) =>
            !e.is_harvested && (!!e.plant || !!e.item);

        switch (param.filterType) {
            case InventoryClanType.PLANT:
                return param.inventory.filter(e =>
                    baseFilter(e) &&
                    e.type === InventoryClanType.PLANT &&
                    !!e.plant
                );

            case ToolCategory.HARVEST:
            case ToolCategory.GROWTH:
            case ToolCategory.INTERRUPT:
            case ToolCategory.LOCK:
                return param.inventory.filter(e =>
                    baseFilter(e) &&
                    this.getToolCategory(e.type) === param.filterType &&
                    !!e.item
                );

            default:
                console.warn('[filterItems] Unknown filterType', param.filterType);
                return [];
        }
    }

    private renderItems(
            items: ClanWarehouseSlotDTO[],
            param: PopupChooseItemParam
        ) {
        for (const element of items) {
            const slotNode = instantiate(this.plantItemPrefab);
            const uiItem = slotNode.getComponent(InventoryClanUIItem);
            if (!uiItem) continue;

            element.type === InventoryClanType.PLANT
                ? this.renderPlant(uiItem, element, param)
                : this.renderTool(uiItem, element, param);

            slotNode.setParent(this.itemListParent.content);
        }
    }

    private renderPlant( uiItem: InventoryClanUIItem, element: ClanWarehouseSlotDTO, param: PopupChooseItemParam
    ) {
        uiItem.initPlant(element, () => {
            if (!param.slotFarm?.data) return;

            UserManager.instance
                .GetMyClientPlayer
                .get_MoveAbility
                .startMove();

            const payload: InteractToSlotPayload = {
                farm_slot_id: param.slotFarm.data.id,
                plant_id: element.plant.id,
            };
            ServerManager.instance.sendPlantToSlot(payload);
            this.scheduleOnce(() => this.CloseUI(), 0);
        }, true);
    }

    private renderTool( uiItem: InventoryClanUIItem, element: ClanWarehouseSlotDTO, param: PopupChooseItemParam
    ) {
        uiItem.initTool(element, () => {
            const payload: InteractToSlotPayload = {
                farm_slot_id: param.slotFarm.data.id,
            };
            const toolId = element.item?.id;
            this.handleToolAction(param.filterType, payload, toolId);
            this.scheduleOnce(() => this.CloseUI(), 0);
        }, true);
    }

    private handleToolAction( type: InventoryClanType | ToolCategory, payload: InteractToSlotPayload, toolId: string
    ) {
        switch (type) {
            case ToolCategory.GROWTH:
                this.titlert.string = " Công Cụ Hỗ Trợ Trồng Cây ";
                if (!toolId) return;
                payload.growth_plant_tool_id = toolId;
                ServerManager.instance.sendDecreaseGrowthTimeToSlot(payload);
                break;
            case ToolCategory.HARVEST:
                this.titlert.string = " Công Cụ Hỗ Trợ Thu Hoạch ";
                if (!toolId) return;
                payload.harvest_tool_id = toolId;
                GameManager.instance.playerHubController.showBlockInteractHarvest(true);
                ServerManager.instance.sendHarvest(payload);
                break;
            default:
                break;
        }
    }
}

export interface PopupChooseItemParam {
    slotFarm: FarmSlot;
    inventory: ClanWarehouseSlotDTO[];
    filterType: InventoryClanType | ToolCategory;
    titlert: string;
}

