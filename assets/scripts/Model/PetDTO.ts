export class PetDTO{
    public id: string;
    public name: string;
    public species: string;
    public is_caught: boolean;
    public is_brought: boolean;
    public room_code: string;
    public rarity: AnimalRarity;
    type: AnimalElement;
    lvl: number;
    maxHp: number;
    currentHp: number;
    maxExp: number;
    currentExp: number;
    skills: number[];
}

export interface CombatStartData {
    environmentType: AnimalElement;
    pet1: PetDTO;
    pet2: PetDTO;
}


export enum AnimalRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum Pet {
  DOG,
  BIRD,
  CAT,
  DRAGON,
  DRAGONICE,
  PHOENIXICE,
  POKEMON,
  RABIT,
  SIKA
}

export enum AnimalElement {
    Normal,
    Fire,
    Water,
    Grass,
    Electric,
    Ice,
    Dragon,
}
