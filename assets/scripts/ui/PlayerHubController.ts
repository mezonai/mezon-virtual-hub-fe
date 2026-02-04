import { _decorator, Button, Component, Node, Prefab, ScrollView, instantiate } from 'cc';
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

const { ccclass, property } = _decorator;

@ccclass('PlayerHubController')
export class PlayerHubController extends Component {
    @property(LoginEventController) private loginEventController: LoginEventController = null;
    @property(Button) private btn_UIInventory: Button = null!;
    @property(Button) private btn_UISetting: Button = null!;
    @property(Button) private btn_UIMission: Button = null!;
    @property(Button) private showOwnedButton: Button;
    @property(Button) private btn_UIGuildReward: Button = null!;
    @property(Node) private redDotNoticeMission: Node = null!;
    @property(Node) private blockInteractHarvest: Node = null!;

    @property(Node) private listPetMyFarm: Node = null!;
    @property(ScrollView) private svInvenoryClanPet: ScrollView = null!;
    @property(Prefab) private itemPrefab: Prefab = null!;
    private petUIItems: InventoryClanUIItem[] = [];
    private petSlots: ClanPetDTO[] = [];

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
        this.listPetMyFarm.active = false;
    }

    public async ShowListPetFarm(){
        if (UserMeManager.CurrentOffice.roomEnds !== RoomType.FARM || !UserMeManager.Get.clan || !UserMeManager.Get.clan.id || UserMeManager.Get.clan.id !== UserMeManager.CurrentOffice.idclan) {
            this.listPetMyFarm.active = false;
            return;
        }
        this.listPetMyFarm.active = true;
        this.svInvenoryClanPet.content.removeAllChildren();
        this.petSlots = await WebRequestManager.instance.getClanPetAsync(UserMeManager.Get.clan.id, { is_active: true });
        if (!this.petSlots.length) {
            this.listPetMyFarm.active = false;
            return;
        }
        for (const slot of this.petSlots) {
            const node = instantiate(this.itemPrefab);
            const ui = node.getComponent(InventoryClanUIItem)!;
            ui.initPet(slot, () => { }, true);
            node.setParent(this.svInvenoryClanPet.content);
            this.petUIItems.push(ui);
        }
    }

    onClickButtonA() {

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