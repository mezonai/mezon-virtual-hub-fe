import { _decorator, Component, Node, Vec3 } from 'cc';
import { AnimalMover, AnimalMoveType } from './AnimalMover';
import { PlayerController } from '../gameplay/player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('AnimalController')
export class AnimalController extends Component {
    @property({ type: AnimalMover }) animalMover: AnimalMover | null = null;
    private animalPlayer: PlayerController = null;
    private animalId: number = 0;

    setDataPet(id: number, owner: PlayerController = null) {
        this.animalPlayer = owner;
        this.animalId = id;
        this.animalMover.SetAnimalAction(owner == null ? AnimalMoveType.RandomMove :AnimalMoveType.FollowTarget, owner == null ? null:owner.node);  
    }
}



