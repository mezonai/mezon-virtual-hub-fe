import { _decorator, Component, Node } from 'cc';
import { ShopController } from '../gameplay/shop/ShopController';
import { InventoryManager } from '../gameplay/player/inventory/InventoryManager';
import { UIChat } from '../gameplay/ChatBox/UIChat';
import { UIMission } from '../gameplay/Mission/UIMission';
import { SettingManager } from './SettingManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static get instance() {
        return GameManager._instance;
    }
    @property({type: ShopController}) shopController: ShopController = null;
    @property({type: InventoryManager}) inventoryController: InventoryManager = null;  
    @property({type: UIChat}) uiChat: UIChat = null;
    @property({type: UIMission}) uiMission: UIMission = null;
    @property({type: SettingManager}) settingManager: SettingManager = null;

    protected onLoad(): void {
        if (GameManager._instance == null) {
            GameManager._instance = this;
        }
    }

    public init() {
        this.shopController.init();
        this.inventoryController.init();
        this.uiMission.getMissionEventData();
    }

    protected onDestroy(): void {
        GameManager._instance = null;
    }
}


