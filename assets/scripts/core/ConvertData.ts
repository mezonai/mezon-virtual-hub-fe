import { MapData } from "../Interface/DataMapAPI";
import { Food, Item, RewardItemDTO, RewardType } from "../Model/Item";
import { PetBattleInfo, PetDTO, PlayerBattle, SkillData, Species, TypeSkill } from "../Model/PetDTO";

export default class ConvetData {
    public static ConvertMap(mapData: any): MapData[] {
        if (!mapData?.data || !Array.isArray(mapData.data)) {
            console.error("Dữ liệu API không hợp lệ:", mapData);
            return [];
        }

        return mapData.data.map((mapItem: any) => ({
            id: mapItem.id,
            name: mapItem.name,
            map_key: mapItem.map_key,
            isLocked: mapItem.is_locked
        }));
    }
    public static ConvertPets(petData: string): PetDTO[] {
        const dataArray = JSON.parse(petData);
        return dataArray.map((data: any) => {
            const petDTO = new PetDTO();
            petDTO.id = data.id;
            petDTO.name = data.name;
            petDTO.level = data.level;
            petDTO.exp = data.exp;
            petDTO.stars = data.stars;
            petDTO.attack = data.attack;
            petDTO.defense = data.defense;
            petDTO.speed = data.speed;
            petDTO.is_brought = data.is_brought;
            petDTO.is_caught = data.is_caught;
            petDTO.is_selected_battle = data.is_selected_battle;
            petDTO.individual_value = data.individual_value;
            petDTO.room_code = data.room_code;
            petDTO.pet = data.pet;
            petDTO.skill_slot_1 = data.skill_slot_1;
            petDTO.skill_slot_2 = data.skill_slot_2;
            petDTO.skill_slot_3 = data.skill_slot_3 ?? null;
            petDTO.skill_slot_4 = data.skill_slot_4 ?? null;
            return petDTO;
        });
    }

    public static ConvertPet(petData: string): PetDTO {
        const data = JSON.parse(petData);
        const petDTO = new PetDTO();
        petDTO.id = data.id;
        petDTO.name = data.name;
        petDTO.level = data.level;
        petDTO.exp = data.exp;
        petDTO.stars = data.stars;
        petDTO.attack = data.attack;
        petDTO.defense = data.defense;
        petDTO.speed = data.speed;
        petDTO.is_brought = data.is_brought;
        petDTO.is_caught = data.is_caught;
        petDTO.is_selected_battle = data.is_selected_battle;
        petDTO.individual_value = data.individual_value;
        petDTO.room_code = data.room_code;
        petDTO.pet = data.pet;
        petDTO.skill_slot_1 = data.skill_slot_1;
        petDTO.skill_slot_2 = data.skill_slot_2;
        petDTO.skill_slot_3 = data.skill_slot_3 ?? null;
        petDTO.skill_slot_4 = data.skill_slot_4 ?? null;
        return petDTO;
    }

    public static ConvertReward(data: any): RewardItemDTO[] {
        if (!Array.isArray(data)) return [];

        return data
            .filter((d: any) => d && typeof d === 'object')
            .map((entry: any) => {
                const rewardItem = new RewardItemDTO();

                switch (entry.type) {
                    case RewardType.ITEM:
                        rewardItem.type = RewardType.ITEM;
                        rewardItem.item = this.parseItem(entry.item);
                        rewardItem.quantity = 1;
                        break;

                    case RewardType.FOOD:
                        rewardItem.type = RewardType.FOOD;
                        rewardItem.food = this.parseFood(entry.food);
                        rewardItem.quantity = entry.quantity ?? 0;
                        break;

                    case RewardType.GOLD:
                    default:
                        rewardItem.type = RewardType.GOLD;
                        rewardItem.amount = entry.amount ?? 0;
                        break;
                }

                return rewardItem;
            });
    }

    public static ConvertPlayersBattleData(playersBattleData: string): PlayerBattle[] {
        const dataArray = JSON.parse(playersBattleData);
        return dataArray.map((data: any) => {
            const playerBattle = new PlayerBattle();
            playerBattle.id = data.id;
            playerBattle.userId = data.userId;
            playerBattle.name = data.name;
            playerBattle.activePetIndex = data.activePetIndex;
            playerBattle.battlePets = data.battlePets.map((petData: any) => {
                return this.convertToPetBattleInfo(petData);
            });
            return playerBattle;
        });
    }

    public static ConvertPlayerBattleData(playerData: any): PlayerBattle {
        const playerBattle = new PlayerBattle();
        playerBattle.id = playerData.id;
        playerBattle.userId = playerData.userId;
        playerBattle.name = playerData.name;
        playerBattle.activePetIndex = playerData.activePetIndex;
        playerBattle.battlePets = playerData.battlePets.map((petData: any) => {
            return this.convertToPetBattleInfo(petData);
        });
        return playerBattle;
    }

    public static convertToPetBattleInfo(petData: any): PetBattleInfo {
        const pet = new PetBattleInfo();
        pet.id = petData.id;
        pet.name = petData.name;
        pet.species = Species[petData.species as keyof typeof Species]; // convert string → enum
        pet.totalHp = petData.totalHp;
        pet.currentHp = petData.currentHp;
        pet.level = petData.level;
        pet.currentExp = petData.currentExp;
        pet.totalExp = petData.totalExp;
        pet.attack = petData.attack;
        pet.defense = petData.defense;
        pet.speed = petData.speed;
        pet.isSleeping = petData.isSleeping;
        pet.skills = petData.skills.map((skillData: any) => {
            return this.convertToSkillData(skillData);
        });
        pet.isDead = petData.isDead;
        return pet;
    }

    public static convertToSkillData(skillData: any): SkillData {
        const skill = new SkillData();
        skill.id = skillData.id;
        skill.attack = skillData.attack;
        skill.accuracy = skillData.accuracy;
        skill.typeSkill = this.mapServerSkillToClient(skillData.skillType);
        skill.currentPowerPoint = skillData.currentPowerPoint;
        skill.totalPowerPoint = skillData.totalPowerPoint;
        return skill;
    }

    public static parseFood(foodData: any): Food {
        const food = new Food();
        Object.assign(food, foodData);
        return food;
    }

    public static parseItem(itemData: any): Item {
        const item = new Item();
        Object.assign(item, itemData);
        item.iconSF = [];
        item.mappingLocalData = null;
        return item;
    }

    public static mapServerSkillToClient(serverSkill: string): TypeSkill | null {
        switch (serverSkill) {
            case 'attack':
                return TypeSkill.ATTACK;
            case 'defense':
                return TypeSkill.DEFENSE;
            case 'increase_attack':
                return TypeSkill.INCREASE_ATTACK;
            case 'decrease_attack':
                return TypeSkill.DECREASE_ATTACK;
            case 'heal':
                return TypeSkill.HEAL;
            default:
                return null; // hoặc throw new Error("Unknown skill type")
        }
    }
}

