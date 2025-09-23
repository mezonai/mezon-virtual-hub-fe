import { MapData } from "../Interface/DataMapAPI";
import { Food, InventoryDTO, Item, PetReward, QuestType, RewardItemDTO, RewardNewbieDTO, RewardType, StatsConfigDTO } from "../Model/Item";
import { AnimalElementString, AnimalRarity, Element, PetBattleInfo, PetDTO, PlayerBattle, SkillBattleInfo, Species, TypeSkill } from "../Model/PetDTO";

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
            petDTO.max_exp = data.max_exp;
            petDTO.stars = data.stars;
            petDTO.hp = data.hp;
            petDTO.attack = data.attack;
            petDTO.defense = data.defense;
            petDTO.speed = data.speed;
            petDTO.is_brought = data.is_brought;
            petDTO.is_caught = data.is_caught;
            petDTO.battle_slot = data.battle_slot;
            petDTO.individual_value = data.individual_value;
            petDTO.room_code = data.room_code;
            petDTO.pet = data.pet;
            petDTO.skill_slot_1 = data.skill_slot_1;
            petDTO.skill_slot_2 = data.skill_slot_2;
            petDTO.skill_slot_3 = data.skill_slot_3 ?? null;
            petDTO.skill_slot_4 = data.skill_slot_4 ?? null;
            petDTO.equipped_skill_codes = data.equipped_skill_codes ?? null;
            return petDTO;
        });
    }

    public static ConvertPet(raw: any): PetDTO {
        const petData = new PetDTO();
        petData.id = raw.id;
        petData.name = raw.name;
        petData.level = raw.level;
        petData.exp = raw.exp;
        petData.max_exp = raw.max_exp;
        petData.stars = raw.stars;
        petData.hp = raw.hp;
        petData.attack = raw.attack;
        petData.defense = raw.defense;
        petData.speed = raw.speed;
        petData.is_brought = raw.is_brought;
        petData.is_caught = raw.is_caught;
        petData.battle_slot = raw.battle_slot;
        petData.individual_value = raw.individual_value;
        petData.room_code = raw.room_code;
        petData.pet = raw.pet;
        petData.skill_slot_1 = raw.skill_slot_1 ?? null;
        petData.skill_slot_2 = raw.skill_slot_2 ?? null;
        petData.skill_slot_3 = raw.skill_slot_3 ?? null;
        petData.skill_slot_4 = raw.skill_slot_4 ?? null;
        petData.equipped_skill_codes = raw.equipped_skill_codes ?? [];
        return petData;
    }

    public static ConvertPetReward(petData: any): PetReward {
        const pet = new PetReward();
        pet.id = petData.id;
        pet.rarity = petData.rarity as AnimalRarity;
        pet.type = this.getElementByString(petData.type);
        pet.species = Species[petData.species as keyof typeof Species];
        return pet;
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
                    case RewardType.PET:
                        rewardItem.type = RewardType.PET;
                        console.log("entry.pet: ", entry.pet);
                        rewardItem.pet = this.ConvertPetReward(entry.pet);
                        rewardItem.quantity = entry.quantity ?? 0;
                        break;

                    case RewardType.GOLD:
                    default:
                        rewardItem.type = RewardType.GOLD;
                        rewardItem.quantity = entry.quantity ?? 0;
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

    public static convertToSkillData(skillData: any): SkillBattleInfo {
        const skill = new SkillBattleInfo();
        skill.skill_code = skillData.id;
        skill.attack = skillData.attack;
        skill.accuracy = skillData.accuracy;
        skill.type = skillData.type;
        skill.typeSkill = this.mapServerSkillToClient(skillData.skillType);
        skill.currentPowerPoint = skillData.currentPowerPoint;
        skill.totalPowerPoint = skillData.totalPowerPoint;
        return skill;
    }

    public static ConvertRewardNewbieList(data: any[]): RewardNewbieDTO[] {
        if (!data) return [];
        return data.map(item => this.ConvertRewardNewbie(item));
    }

    public static ConvertRewardNewbie(data: any): RewardNewbieDTO {
        if (data == null) return null;
        const rewardNewbie = new RewardNewbieDTO();
        rewardNewbie.id = data.id;
        rewardNewbie.quest_id = data.quest_id;
        rewardNewbie.end_at = data.end_at;
        rewardNewbie.name = data.name;
        rewardNewbie.description = data.description || "";
        rewardNewbie.is_claimed = data.is_claimed;
        rewardNewbie.is_available = data.is_available;
        rewardNewbie.quest_type = this.mapServerQuestTypeToClient(data.quest_type);
        rewardNewbie.rewards = this.ConvertReward(data.rewards);
        return rewardNewbie;
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

    public static mapEnviromentType(enviroment: string): Element {
        switch (enviroment) {
            case 'grass':
                return Element.Grass;
            case 'ice':
                return Element.Ice;
            case 'water':
                return Element.Water;
            default:
                return Element.Grass;
        }
    }

    public static mapServerQuestTypeToClient(questType: string): QuestType {
        switch (questType) {
            case 'newbie_login':
                return QuestType.NEWBIE_LOGIN;
            case 'newbie_login_special':
                return QuestType.NEWBIE_LOGIN_SPECIAL;
            default:
                return QuestType.NEWBIE_LOGIN;
        }
    }

    public static getElementByString(value: string): Element {
        for (const key in AnimalElementString) {
            if (AnimalElementString[key as unknown as Element] === value) {
                return Number(key) as Element;
            }
        }
        return Element.Normal;
    }

    public static parseStatsConfigDTO(data: any): StatsConfigDTO {
        return {
            costs: {
                spinGold: data.costs.spinGold,
                upgradeStarsDiamond: data.costs.upgradeStarsDiamond,
            },
            percentConfig: {
                upgradeStars: { ...data.percent.upgradeStars },
                upgradeRarity: { ...data.percent.upgradeRarity },
                spinRewards: {
                    item: data.percent.spinRewards?.item ?? 0,
                    gold: data.percent.spinRewards?.gold ?? 0,
                    food: {
                        normal: data.percent.spinRewards?.food?.normal ?? 0,
                        premium: data.percent.spinRewards?.food?.premium ?? 0,
                        ultra: data.percent.spinRewards?.food?.ultra ?? 0,
                    },
                    none: data.percent.spinRewards?.none ?? 0,
                }
            }
        }
    }

    public static ConvertInventoryDTO(apiData: any[]): InventoryDTO[] {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map(inv => {
            const inventory = new InventoryDTO();
            inventory.id = inv.id;
            inventory.equipped = inv.equipped ?? false;
            inventory.quantity = inv.quantity;
            inventory.inventory_type = inv.inventory_type;

            if (inv.item) {
                const itemObj = new Item();
                itemObj.id = inv.item.id;
                itemObj.name = inv.item.name;
                itemObj.gender = inv.item.gender;
                itemObj.gold = inv.item.gold;
                itemObj.type = inv.item.type;
                itemObj.item_code = inv.item.item_code;
                itemObj.is_stackable = inv.item.is_stackable;
                itemObj.is_equippable = inv.item.is_equippable ?? false;
                inventory.item = itemObj;
            }
            return inventory;
        });
    }
}
