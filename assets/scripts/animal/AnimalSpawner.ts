import { _decorator, Component, Prefab, instantiate, Vec3, randomRange, Node, UITransform, CCFloat, Vec2, Tween } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { AnimalController, AnimalType } from './AnimalController';
import { PetColysesusObjectData } from '../Model/Player';

const { ccclass, property } = _decorator;

@ccclass('SpawnZone')
export class SpawnZone {
    @property({ type: Node }) node: Node;
    @property({ type: CCFloat }) weight: number;
};
@ccclass('AnimalSpawner')
export class AnimalSpawner extends Component {
    @property({ type: [SpawnZone] }) spawnZones: SpawnZone[] = [];
    @property({ type: Node }) spawnMap: Node;// Area nguyên map
    @property spawnedAnimals: AnimalController[] = [];

    public spawnPet(petData: PetDTO[]) {
        for (const pet of petData) {           
            if (pet.is_caught || pet.species == "DragonIce")
                continue;
            let petObj = ObjectPoolManager.instance.spawnFromPool(pet.species);
            if (petObj) {
                let petParent = this.getRandomZone();
                petObj.setParent(petParent.node);
                petObj.setPosition(this.getRandomPositionInZone(petParent.node));
                let mover = petObj.getComponent(RandomlyMover);
                const { bound } = this.getZoneBounds(petParent.node);
                let animal = petObj.getComponent(AnimalController);
                if (animal) {
                    this.spawnedAnimals.push(animal);
                    animal.setDataPet(pet, AnimalType.RandomMove, null, new Vec2(bound.x, bound.y));
                }
            }
        }
    }

    public updatePositionPetOnServer(petData: PetColysesusObjectData) {
        if (!petData) return;
        const petUpdate = this.spawnedAnimals.find(p => p.Pet.id === petData.pet.id);
        if(!petUpdate) return;
        petUpdate.syncPositionServer(petData);        
    }

    public spawnPetOnServer(pet: PetColysesusObjectData) {
        if (!pet) return;
        let petObj = ObjectPoolManager.instance.spawnFromPool(pet.pet.species);
        if (petObj) {
            let petParent = this.spawnZones[1];
            petObj.setParent(this.spawnMap);
            petObj.setPosition(new Vec3(pet.x, pet.y, 0));
            let animal = petObj.getComponent(AnimalController);
            if (animal) {
                this.spawnedAnimals.push(animal);
                animal.setDataPet(pet.pet, AnimalType.RandomMoveOnServer, null);
            }
        }
    }


    protected onDisable(): void {
        this.spawnedAnimals.forEach(animal => {
            if (animal) {
                animal.closeAnimal();
            }
        });
    }

    public setAnimalCaught(id: string) {
        let animal = this.getAnimalById(id);
        if (animal == null) return;
        animal.closeAnimal(AnimalType.Caught);
    }

    public disappearedPet(id: string) {// trường hợp pet di chuyển giữa các room
        let animal = this.getAnimalById(id);
        if (animal == null) return;
        animal.closeAnimal(AnimalType.Disappeared);
    }

    public getAnimalById(id: string): AnimalController | null {
        return this.spawnedAnimals.find(animal => animal.Pet.id === id) || null;
    }

    // get a random spawn zone based on weighted random selection
    getRandomZone(): SpawnZone {
        const totalWeight = this.spawnZones.reduce((sum, z) => sum + z.weight, 0);
        const rand = Math.random() * totalWeight;
        let accum = 0;

        for (const z of this.spawnZones) {
            accum += z.weight;
            if (rand <= accum) return z;
        }

        return this.spawnZones[0];
    }

    // Get the bounds of a zone node (min and max positions)
    getZoneBounds(zoneNode: Node): { min: Vec3, max: Vec3, bound: Vec3 } {
        const pos = zoneNode.getWorldPosition();
        const uiTransform = zoneNode.getComponent(UITransform);
        const size = uiTransform ? uiTransform.contentSize : new Vec3(200, 200, 0);

        const halfWidth = (size.x) / 2;
        const halfHeight = (size.y) / 2;

        return {
            min: new Vec3(pos.x - halfWidth, pos.y - halfHeight, 0),
            max: new Vec3(pos.x + halfWidth, pos.y + halfHeight, 0),
            bound: new Vec3(halfWidth, halfHeight)
        };
    }

    getRandomPositionInZone(zoneNode: Node): Vec3 {
        const { min, max } = this.getZoneBounds(zoneNode);
        const x = randomRange(min.x, max.x);
        const y = randomRange(min.y, max.y);
        return new Vec3(x, y, 0);
    }
}

