export class PetDTO {
  public id: string;
  public name: string;
  public is_brought: boolean;
  public is_caught: boolean;
  public room_code: string;
  public species: string;
  public type: string;
  public rarity: string;
  public level: number;
  public exp: number;
  public max_exp: number;
  public stars: number;
  public hp: number;
  public attack: number;
  public defense: number;
  public speed: number;
  public battle_slot: number;
  public individual_value: number;
  public pet: BasePetData;
  public skill_slot_1: SkillSlot;
  public skill_slot_2: SkillSlot;
  public skill_slot_3: SkillSlot | null;
  public skill_slot_4: SkillSlot | null;
  public equipped_skill_codes: SkillCode[] | null;
}

export interface BasePetData {
  species: string;
  type: string;
  rarity: string;
}

export interface SkillSlot {
  skill_code: SkillCode;
  name: string;
  type: Element
  damage: number;
  accuracy: number;
  power_points: number;
  description: string;
}

export class BattleData {
  environmentType: Element;
}

export class PlayerBattle {
  public id: string;
  public userId: string;
  public name: string;
  public battlePets: PetBattleInfo[];
  public activePetIndex: number;
}

export class PetBattleInfo {
  public id: string;
  public name: string;
  public species: Species;
  public totalHp: number;
  public currentHp: number;
  public level: number;
  public currentExp: number;
  public totalExp: number;
  public attack: number;
  public speed: number;
  public defense: number;
  public skills: SkillBattleInfo[];
  public isDead: boolean;
  public isSleeping: boolean;
}
export class SkillBattleInfo {
  public skill_code: SkillCode;
  public attack: number = 0;
  public accuracy: number = 0;
  public currentPowerPoint: number = 0;
  public totalPowerPoint: number = 0;
  public type: Element = Element.Normal;
  public typeSkill: TypeSkill;
}
export interface BattleData {
  environmentType: Element;
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

export enum Element {
  Normal,
  Fire,
  Water,
  Grass,
  Electric,
  Ice,
  Dragon,
}

export enum TypeSkill {
  ATTACK,
  DEFENSE,
  INCREASE_ATTACK,
  DECREASE_ATTACK,
  HEAL,
}

export const AnimalElementString: Record<Element, string> = {
  [Element.Normal]: 'normal',
  [Element.Fire]: 'fire',
  [Element.Water]: 'water',
  [Element.Grass]: 'grass',
  [Element.Electric]: 'electric',
  [Element.Ice]: 'ice',
  [Element.Dragon]: 'dragon',
};

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

export enum SkillCode {
  ATTACK = "ATTACK01",
  GROWL = 'NOR01',
  PROTECT = 'NOR02',
  REST = 'NOR03',
  CONFUSION = 'NOR04',
  CUT = 'NOR05',
  POUND = 'NOR06',
  DOUBLE_KICK = 'NOR07',
  BITE = 'NOR08',
  CRUSH_CLAW = 'NOR09',
  WING_ATTACK = 'NOR10',
  FLY = 'NOR11',
  FURY_PUNCH = 'NOR12',
  EARTHQUAKE = 'GRASS01',
  RAZOR_LEAF = 'GRASS01',
  VINE_WHIP = 'GRASS03',
  ABSORB = 'GRASS02',
  THUNDERBOLT = 'ELECTRIC01',
  THUNDER_WAVE = 'ELECTRIC02',
  ELECTRO_BALL = 'ELECTRIC03',
  WATER_GUN = 'WATER01',
  BUBBLE = 'WATER02',
  AQUA_CUTTER = 'WATER03',
  EMBER = 'FIRE01',
  FIRE_BLAST = 'FIRE02',
  OVERHEAT = 'FIRE03',
  ICE_BALL = 'ICE01',
  ICICLE_CRASH = 'ICE02',
  ICE_FANG = 'ICE03',
  DRAGON_CLAW = 'DRAGON01',
}

export interface PetFollowPayload {
  pets: PetFollowData[];
}

export interface PetFollowData {
  id: string;
  is_brought: boolean;
  room_code?: string;
  name: string | null;
  species: string | null;
  type: string | null;
  rarity: string | null;
}

export interface PetBattlePayload {
  pets: PetBattleData[];
}

export interface PetBattleData {
  id: string;
  battle_slot: number;
}

export interface SkillPayload {
  equipped_skill_codes: SkillCode[];
};
