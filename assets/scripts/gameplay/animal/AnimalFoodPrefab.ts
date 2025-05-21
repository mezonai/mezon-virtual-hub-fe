import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimalFoodPrefab')
export class AnimalFoodPrefab extends Component {
    
     @property({ type: Node }) foods: Node[] = [];

     setFood(type: number){
        this.foods.forEach((food, i) => food.active = i === type);
     }
}


