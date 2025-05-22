import { _decorator, Component, director } from 'cc';
import { LocalItemConfig, LocalItemDataConfig, LocalItemPartDataConfig } from '../Model/LocalItemConfig';
import { MezonDTO } from '../Model/Player';
import { UserMeManager } from './UserMeManager';
import { Food, FoodDTO, Item, ItemDTO, ItemType } from '../Model/Item';
import { FactData, JokeData } from '../Model/NPCLocalData';
import { PetDTO } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager;
    public static get instance() {
        return ResourceManager._instance;
    }

    private skinDataDict:  Map<string, LocalItemDataConfig> = new Map<string, LocalItemDataConfig>();

    private _itemDTO: ItemDTO;
    private _foodDTO: FoodDTO;
    private localSkinConfig: LocalItemConfig;

    public set LocalSkinConfig (value: LocalItemConfig) {
        this.localSkinConfig = value;
        this.initSkinDict(value.female);
        this.initSkinDict(value.male);
        this.initSkinDict(value.unisex);
    }

    private initSkinDict(gender: LocalItemPartDataConfig) {
        gender.equipment.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.eyes.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.face.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.hair.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.lower.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.upper.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });

        gender.specialItem.forEach(e => {
            this.skinDataDict.set(e.id, e)
        });
    }

    public get LocalSkinConfig (): LocalItemConfig {
        return this.localSkinConfig;
    }

    public UserProfileData: MezonDTO;
    public FactData: FactData;
    public JokeData: JokeData;
    public MezonUserData: MezonDTO = null;
    public PetData: PetDTO;

    public get ItemData(): ItemDTO {
        return this._itemDTO;
    }

    public set ItemData(value) {
        this._itemDTO = value;
    }

    public get FoodData(): FoodDTO {
        return this._foodDTO;
    }

    public set FoodData(value) {
        this._foodDTO = value;
    }

    private get UserData() {
        return UserMeManager.Get;
    }

    protected onLoad(): void {
        if (ResourceManager._instance == null) {
            ResourceManager._instance = this;
        }

        director.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        ResourceManager._instance = null;
    }

    public getLocalSkinById(id: string, type: ItemType): LocalItemDataConfig {
        if (this.skinDataDict.has(id)) {
            return this.skinDataDict.get(id);
        }
        else {
            return null;
        }
    }
}