import { _decorator, Component, Node } from 'cc';
import { TutorialBase } from '../tutorial/TutorialBase';
import { Vec3 } from 'cc';
import { PopupClanList } from './PopupClanList';
import { ItemJoinClan } from '../Clan/ItemJoinClan';
import { ClanStatus } from '../Interface/DataMapAPI';
import { FarmSlot } from '../Farm/FarmSlot';
import { PlantData } from '../Farm/EnumPlant';
import { Plant } from '../Farm/Plant';
import { Constants } from '../utilities/Constants';
import { PlayerInteractFarm } from '../gameplay/player/PlayerInteractFarm';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupTutorialFarm')
export class PopupTutorialFarm extends TutorialBase {
    @property({ type: FarmSlot }) farmSlot: FarmSlot = null;
    @property({ type: Plant }) plant: Plant = null;
    @property({ type: Node }) popupChoosePlant: Node = null;
    @property({ type: Node }) itemPlant: Node = null;
    @property({ type: Node }) buttonClan: Node = null;
    @property({ type: PlayerInteractFarm }) playerInteractFarm: PlayerInteractFarm;
    private positionDefaultPlayer: Vec3 = new Vec3(-75, -32, 0);
    private timeWait: number = 0.2;
    private timeAnimSelection: number = 0.5;
    private timeMoveSelectionIcon: number = 0.3;
    private timeTalk: number = 0.2;
    private currentPlant: PlantData = null;
    public async init(param?: PopupTutorialFarmParam) {
        if (!param) {
            this.closePopup();
            return;
        }
        if (param?.onActionCompleted) {
            this._onActionCompleted = param.onActionCompleted;
        }
        this.buttonSkip.node.on(Button.EventType.CLICK, () => {
            localStorage.setItem(Constants.TUTORIAL_FARM, 'true');
            this.cancelTutorial();
        }, this);
        this.loadBase();
        this.playTutorialJoinClan();
    }


    public loadBase(): void {
        super.loadBase()
        this.tutorialPlayer.setPosition(this.positionDefaultPlayer);
        this.showInteractFarm(false);
        this.showPopupChoosePlant(false);
        this.showPlant(false);
        this.showItemPlant(false);
        this.setSlotFarm();
        this.setUpPlant();

    }

