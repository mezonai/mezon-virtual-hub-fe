import { _decorator, Component, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
import { AnimalFoodPrefab } from '../animal/AnimalFoodPrefab';
const { ccclass, property } = _decorator;

@ccclass('PetCatchingController')
export class PetCatchingController extends Component {
    @property(Prefab)
    foodPrefab: Prefab = null!;
    @property(Node)
    throwStartPosition: Node = null!;
    private duration: number = 0.6;
    private peakHeight: number = 35;

    public async throwFoodToPet(targetNode: Node, type: number): Promise<void> {
        console.log("throw: ", targetNode.name);
        const food = instantiate(this.foodPrefab);
        food.setParent(this.node);
        food.setWorldPosition(this.throwStartPosition.worldPosition);
        let foodPrefab =  food.getComponent(AnimalFoodPrefab);
        if(foodPrefab != null) foodPrefab.setFood(type);
        const start = this.throwStartPosition.worldPosition.clone();
        const end = targetNode.worldPosition.clone();
        let t = 0;
        await new Promise<void>((resolve) => {
            tween({})
                .to(this.duration, {}, {
                    onUpdate: (_, ratio: number) => {
                        t = ratio;
                        const pos = new Vec3(
                            start.x + (end.x - start.x) * t,
                            start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * this.peakHeight,
                            start.z + (end.z - start.z) * t
                        );
                        food.setWorldPosition(pos);
                    },
                    easing: 'linear'
                })
                .call(() => {
                    food.destroy();
                    resolve();
                })
                .start();

        })
    }
}


