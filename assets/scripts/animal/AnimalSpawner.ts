import { _decorator, Component, Prefab, instantiate, Vec3, randomRange, Node, UITransform, CCFloat, Vec2, Tween } from 'cc';
import { PetDTO } from '../Model/PetDTO';
import { ObjectPoolManager } from '../pooling/ObjectPoolManager';
import { RandomlyMover } from '../utilities/RandomlyMover';
import { AnimalController, AnimalType } from './AnimalController';
import { PetClanColysesusObjectData, PetColysesusObjectData } from '../Model/Player';
import { AnimalClanController } from './AnimalClanController';
import { ClanPetDTO, PetClanDTO } from '../Model/Item';

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
    @property({ type: [AnimalController] })
    spawnedAnimals: AnimalController[] = [];

    @property({ type: [AnimalClanController] })
    spawnedClanPets: AnimalClanController[] = [];

    public spawnPet(petData: PetDTO[]) {
        for (const pet of petData) {
            if (pet.is_caught || pet.pet.species == "DragonIce")
                continue;
            let petObj = ObjectPoolManager.instance.spawnFromPool(pet.pet.species);
            if (petObj) {
                let petParent = this.getRandomZone();
                petObj.setParent(petParent.node);
                let area = this.getArea(petParent.node);
                petObj.setPosition(this.getRandomPositionInZone(area));
                let animal = petObj.getComponent(AnimalController);
                if (animal) {
                    this.spawnedAnimals.push(animal);
                    animal.setDataPet(pet, AnimalType.RandomMove, null, area);
                }
            }
        }
    }

    public spawnClanGuardPet(pet: PetClanColysesusObjectData) {
        if (!pet.isActive) return;

        const petType = pet.type.toString();
        const petObj = ObjectPoolManager.instance.spawnFromPool(petType+"Clan");
        if (!petObj) return;
        const zone = this.getRandomZone();
        petObj.setParent(zone.node);
        const area = this.getArea(zone.node);
        petObj.setPosition(this.getRandomPositionInZone(area));
        const controller = petObj.getComponent(AnimalClanController);
        if (!controller) {
            petObj.destroy();
            return;
        }

        controller.setGuardFarm(pet);
        this.spawnedClanPets.push(controller);
    }

    public updatePositionPetOnServer(petData: PetColysesusObjectData) {
        if (!petData) return;
        const petUpdate = this.spawnedAnimals.find(p => p.Pet.id === petData.pet.id);
        if (!petUpdate) return;
        petUpdate.syncPositionServer(petData);
    }

    public spawnPetOnServer(pet: PetColysesusObjectData) {
        if (!pet) return;
        let petObj = ObjectPoolManager.instance.spawnFromPool(pet.pet.species);
        if (petObj) {
            petObj.setParent(this.spawnMap);
            petObj.setPosition(new Vec3(pet.x, pet.y, 0));
            let animal = petObj.getComponent(AnimalController);
            if (animal) {
                this.spawnedAnimals.push(animal);
                animal.setDataPet(pet.pet, AnimalType.RandomMoveOnServer, null);
            }
        }
    }

    public removeClanPetById(petId: string) {
        console.log(
            '[removeClanPetById]',
            'input petId =', petId,
            'spawned =',
            this.spawnedClanPets.map(c => ({
                clanAnimalId: c?.Pet?.id,
                petClanId: c?.Pet?.petClanId,
            }))
        );

        const petIndex = this.spawnedClanPets.findIndex(
            controller => controller?.Pet?.id === petId
        );

        if (petIndex === -1) {
            console.warn("Clan pet not found:", petId);
            return;
        }

        const controller = this.spawnedClanPets[petIndex];

        // remove khỏi list
        this.spawnedClanPets.splice(petIndex, 1);

        // trả về pool
        controller.closeAnimal();
    }

    protected onDisable(): void {
        this.spawnedAnimals.forEach(animal => {
            if (animal) {
                animal.closeAnimal();
            }
        });
        this.spawnedAnimals = [];
        this.spawnedClanPets.forEach(pet => {
            pet?.closeAnimal();
        });
        this.spawnedClanPets = [];
    }

    public disappearedPet(id: string, isCaught: boolean) {// trường hợp pet di chuyển giữa các room
        let animal = this.getAnimalById(id);
        if (animal == null) return;
        const index = this.spawnedAnimals.indexOf(animal);
        if (index !== -1) {
            this.spawnedAnimals.splice(index, 1);
        }
        animal.closeAnimal(isCaught ? AnimalType.Caught : AnimalType.Disappeared);
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

    getRandomPositionInZone(area: Vec2): Vec3 {
        const x = (Math.random() * 2 - 1) * area.x;
        const y = (Math.random() * 2 - 1) * area.y;
        return new Vec3(x, y, 0);
    }

    getArea(zoneNode: Node): Vec2 {
        const uiTransform = zoneNode.getComponent(UITransform);
        if (uiTransform) {
            const areaSizeX = uiTransform.width / 2;
            const areaSizeY = uiTransform.height / 2;
            return new Vec2(areaSizeX, areaSizeY);
        }
    }
}

