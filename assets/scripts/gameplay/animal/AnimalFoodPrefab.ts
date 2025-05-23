import { _decorator, Component, Node } from 'cc';
import { FoodType } from '../../Model/Item';
const { ccclass, property } = _decorator;

@ccclass('AnimalFoodPrefab')
export class AnimalFoodPrefab extends Component {

   @property({ type: Node }) foods: Node[] = [];

   setFood(foodType: FoodType) {
      const typeToIndexMap: Record<FoodType, number> = {
         [FoodType.NORMAL]: 0,
         [FoodType.PREMIUM]: 1,
         [FoodType.ULTRA_PREMIUM]: 2
      };
      this.foods.forEach((food, i) => {
         food.active = i === typeToIndexMap[foodType];
      });
   }
}


