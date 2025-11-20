
import { FarmDTO, FarmSlotDTO, PlantState, ClanWarehouseSlotDTO, PlantDataDTO, PlantData, HarvestCountDTO } from "../Farm/EnumPlant";
import { ClansData, PageInfo, ClansResponseDTO, MemberResponseDTO, UserClan, ClanContributorDTO, ClanContributorsResponseDTO, ClanFundResponseDTO, ClanFund, ClanRequestResponseDTO, MemberClanRequestDTO, ClanStatus, ClanActivityItemDTO, ClanActivityResponseDTO, RequestToJoinDTO } from "../Interface/DataMapAPI";
import { EventRewardDTO, EventType, Food, InventoryDTO, Item, PetReward, QuestType, RewardItemDTO, RewardNewbieDTO, RewardType, StatsConfigDTO } from "../Model/Item";
import { AnimalElementString, AnimalRarity, Element, PetBattleInfo, PetDTO, PlayerBattle, SkillBattleInfo, Species, TypeSkill } from "../Model/PetDTO";

export default class ConvetData {
    private static defaultPageInfo(): PageInfo {
        return {
            page: 1,
            size: 0,
            total: 0,
            total_page: 0,
            has_previous_page: false,
            has_next_page: false
        };
    }

    private static extractPageInfo(data: any): PageInfo {
        return {
            page: data?.page ?? 1,
            size: data?.size ?? 0,
            total: data?.total ?? 0,
            total_page: data?.total_page ?? 0,
            has_previous_page: data?.has_previous_page ?? false,
            has_next_page: data?.has_next_page ?? false
        };
    }

    public static ConvertClans(apiData: any): ClansResponseDTO {
        const data = apiData?.data;
        if (!data || typeof data !== "object")
            return { result: [], pageInfo: this.defaultPageInfo() };

        const clans: ClansData[] = (Array.isArray(data.result) ? data.result : []).map((clan: any) => ({
            id: clan.id ?? "",
            name: clan.name ?? "",
            fund: clan.fund ?? 0,
            score: clan.score ?? 0,
            max_members: clan.max_members ?? 0,
            member_count: clan.member_count ?? 0,
            join_status: clan.join_status ?? ClanStatus.NONE,
            rank: clan.rank ?? 0,
        }));

        return { result: clans, pageInfo: this.extractPageInfo(data) };
    }

    public static ConvertClanDetail(apiData: any): ClansData | null {
        const clanDT = apiData?.data ?? apiData;
        if (!clanDT || typeof clanDT !== "object") return null;

        const mapUser = (user: any): UserClan | null => user
            ? {
                id: user.id ?? "",
                username: user.username ?? "",
                display_name: user.display_name ?? "",
                avatar_url: user.avatar_url ?? null,
                gender: user.gender ?? null,
                clan_role: user.clan_role ?? null,
                total_score: user.total_score ?? 0,
                weekly_score: user.weekly_score ?? 0,
                rank: user.rank ?? 0,
            }
            : null;

        const funds: ClanFund[] = Array.isArray(clanDT.funds)
            ? clanDT.funds.map((f: any) => ({
                id: f.id ?? "",
                clan_id: f.clan_id ?? clanDT.id ?? "",
                type: f.type ?? "",
                amount: f.amount ?? 0,
            }))
            : [];

        return {
            id: clanDT.id ?? "",
            name: clanDT.name ?? "",
            fund: clanDT.fund ?? 0,
            score: clanDT.score ?? 0,
            description: clanDT.description ?? null,
            member_count: clanDT.member_count ?? 0,
            max_members: clanDT.max_members ?? 0,
            leader: mapUser(clanDT.leader),
            vice_leader: mapUser(clanDT.vice_leader),
            join_status: clanDT.join_status ?? null,
            rank: clanDT.rank ?? 0,
            avatar_url: clanDT.avatar_url ?? null,
            funds: funds,
        };
    }

