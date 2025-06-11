import { _decorator, Button, Component, EditBox, Label, Node } from 'cc';
import { WebRequestManager } from '../network/WebRequestManager';
import { MapDTO } from '../Model/Player';
import ConvetData from '../core/ConvertData';
import { AnimalRarity } from '../Model/PetDTO';
import { DropDown } from './Dropdown/DropDown';
const { ccclass, property } = _decorator;
type PetConfig = {
    species: string;
    numSpawn: number;
    catchChange: number;
    rarity: AnimalRarity;
};
@ccclass('ToolSpawnPet')
export class ToolSpawnPet extends Component {
    @property({ type: Button }) public buttonClose: Button;
    //Dog
    @property({ type: DropDown }) public dropdownDog: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentDog: EditBox = null;
    @property({ type: EditBox }) quantityDog: EditBox = null!;

    //Bird
    @property({ type: DropDown }) public dropdownBird: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentBird: EditBox = null;
    @property({ type: EditBox }) quantityBird: EditBox = null!;
    //Cat
    @property({ type: DropDown }) public dropdownCat: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentCat: EditBox = null;
    @property({ type: EditBox }) quantityCat: EditBox = null!;
    //Dragon
    @property({ type: DropDown }) public dropdownDragon: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentDragon: EditBox = null;
    @property({ type: EditBox }) quantityDragon: EditBox = null!;
    //Pokemon
    @property({ type: DropDown }) public dropdownPokemon: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentPokemon: EditBox = null;
    @property({ type: EditBox }) quantityPokemon: EditBox = null!;
    //Rabit
    @property({ type: DropDown }) public dropdownRabit: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentRabit: EditBox = null;
    @property({ type: EditBox }) quantityRabit: EditBox = null!;
    //Sika
    @property({ type: DropDown }) public dropdownSika: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentSika: EditBox = null;
    @property({ type: EditBox }) quantitySika: EditBox = null!;
    //PhonenixIce
    @property({ type: DropDown }) public dropdownPhonenixIce: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentPhonenixIce: EditBox = null;
    @property({ type: EditBox }) quantityPhonenixIce: EditBox = null!;
    //DragonIce
    @property({ type: DropDown }) public dropdownDragonIce: DropDown = null;
    @property({ type: EditBox }) public editBoxCatchPercentDragonIce: EditBox = null;
    @property({ type: EditBox }) quantityDragonIce: EditBox = null!;
    //Create
    @property({ type: Button }) public btnCreatePet: Button;
    @property({ type: DropDown }) public dropdownRoomCreate: DropDown = null;
    //Delete
    @property({ type: Button }) public btnDeletePet: Button;
    @property({ type: DropDown }) public dropdownRoomDelete: DropDown = null;

    defaultQuantity: number = 0;

    map: string[] = ["all", "hn1", "hn1-office", "hn2", "hn2-office", "hn3", "hn3-office", "vinh", "vinh-office", "dn", "dn-office", "qn-office", "qn", "sg", "sg-office"];
    allmap: string[] = ["hn1", "hn2", "hn3", "vinh", "dn", "qn", "sg"];
    subMap: string[] = ["", "office"];   
    rarity: string[] = [AnimalRarity.COMMON, AnimalRarity.RARE, AnimalRarity.EPIC, AnimalRarity.LEGENDARY];
    
    start() {
        this.btnCreatePet.node.on(Button.EventType.CLICK, () => {
            this.createPetOnClick();
        });

        this.btnDeletePet.node.on(Button.EventType.CLICK, () => {
            this.deletePetOnClick();
        });

        this.buttonClose.node.on(Button.EventType.CLICK, () => {
            this.node.active = false;
        });
        this.dropdownRoomCreate.setOptions(this.map);
        this.dropdownRoomDelete.setOptions(this.map);
        this.editBoxCatchPercentDog.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentBird.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentCat.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentDragon.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentDragonIce.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentPhonenixIce.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentPokemon.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentRabit.string = this.defaultQuantity.toString();
        this.editBoxCatchPercentSika.string = this.defaultQuantity.toString();
        this.quantityDog.string = this.defaultQuantity.toString();
        this.quantityBird.string = this.defaultQuantity.toString();
        this.quantityCat.string = this.defaultQuantity.toString();
        this.quantityDragon.string = this.defaultQuantity.toString();
        this.quantityDragonIce.string = this.defaultQuantity.toString();
        this.quantityPhonenixIce.string = this.defaultQuantity.toString();
        this.quantityPokemon.string = this.defaultQuantity.toString();
        this.quantityRabit.string = this.defaultQuantity.toString();
        this.quantitySika.string = this.defaultQuantity.toString();
        this.dropdownDog.setOptions(this.rarity);
        this.dropdownBird.setOptions(this.rarity);
        this.dropdownCat.setOptions(this.rarity);
        this.dropdownDragon.setOptions(this.rarity);
        this.dropdownDragonIce.setOptions(this.rarity);
        this.dropdownPhonenixIce.setOptions(this.rarity);
        this.dropdownPokemon.setOptions(this.rarity);
        this.dropdownRabit.setOptions(this.rarity);
        this.dropdownSika.setOptions(this.rarity);
    }

