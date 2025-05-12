export class LocalItemConfig {
    male: LocalItemPartDataConfig;
    female: LocalItemPartDataConfig;
    unisex: LocalItemPartDataConfig;
}

export class LocalItemPartDataConfig {
    defaultSet: string[];
    hair: LocalItemDataConfig[];
    eyes: LocalItemDataConfig[];
    equipment: LocalItemDataConfig[];
    face: LocalItemDataConfig[];
    upper: LocalItemDataConfig[];
    lower: LocalItemDataConfig[];
    specialItem: LocalItemDataConfig[];
}

export class LocalItemDataConfig {
    public id: string = "";
    public icons: string[];
    public description: string = "";
    public bundleName: string = "";
    public posX: number = 0;
    public posY: number = 0;
}
