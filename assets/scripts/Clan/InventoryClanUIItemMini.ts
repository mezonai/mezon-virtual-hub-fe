import { _decorator, Component, RichText } from 'cc';
import { IconItemUIHelper } from '../Reward/IconItemUIHelper';
import { IngredientDTO } from '../Model/Item';
import Utilities from '../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('InventoryClanUIItemMini')
export class InventoryClanUIItemMini extends Component {
  @property({ type: RichText }) quantity: RichText = null;
  @property({ type: IconItemUIHelper }) iconItemUIHelper: IconItemUIHelper = null;

  public setupItem(item: IngredientDTO, multiplier: number = 1) {
    this.iconItemUIHelper.getIconIngredient(item);

    const totalRequired = item.required_quantity * multiplier;
    const totalCurrent = item.current_quantity ?? 0;

    const currentStr = Utilities.convertBigNumberToStr(totalCurrent);
    const requiredStr = Utilities.convertBigNumberToStr(totalRequired);

    if (totalCurrent < totalRequired) {
      this.quantity.string =
        `<color=#ff4d4d>${currentStr}</color>` +
        `<color=#ffffff>/${requiredStr}</color>`;
    } else {
      this.quantity.string =
        `<color=#ffffff>${currentStr}/${requiredStr}</color>`;
    }
  }
}