    deletePetOnClick() {
        const selectedRoom = this.dropdownRoomCreate.getValue();
        const handlePetData = (map: string, subMap: string = "") => {
            WebRequestManager.instance.getAllPetData(
                subMap == "" ? map : `${map}-${subMap}`,
                (response) => this.onGetAllPetDataDelete(response),
                (error) => this.onError(error)
            );
        };

        if (selectedRoom === "all") {
            for (const entry of this.map) {
                if (entry === "all") continue;

                if (entry.includes("office")) {
                    const [map, subMap] = entry.split("-");
                    handlePetData(map, subMap);
                } else {
                    handlePetData(entry);
                }
            }
        } else {
            if (selectedRoom.includes("office")) {
                const [map, subMap] = selectedRoom.split("-");
                handlePetData(map, subMap);
            } else {
                handlePetData(selectedRoom);
            }
        }
    }

    createPetOnClick() {
        const selectedRoom = this.dropdownRoomCreate.getValue();
        const handlePetData = (map: string, subMap: string = "") => {
            this.onGetAllPetDataCreate(map, subMap);
        };

        if (selectedRoom === "all") {
            for (const entry of this.map) {
                if (entry === "all") continue;

                if (entry.includes("office")) {
                    const [map, subMap] = entry.split("-");
                    handlePetData(map, subMap);
                } else {
                    handlePetData(entry);
                }
            }
        } else {
            if (selectedRoom.includes("office")) {
                const [map, subMap] = selectedRoom.split("-");
                handlePetData(map, subMap);
            } else {
                handlePetData(selectedRoom);
            }
        }
    }

    private onGetAllPetDataCreate(map: string, submap: string) {
        const petConfigs: PetConfig[] = [
            { species: "Dog", numSpawn: parseInt(this.quantityDog.string), catchChange: parseInt(this.editBoxCatchPercentDog.string), rarity: this.dropdownDog.getValue() as AnimalRarity },
            { species: "Cat", numSpawn: parseInt(this.quantityCat.string), catchChange: parseInt(this.editBoxCatchPercentCat.string), rarity: this.dropdownCat.getValue() as AnimalRarity },
            { species: "Bird", numSpawn: parseInt(this.quantityBird.string), catchChange: parseInt(this.editBoxCatchPercentBird.string), rarity: this.dropdownBird.getValue() as AnimalRarity },
            { species: "Rabit", numSpawn: parseInt(this.quantityRabit.string), catchChange: parseInt(this.editBoxCatchPercentRabit.string), rarity: this.dropdownRabit.getValue() as AnimalRarity },
            { species: "Pokemon", numSpawn: parseInt(this.quantityPokemon.string), catchChange: parseInt(this.editBoxCatchPercentPokemon.string), rarity: this.dropdownPokemon.getValue() as AnimalRarity },
            { species: "Sika", numSpawn: parseInt(this.quantitySika.string), catchChange: parseInt(this.editBoxCatchPercentSika.string), rarity: this.dropdownSika.getValue() as AnimalRarity },
            { species: "Dragon", numSpawn: parseInt(this.quantityDragon.string), catchChange: parseInt(this.editBoxCatchPercentDragon.string), rarity: this.dropdownDragon.getValue() as AnimalRarity },
            { species: "DragonIce", numSpawn: parseInt(this.quantityDragonIce.string), catchChange: parseInt(this.editBoxCatchPercentDragonIce.string), rarity: this.dropdownDragonIce.getValue() as AnimalRarity },
            { species: "PhoenixIce", numSpawn: parseInt(this.quantityPhonenixIce.string), catchChange: parseInt(this.editBoxCatchPercentPhonenixIce.string), rarity: this.dropdownPhonenixIce.getValue() as AnimalRarity }
        ];
        for (const config of petConfigs) {
            if (config.numSpawn <= 0) continue;

            for (let i = 0; i < config.numSpawn; i++) {
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
            () => console.log(`Tạo ${species} - ${rarity} - ${catchChange} thành công.`),
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


