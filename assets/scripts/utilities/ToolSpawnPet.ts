import { _decorator, Button, Component, Node } from 'cc';
import { WebRequestManager } from '../network/WebRequestManager';
import { MapDTO } from '../Model/Player';
import ConvetData from '../core/ConvertData';
import { AnimalRarity } from '../Model/PetDTO';
import { MapType, SubMapType } from '../Interface/DataMapAPI';
const { ccclass, property } = _decorator;
type PetConfig = {
    species: string;
    numSpawn: number;
    catchChange: number;
    rarity: AnimalRarity;
};
@ccclass('ToolSpawnPet')
export class ToolSpawnPet extends Component {
    @property({ type: Button }) public btnCreatePetByRoom: Button;
    @property({ tooltip: "Nhập map Name" }) mapName: string = "hn1";
    @property({ tooltip: "Nhập sub map Name" }) subMapName: string = "office";

    @property({ type: Button }) public btnCreatePettAllRoom: Button;

    @property({ type: Button }) public btnDeletePettAllRoom: Button;

    @property({ type: Button }) public btnDeletePetByRoom: Button;
    @property({ tooltip: "Nhập map Name" }) mapNameDelete: string = "hn1";
    @property({ tooltip: "Nhập sub map Name" }) subMapNameDelete: string = "office";

    numSpawnDog: number = 2;
    cactChangeDog: number = 3;
    rarityDog: AnimalRarity = AnimalRarity.RARE;

    numSpawnCat: number = 2;
    cactChangeCat: number = 2;
    rarityCat: AnimalRarity = AnimalRarity.COMMON;

    numSpawnBird: number = 2;
    cactChangeBird: number = 2;
    rarityBird: AnimalRarity = AnimalRarity.COMMON;

    numSpawnRabit: number = 2;
    cactChangeRabit: number = 2;
    rarityRabit: AnimalRarity = AnimalRarity.COMMON;

    numSpawnPokemon: number = 2;
    cactChangePokemon: number = 6;
    rarityPokemon: AnimalRarity = AnimalRarity.EPIC;

    numSpawnSika: number = 2;
    cactChangeSika: number = 3;
    raritySika: AnimalRarity = AnimalRarity.RARE;

    numSpawnDragon: number = 2;
    cactChangeDragon: number = 6;
    rarityDragon: AnimalRarity = AnimalRarity.EPIC;

    numSpawnDragonIce: number = 2;
    cactChangeDragonIce: number = 10;
    rarityDragonIce: AnimalRarity = AnimalRarity.LEGENDARY;



    map: string[] = ["hn1", "hn2", "hn3", "vinh", "dn", "qn", "sg"];
    subMap: string[] = ["", "office"];

    start() {
        this.btnCreatePettAllRoom.node.on(Button.EventType.CLICK, () => {
            this.createPetAllRoom();
        });

        this.btnCreatePetByRoom.node.on(Button.EventType.CLICK, () => {
            this.createPetByRoom();
        });

        this.btnDeletePettAllRoom.node.on(Button.EventType.CLICK, () => {
            this.deletePetAllRoom();
        });
        this.btnDeletePetByRoom.node.on(Button.EventType.CLICK, () => {
            this.deletePetByRoom();
        });
    }

    createPetByRoom() {
        WebRequestManager.instance.getAllPetData(
            this.subMapName == "" ? this.mapName : `${this.mapName}-${this.subMapName}`,
            (response) => this.onGetAllPetDataCreate(response, this.mapName, this.subMapName),
            (error) => this.onError(error)
        );
    }

    deletePetByRoom() {
        WebRequestManager.instance.getAllPetData(
            this.subMapNameDelete == "" ? this.mapNameDelete : `${this.mapNameDelete}-${this.subMapNameDelete}`,
            (response) => this.onGetAllPetDataDelete(response),
            (error) => this.onError(error)
        );
    }

    createPetAllRoom() {
        for (let map of this.map) {
            for (let submap of this.subMap) {
                WebRequestManager.instance.getAllPetData(
                    submap == "" ? map : `${map}-${submap}`,
                    (response) => this.onGetAllPetDataCreate(response, map, submap),
                    (error) => this.onError(error)
                );
            }
        }
    }
    deletePetAllRoom() {
        for (let map of this.map) {
            for (let submap of this.subMap) {
                WebRequestManager.instance.getAllPetData(
                    submap == "" ? map : `${map}-${submap}`,
                    (response) => this.onGetAllPetDataDelete(response),
                    (error) => this.onError(error)
                );
            }
        }
    }

    private onGetAllPetDataCreate(response, map: string, submap: string) {
        const petData = response.data;
        if (!petData) return;

        const petConfigs: PetConfig[] = [
            { species: "Dog", numSpawn: this.numSpawnDog, catchChange: this.cactChangeDog, rarity: this.rarityDog },
            { species: "Cat", numSpawn: this.numSpawnCat, catchChange: this.cactChangeCat, rarity: this.rarityCat },
            { species: "Bird", numSpawn: this.numSpawnBird, catchChange: this.cactChangeBird, rarity: this.rarityBird },
            { species: "Rabit", numSpawn: this.numSpawnRabit, catchChange: this.cactChangeRabit, rarity: this.rarityRabit },
            { species: "Pokemon", numSpawn: this.numSpawnPokemon, catchChange: this.cactChangePokemon, rarity: this.rarityPokemon },
            { species: "Sika", numSpawn: this.numSpawnSika, catchChange: this.cactChangeSika, rarity: this.raritySika },
            { species: "Dragon", numSpawn: this.numSpawnDragon, catchChange: this.cactChangeDragon, rarity: this.rarityDragon },
            { species: "DragonIce", numSpawn: this.numSpawnDragonIce, catchChange: this.cactChangeDragonIce, rarity: this.rarityDragonIce }
        ];

        for (const config of petConfigs) {
            const existing = petData.filter(pet => pet.species === config.species);
            const countToCreate = config.numSpawn - existing.length;

            for (let i = 0; i < countToCreate; i++) {
                this.createPet(config.species, config.catchChange, map, submap, config.rarity);
            }
        }
    }

    createPet(species: string, catchChange: number, map: string, submap: string, rarity: AnimalRarity) {
        let petData;

        if (submap === "") {
            petData = {
                species,
                name: species,
                catch_chance: catchChange,
                map,
                rarity
            };
        } else {
            petData = {
                species,
                name: species,
                catch_chance: catchChange,
                map,
                sub_map: submap,
                rarity
            };
        }

        WebRequestManager.instance.createPet(
            petData,
            () => console.log(`Tạo ${species} thành công.`),
            (error) => this.onError(error)
        );
    }

    private onGetAllPetDataDelete(response) {
        const petData = response.data;
        if (!petData) return;

        for (const pet of petData) {
            WebRequestManager.instance.deletePet(
                pet.id,
                (response) => console.log(`xóa ${pet.name} thành công.`),
                (error) => this.onError(error)
            );
        }
    }

    private onError(error: any) {
        console.error("Error occurred:", error);
        if (error?.message) {
            console.error("Error message:", error.message);
        }
    }
}


