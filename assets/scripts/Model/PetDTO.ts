export class PetDTO{
    public id: string;
    public name: string;
    public species: string;
    public is_caught: boolean;
    public is_brought: boolean;
    public room_code: string;
    public rarity: AnimalRarity;
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