import { _decorator, Button, Component, Node, Prefab, ScrollView, instantiate, Label, Sprite, SpriteFrame} from 'cc';
import { PopupManager } from '../PopUp/PopupManager';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { SettingManager } from '../core/SettingManager';
import { UIMissionDetail } from '../gameplay/Mission/UIMissionDetail';
import { PopupOwnedAnimals } from '../PopUp/PopupOwnedAnimals';
import { PopupClanList } from '../PopUp/PopupClanList';
import { PopupClanDetailInfo } from '../PopUp/PopupClanDetailInfo';
import { UserMeManager } from '../core/UserMeManager';
import { LoginEventController } from '../gameplay/LoginEvent/LoginEventController';
import { WebRequestManager } from '../network/WebRequestManager';
import { InventoryClanUIItem } from '../Clan/InventoryClanUIItem';
import { RoomType } from '../GameMap/RoomType';
import { ClanPetDTO } from '../Model/Item';
import { PopupShopSlotPetClan } from '../PopUp/PopupShopSlotPetClan';

const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(LoginEventController) private loginEventController: LoginEventController = null;
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    @property(Button) private btn_UIMission: Button = null!;
    @property(Button) private showOwnedButton: Button;
    @property(Button) private buySlotFarmButton: Button;
    @property(Button) private btn_UIGuildReward: Button = null!;
    @property(Node) private redDotNoticeMission: Node = null!;
    @property(Node) private blockInteractHarvest: Node = null!;

    @property(Node) private listPetMyFarm: Node = null!;
    @property(ScrollView) private svInvenoryClanPet: ScrollView = null!;
    @property(Prefab) private itemPrefab: Prefab = null!;
    private petUIItems: InventoryClanUIItem[] = [];
    private petSlots: ClanPetDTO[] = [];
    @property(Label) maxSlotPetActive: Label = null!;
    private showPetRequestId = 0;
    private petUIMap = new Map<string, InventoryClanUIItem>();
    @property(Button) private btnPetList: Button = null!;
    private isPetListVisible: boolean = true;
    @property(Sprite) private sprite: Sprite = null!;
    @property(SpriteFrame) private iconExpand: SpriteFrame = null!;
    @property(SpriteFrame) private iconCollapse: SpriteFrame = null!;

    onLoad() {
        this.loginEventController.setData();
        this.btn_UIInventory.addAsyncListener(async () => {
            this.btn_UIInventory.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UIInventory", InventoryManager);
            this.btn_UIInventory.interactable = true;
        });
        this.btn_UISetting.addAsyncListener(async () => {
            this.btn_UISetting.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UI_Settings", SettingManager);
            this.btn_UISetting.interactable = true;
        });
        this.btn_UIMission.addAsyncListener(async () => {
            this.btn_UIMission.interactable = false;
            await PopupManager.getInstance().openAnimPopup("UIMission", UIMissionDetail);
            this.btn_UIMission.interactable = true;
        });
        this.showOwnedButton.addAsyncListener(async () => {
            this.showOwnedButton.interactable = false;
            await PopupManager.getInstance().openAnimPopup('PopupOwnedAnimals', PopupOwnedAnimals);
            this.showOwnedButton.interactable = true;
        });
        this.btn_UIGuildReward.addAsyncListener(async () => {
            this.btn_UIGuildReward.interactable = false;
            if (UserMeManager.Get.clan) {
                await PopupManager.getInstance().openAnimPopup('UI_ClanDetailInfo', PopupClanDetailInfo);
            }
            else {
                await PopupManager.getInstance().openAnimPopup('UI_ClanList', PopupClanList);
            }
            this.btn_UIGuildReward.interactable = true;
        });
        this.buySlotFarmButton.addAsyncListener(async () => {
            this.buySlotFarmButton.interactable = false;
            await PopupManager.getInstance().openAnimPopup('UI_ClanShopSlotPet', PopupShopSlotPetClan);
            this.buySlotFarmButton.interactable = true;
        });
        this.btnPetList.addAsyncListener(async () => {
            this.btnPetList.interactable = false;
            this.togglePetList();
            this.btnPetList.interactable = true;
        });

        this.btnPetList.node.active  = false;
        this.listPetMyFarm.active = false;
    }

    private togglePetList() {
        if (!this.canShowPetFarm()) {
            this.listPetMyFarm.active = false;
            this.isPetListVisible = false;
            return;
        }
        this.sprite.spriteFrame = this.isPetListVisible ? this.iconCollapse : this.iconExpand;
        this.isPetListVisible = !this.isPetListVisible;
        this.listPetMyFarm.active = this.isPetListVisible;
    }

    public async updatePetSlotInfo() {
        if (!this.canShowPetFarm()) {
            return;
        }
        this.btnPetList.node.active = true;
        this.listPetMyFarm.active = this.isPetListVisible;
        const petSlots = await WebRequestManager.instance.getClanPetAsync( UserMeManager.Get.clan.id, { is_active: true });
        const maxSlot = petSlots.length > 0 ? petSlots[0].max_slot_pet_active : UserMeManager.Get.clan.max_slot_pet_active;
        this.maxSlotPetActive.string = `Pet hoạt động: ${petSlots.length}/${maxSlot} (tối đa)`;
        if(!petSlots) return;
        for (const pet of petSlots) {
            const ui = this.petUIMap.get(pet.id);
            if (ui) {
                ui.updatePetExpProgress(pet);
            }
        }
    }

    private canShowPetFarm(): boolean {
        return (UserMeManager.CurrentOffice.roomEnds === RoomType.FARM && !!UserMeManager.Get?.clan &&!!UserMeManager.Get.clan.id && UserMeManager.Get.clan.id === UserMeManager.CurrentOffice.idclan);
    }

    public async ShowListPetFarm() {
        const requestId = ++this.showPetRequestId;
        this.listPetMyFarm.active = this.canShowPetFarm();
        this.isPetListVisible = this.canShowPetFarm();
        this.btnPetList.node.active = this.canShowPetFarm();
        this.svInvenoryClanPet.content.removeAllChildren();
        this.petUIItems.length = 0;
        const petSlots = await WebRequestManager.instance.getClanPetAsync(UserMeManager.Get.clan.id, { is_active: true });
        if (requestId !== this.showPetRequestId) {
            return;
        }
        petSlots.sort((a, b) => a.slot_index - b.slot_index);
        const maxSlot = petSlots.length > 0 ? petSlots[0].max_slot_pet_active : UserMeManager.Get.clan.max_slot_pet_active;
        this.maxSlotPetActive.string = `Pet Hoạt động: ${petSlots.length}/${maxSlot} (tối đa)`;
        for (const slot of petSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initPet(slot, () => { }, true);
            node.setParent(this.svInvenoryClanPet.content);
            this.petUIItems.push(ui);
            this.petUIMap.set(slot.id, ui);
        }
    }

    onMissionNotice(isShow: boolean) {
        this.redDotNoticeMission.active = isShow;
    }

    showNoticeLoginNewbie(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showNoticeLoginNewbieReward(isShow);
    }

    showNoticeLoginEvent(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showNoticeLoginEventReward(isShow);
    }

    showButtonLoginNewbie(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showButtonLoginNewbie(isShow);
    }

    showButtonLoginEvent(isShow: boolean) {
        if (this.loginEventController == null) return;
        this.loginEventController.showButtonLoginEvent(isShow);
    }

    public showBlockInteractHarvest(isBlock: boolean) {
        this.blockInteractHarvest.active = isBlock;
    }

}