    async playTutorialJoinClan() {
        this.showPlayerTutorial(true);
        await this.showTalkAndDelay("Chào Mừng Bạn Đến Với Hệ Thống Nông Trại", this.timeWait, this.timeTalk);
        await this.showTalkAndDelay("Hãy học cách sử dụng Nông trại với mình nhé", this.timeWait, this.timeTalk);
        await this.showTalkAndDelay("Hãy chọn Ô đất bạn muốn trồng cây", this.timeWait, this.timeTalk);
        await Constants.waitForSeconds(this.timeWait);
        if (this.node != null && this.farmSlot?.node != null) await this.playAnimationSelection(this.farmSlot.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        this.showPopupChoosePlant(true);
        await this.showTalkAndDelay("Hạt giống chưa có, Hãy liên lạc với giám đốc văn phòng và yêu cầu mua.", this.timeWait, this.timeTalk);
        this.showItemPlant(true);
        await Constants.waitForSeconds(this.timeWait);
        await this.showTalkAndDelay("Bây giờ đã có hạt giống, Hãy nhấn vào hạt giống để trồng cây nào", this.timeWait, this.timeTalk);
        if (this.node != null && this.itemPlant != null) await this.playAnimationSelection(this.itemPlant.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        this.showPopupChoosePlant(false);
        this.spawnPlant();
        await Constants.waitForSeconds(this.timeWait);
        await this.showTalkAndDelay("Cây đã được trồng như vậy đó nhưng trong quá trình trông cây bạn cần canh thời gian cây cần tưới nước và bắt bọ", this.timeWait, this.timeTalk);
        await this.catchBug();
        await this.waterPlant();
        await this.harvesPlant();
        localStorage.setItem(Constants.TUTORIAL_FARM, 'true');
        this.cancelTutorial();
        this.closePopup();

    }

    showPopupChoosePlant(isShow: boolean) {
        if (this.node != null && this.popupChoosePlant != null) this.popupChoosePlant.active = isShow;
    }

    showItemPlant(isShow: boolean) {
        if (this.node != null && this.itemPlant != null) this.itemPlant.active = isShow;
    }

    showPlant(isShow: boolean) {
        if (this.node != null && this.plant != null) this.plant.node.active = isShow;
    }

    showInteractFarm(isShow: boolean) {
        if (this.node != null && this.playerInteractFarm != null) this.playerInteractFarm.node.active = isShow;
    }

    setUpPlant() {
        let plant = new PlantData();
        plant.id = "63cc5c81-1aff-4881-bfe3-f65dcf3db6ae";
        plant.plant_id = "c7c7b7d5-5e3d-49db-bb6e-c752eb65ebba";
        plant.plant_name = "Strawberry";
        plant.planted_by = "";
        plant.grow_time = 9000;
        plant.grow_time_remain = 8593;
        plant.stage = 1;
        plant.can_harvest = false;
        plant.need_water = false;
        plant.has_bug = false;
        plant.harvest_at = null;
        this.currentPlant = plant;
    }

    setSlotFarm() {
        if (this.node == null || this.farmSlot == null) return;
        this.farmSlot.interactAction.active = true;
        this.farmSlot.catchBugBTn.node.active = false;
        this.farmSlot.waterPlantBtn.node.active = false;
        this.farmSlot.harvestBtn.node.active = false;

    }

    spawnPlant() {
        if (this.node == null || this.plant == null) return;
        this.plant.setup(this.currentPlant);
        this.showPlant(true);

    }

    async catchBug() {
        if (this.node != null && this.currentPlant != null) this.currentPlant.has_bug = true;
        if (this.node != null && this.plant != null) this.plant.setup(this.currentPlant);
        if (this.node != null && this.plant != null) this.plant.updateStatusBug(true);
        await this.showTalkAndDelay("Ồ cây đã cần bắt bọ chúng ta cần bắt bọ nào", this.timeWait, this.timeTalk);
        await Constants.waitForSeconds(this.timeWait);
        if (this.node != null && this.farmSlot?.node != null) await this.playAnimationSelection(this.farmSlot.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.catchBugBTn.node != null) this.farmSlot.catchBugBTn.node.active = true;
        await this.showTalkAndDelay("Tiếp theo, Hãy nhấn vào nút bắt bọ", this.timeWait, this.timeTalk);
        if (this.node != null && this.farmSlot != null && this.farmSlot.catchBugBTn.node != null) await this.playAnimationSelection(this.farmSlot.catchBugBTn.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.catchBugBTn.node != null) this.farmSlot.catchBugBTn.node.active = false;
        if (this.node != null && this.farmSlot != null) await this.farmSlot.PlayCatchBugAnim(true);
        if (this.node != null && this.currentPlant != null) this.currentPlant.has_bug = false;
        if (this.node != null && this.plant != null) this.plant.setup(this.currentPlant);
        if (this.node != null && this.plant != null) this.plant.updateStatusBug(false);
        await this.showTalkAndDelay("Bọ đã được bắt rồi. Bây giờ hãy học cách tưới nước nhé", this.timeWait, this.timeTalk);
    }

    async waterPlant() {
        if (this.node != null && this.currentPlant != null) this.currentPlant.need_water = true;
        if (this.node != null && this.plant != null) this.plant.setup(this.currentPlant);
        if (this.node != null && this.plant != null) this.plant.updateStatusWater(true);
        await this.showTalkAndDelay("Cây đang cần nước. Hãy tưới nước giúp cây tươi tốt hơn", this.timeWait, this.timeTalk);
        await Constants.waitForSeconds(this.timeWait);
        if (this.node != null && this.farmSlot?.node != null) await this.playAnimationSelection(this.farmSlot.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.waterPlantBtn.node != null) this.farmSlot.waterPlantBtn.node.active = true;
        await this.showTalkAndDelay("Tiếp theo, Hãy nhấn vào nút tưới nước", this.timeWait, this.timeTalk);
        if (this.node != null && this.farmSlot != null && this.farmSlot.waterPlantBtn.node != null) await this.playAnimationSelection(this.farmSlot.waterPlantBtn.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.waterPlantBtn.node != null) this.farmSlot.waterPlantBtn.node.active = false;
        if (this.node != null && this.farmSlot != null) await this.farmSlot.PlayWaterPlantAnim(true);
        if (this.node != null && this.currentPlant != null) this.currentPlant.need_water = false;
        if (this.node != null && this.plant != null) this.plant.setup(this.currentPlant);
        if (this.node != null && this.plant != null) this.plant.updateStatusWater(false);
        await this.showTalkAndDelay("Đơn giản như vậy thôi giờ thì đợi cây chín và thu hoạch thôi", this.timeWait, this.timeTalk);
    }

    async harvesPlant() {
        if (this.node != null && this.currentPlant != null) {
            this.currentPlant.can_harvest = true;
            this.currentPlant.grow_time_remain = 0;
        }
        if (this.node != null && this.plant != null) this.plant.setup(this.currentPlant);
        if (this.node != null && this.plant != null) this.plant.updateHarvest();
        await this.showTalkAndDelay("Cây đã chín giờ là lúc thu hoạch thành quả", this.timeWait, this.timeTalk);
        if (this.node != null && this.farmSlot?.node != null) await this.playAnimationSelection(this.farmSlot.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.harvestBtn.node != null) this.farmSlot.harvestBtn.node.active = true;
        await this.showTalkAndDelay("Hãy nhấn vào nút thu hoạch nào", this.timeWait, this.timeTalk);
        if (this.node != null && this.farmSlot != null && this.farmSlot.harvestBtn.node != null) await this.playAnimationSelection(this.farmSlot.harvestBtn.node.worldPosition, this.timeWait, this.timeMoveSelectionIcon, this.timeAnimSelection, true);
        if (this.node != null && this.farmSlot != null && this.farmSlot.harvestBtn.node != null) this.farmSlot.harvestBtn.node.active = false;
        if (this.node != null && this.farmSlot != null) this.farmSlot.PlayHarvestAnim(true);
        this.showInteractFarm(true);
        const endTime = Date.now() + 1000;
        if (this.node != null && this.playerInteractFarm != null) await this.playerInteractFarm.playAnimHarvest(endTime);
        if (this.node != null && this.farmSlot != null) this.farmSlot.PlayHarvestAnim(false);
        this.showInteractFarm(false);
        this.showPlant(false);
        await this.showTalkAndDelay("Thu hoặc thành công! Lưu ý ngoài thu hoạch các cây của văn phòng mình, Chúng ta có thể trộm cây đã chín từ các văn phòng khác", this.timeWait, this.timeTalk);
        await this.showTalkAndDelay("Trong lúc người chơi khác thu hoạch cây, Chúng ta có thể phá để họ không thể thu hoạch", this.timeWait, this.timeTalk);
        await this.showTalkAndDelay("Mọi thứ đã hoàn thành. Hãy cùng nhau trông và thu hoạch thật nhiều cây để thi đua giữa các văn phòng nhé", this.timeWait, this.timeTalk);
    }

}
export interface PopupTutorialFarmParam {
    onActionCompleted?: () => void;
}


