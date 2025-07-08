export interface PetAssetConfig {
    name: string;
    scale: number;
    offsetY: number;
}

export const PetAssetMap: Record<string, PetAssetConfig> = {
    Dog: {
        name: 'Dog',
        scale: 1,
        offsetY: 10,
    },
    Cat: {
        name: 'Cat',
        scale: 1,
        offsetY: 10,
    },
    Bird: {
        name: 'Bird',
        scale: 1,
        offsetY: 20,
    },
    Sika: {
        name: 'Sika',
        scale: 1,
        offsetY: 20,
    },
    Rabit: {
        name: 'Rabit',
        scale: 1,
        offsetY: 20,
    },
    Pokemon: {
        name: 'Pokemon',
        scale: 1,
        offsetY: 10,
    },
    Dragon: {
        name: 'Dragon',
        scale: 1,
        offsetY: 20,
    },
    DragonIce: {
        name: 'DragonIce',
        scale: 0.7,
        offsetY: 0,
    },
    IcePhoenix: {
        name: 'IcePhoenix',
        scale: 0.7,
        offsetY: 0,
    },
};

export function getPetAssetByName(name: string): PetAssetConfig {
    const asset = PetAssetMap[name];
    if (!asset) return;
    return asset || {
        name: name,
        scale: 1,
        offsetY: 20,
    };
}