    public static convertClanFund(apiData: any): ClanFundResponseDTO | null {
        if (!apiData?.data) return null;

        const d = apiData.data;
        return {
            clan_id: d.clan_id,
            funds: Array.isArray(d.funds)
                ? d.funds.map((f: any) => ({
                    type: f.type,
                    amount: Number(f.amount ?? 0),
                }))
                : [],
        };
    }
    public static ConvertMemberClan(apiData: any): MemberResponseDTO {
        const data = apiData?.data;
        if (!data || typeof data !== "object")
            return { result: [], pageInfo: this.defaultPageInfo() };

        const members: UserClan[] = (Array.isArray(data.result) ? data.result : []).map((user: any) => ({
            id: user.id ?? "",
            username: user.username ?? "",
            display_name: user.display_name ?? "",
            avatar_url: user.avatar_url ?? null,
            gender: user.gender ?? null,
            clan_role: user.clan_role ?? null,
            total_score: user.total_score ?? 0,
            weekly_score: user.weekly_score ?? 0,
            rank: user.rank ?? 0,
        }));

        return { result: members, pageInfo: this.extractPageInfo(data) };
    }

    public static convertContributorsClan(apiData: any): ClanContributorsResponseDTO {
        const data = apiData?.data;
        if (!data || typeof data !== 'object') {
            return { result: [], pageInfo: this.defaultPageInfo() };
        }
        const contributors: ClanContributorDTO[] = (Array.isArray(data.result) ? data.result : []).map(
            (user: any) => ({
                user_id: user.user_id ?? '',
                username: user.username ?? '',
                type: user.type ?? '',
                total_amount: user.total_amount ?? 0,
                avatar_url: user.avatar_url ?? null,
                clan_role: user.clan_role ?? null,
                rank: user.rank ?? 0,
            }),
        );

        return { result: contributors, pageInfo: this.extractPageInfo(data) };
    }

    public static ConvertClanActivity(response: any): ClanActivityResponseDTO {
        const data = response?.data ?? {};

        const clanActivityItems: ClanActivityItemDTO[] = Array.isArray(data.result)
            ? data.result.map((item: any) => ({
                userName: item.userName ?? '',
                actionType: item.actionType ?? '',
                itemName: item.itemName,
                quantity: item.quantity,
                amount: item.amount,
                time: item.time,
                createdAt: item.created_at,
                officeName: item.officeName
            }))
            : [];

        return {
            result: clanActivityItems,
            pageInfo: data ? this.extractPageInfo(data) : this.defaultPageInfo()
        };
    }

    public static ConvertClanRequests(apiData: any): ClanRequestResponseDTO {
        const data = apiData?.data;
        const requests: MemberClanRequestDTO[] = Array.isArray(data?.result)
            ? data.result.map((member: any) => ({
                id: member.id ?? "",
                status: member.status ?? ClanStatus.PENDING,
                created_at: member.created_at ?? "",
                user: member.user ?? null,
                clan: member.clan ?? null,
            }))
            : [];

        return {
            result: requests,
            pageInfo: data ? this.extractPageInfo(data) : this.defaultPageInfo()
        };
    }

    public static ConvertRequestToJoin(apiData: any): RequestToJoinDTO {
        const inner = apiData;
        return {
            request: inner?.request,
            canRequestAt: inner?.canRequestAt
        }
    }

    public static ConvertPlants(plants: any[]): PlantDataDTO[] {
        return (plants || []).map(p => ({
            id: p.id,
            name: p.name,
            grow_time: p.grow_time,
            harvest_point: p.harvest_point,
            buy_price: p.buy_price,
            description: p.description,
        }));
    }

    public static convertHarvestCountDTO(apiData: any): HarvestCountDTO {
        return {
            harvest_count: apiData.harvest_count,
            harvest_count_use: apiData.harvest_count_use,
            harvest_interrupt_count: apiData.harvest_interrupt_count,
            harvest_interrupt_count_use: apiData.harvest_interrupt_count_use
        };
    }

    public static ConvertWarehouseSlots(warehouses: any[]): ClanWarehouseSlotDTO[] {
        return (warehouses || []).map(w => ({
            id: w.id,
            farm_id: w.clan_id,
            plant_id: w.item_id,
            quantity: w.quantity,
            is_harvested: w.is_harvested,
            purchased_by: w.purchased_by || '',
            plant: w.plant
                ? {
                    id: w.plant.id,
                    name: w.plant.name,
                    grow_time: w.plant.grow_time,
                    harvest_point: w.plant.harvest_point,
                    buy_price: w.plant.buy_price as PlantState,
                    description: w.plant.description,
                }
                : undefined,
        }));
    }

