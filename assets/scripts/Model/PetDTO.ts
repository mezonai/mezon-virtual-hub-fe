import { SkillData } from "../animal/Skills";

export class PetDTO {
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

export class PetDTO2 {
  public id: string;
  public name: string;
  public species: Species;
  public is_caught: boolean;
  public is_brought: boolean;
  public room_code: string;
  public rarity: AnimalRarity;
  public isMe: boolean;
  type: AnimalElement;
  lvl: number;
  maxHp: number;
  currentHp: number;
  maxExp: number;
  currentExp: number;
  skills: SkillData[];
}

export interface BattleData {
  environmentType: AnimalElement;
  pet1: PetDTO2;
  pet2: PetDTO2;
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

export enum Species {
  Bird,
  Bubblespark,
  Cat,
  Dog,
  Dragon,
  DragonFire,
  DragonIce,
  DragonNormal,
  Duskar,
  Leafeon,
  Lizard,
  PhoenixFire,
  PhoenixIce,
  Pokemon,
  Rabit,
  Sika,
  Snowria,
}
