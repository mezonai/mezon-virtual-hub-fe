import { _decorator, Component, director } from 'cc';
import { LocalItemConfig, LocalItemDataConfig, LocalItemPartDataConfig } from '../Model/LocalItemConfig';
import { MezonDTO } from '../Model/Player';
import { UserMeManager } from './UserMeManager';
import { Item, ItemDTO, ItemType } from '../Model/Item';
import { FactData, JokeData } from '../Model/NPCLocalData';
import { PetDTO } from '../Model/PetDTO';
const { ccclass, property } = _decorator;

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager;
    public static get instance() {
        return ResourceManager._instance;
    }

    private _itemDTO: ItemDTO;

    public LocalSkinConfig: LocalItemConfig;
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

    public getLocalSkinById(gender: string, id: string, type: ItemType, isUnisex: boolean = false): LocalItemDataConfig {
        let item: LocalItemDataConfig = null;
        if (!isUnisex) {
            switch (gender) {
                case "male":
                    item = this.getLocalSkinPartById(id, type, this.LocalSkinConfig.male);
                    break;
                case "female":
                    item = this.getLocalSkinPartById(id, type, this.LocalSkinConfig.female);
                    break;
            }
        }

        if (!item) {
            item = this.getLocalSkinPartById(id, type, this.LocalSkinConfig.unisex);
        }

        return item;
    }

    private getLocalSkinPartById(id: string, type: ItemType, listItem: LocalItemPartDataConfig): LocalItemDataConfig {
        let arr: LocalItemDataConfig[] = [];
        switch (type) {
            case ItemType.EYES:
                arr = listItem.eyes;
                break;
            case ItemType.HAT:
                arr = listItem.equipment;
                break;
            case ItemType.HAIR:
                arr = listItem.hair;
                break;
            case ItemType.FACE:
                arr = listItem.face;
                break;
            case ItemType.UPPER:
                arr = listItem.upper;
                break;
            case ItemType.LOWER:
                arr = listItem.lower;
                break;
        }

        return arr.find(x => x.id == id);
    }

    public getAllLocalSkinById(id: string) {
        let item = null;
        for (let i = 1; i <= 7; i++) {
            item = this.getLocalSkinById("male", id, i);
            if (item != null) {
                return item;
            }
        }
        for (let i = 1; i <= 7; i++) {
            item = this.getLocalSkinById("female", id, i);
            if (item != null) {
                return item;
            }
        }
    }
}