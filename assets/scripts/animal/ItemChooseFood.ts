import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Toggle } from 'cc';
import { Food, FoodType, InventoryDTO } from '../Model/Item';
import { UserMeManager } from '../core/UserMeManager';
const { ccclass, property } = _decorator;

@ccclass('ItemChooseFood')
export class ItemChooseFood extends Component {
    @property({ type: Toggle }) toggle: Toggle = null;
    @property({ type: Sprite }) spriteicon: Sprite = null;
    @property({ type: Label }) quantity: Label = null;
    @property({ type: [SpriteFrame] }) spriteFramesFood: SpriteFrame[] = [];
    public boundToggleCallback: () => void;

    setDataItem(food: Food, onToggleClick: (foodChoosen: Food, quantity: number) => void) {
        const typeToIndexMap: Record<FoodType, number> = {
        [FoodType.NORMAL]: 0,
        [FoodType.PREMIUM]: 1,
        [FoodType.ULTRA_PREMIUM]: 2
    };  
        this.spriteicon.spriteFrame = this.spriteFramesFood[typeToIndexMap[food.type]];
        const foodDTO = UserMeManager.GetFoods?.find(inv => inv.food?.type === food.type);
        const quantity = foodDTO?.quantity ?? 0;
        this.quantity.string = quantity.toString();
        this.boundToggleCallback = () => {
            if (onToggleClick) {
                if(!this.toggle.isChecked) return;
                onToggleClick(food, quantity);
            }
        };
        this.toggle.node.on(Toggle.EventType.TOGGLE, this.boundToggleCallback, this);
    }

    // protected onDisable(): void {
    //     this.toggle.node.off(Toggle.EventType.TOGGLE, this.boundToggleCallback, this);
    // }
}