    public static ConvertWarehouseSlot(warehouse: any): ClanWarehouseSlotDTO {
        return {
            id: warehouse.id,
            farm_id: warehouse.farm_id,
            plant_id: warehouse.plant_id,
            quantity: warehouse.quantity,
            is_harvested: warehouse.is_harvested,
            purchased_by: warehouse.purchased_by || '',
            plant: warehouse.plant
                ? {
                    id: warehouse.plant.id,
                    name: warehouse.plant.name,
                    grow_time: warehouse.plant.grow_time,
                    harvest_point: warehouse.plant.harvest_point,
                    buy_price: warehouse.plant.buy_price as PlantState,
                    description: warehouse.plant.description,
                }
                : undefined,
        };
    }

    public static convertPlantData(slotPlant: any): PlantData | null {
        if (!slotPlant) return null!;
        return {
            id: slotPlant.id,
            plant_id: slotPlant.plant_id,
            plant_name: slotPlant.plant_name,
            planted_by: slotPlant.planted_by,
            grow_time: slotPlant.grow_time,
            grow_time_remain: slotPlant.grow_time_remain,
            stage: slotPlant.stage as PlantState,
            can_harvest: slotPlant.can_harvest,
            need_water: slotPlant.need_water,
            has_bug: slotPlant.has_bug,
            harvest_at: slotPlant.harvest_at ? new Date(slotPlant.harvest_at) : null,
        };
    }

    public static ConvertFarmSlot(slot: any): FarmSlotDTO {
        return {
            id: slot.id,
            slot_index: slot.slot_index,
            currentPlant: this.convertPlantData(slot.currentPlant),
        };
    }

    public static ConvertFarmRequests(farmData: any): FarmDTO {
        const parsed = typeof farmData === 'string' ? JSON.parse(farmData) : farmData;
        const data = parsed.data || { slots: [], warehouseSlots: [], farm_id: '' };

        const warehouseSlots = (data.warehouseSlots || []).map(this.ConvertWarehouseSlot);
        const slots = (data.slots || []).map(this.ConvertFarmSlot);

        return {
            farm_id: data.farm_id,
            warehouseSlots,
            slots,
        };
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
            petDTO.current_rarity = data.current_rarity;
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
        petData.current_rarity = raw.current_rarity;
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

    public static ConvertEventReward(data: any): EventRewardDTO {       
        if (data == null) return null;      
         const eventReward = new EventRewardDTO();
        eventReward.eventType = EventType.EVENT_LOGIN_PLANT;
        eventReward.rewards = this.ConvertRewardNewbieList(data.data);
        return eventReward;
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

    private static convertItem(data: any): Item {
        const item = new Item();
        item.id = data.id;
        item.name = data.name;
        item.gender = data.gender ?? "not specified";
        item.gold = data.gold ?? 0;
        item.type = data.type;
        item.item_code = data.item_code ?? null;
        return item;
    }

    private static convertFood(data: any): Food {
        const food = new Food();
        food.id = data.id;
        food.name = data.name;
        food.type = data.type;
        food.purchase_method = data.purchase_method;
        food.price = data.price ?? 0;
        food.description = data.description ?? "";
        food.catch_rate_bonus = data.catch_rate_bonus ?? 0;
        return food;
    }

    public static ConvertInventoryDTO(apiData: any[]): InventoryDTO[] {
        if (!apiData || !Array.isArray(apiData)) return [];

        return apiData.map(inv => {
            const inventory = new InventoryDTO();
            inventory.id = inv.id;
            inventory.equipped = inv.equipped ?? false;
            inventory.quantity = inv.quantity;
            inventory.inventory_type = inv.inventory_type;
            if (inv.item) inventory.item = this.convertItem(inv.item);
            if (inv.food) inventory.food = this.convertFood(inv.food);
            return inventory;
        });
    }
}
