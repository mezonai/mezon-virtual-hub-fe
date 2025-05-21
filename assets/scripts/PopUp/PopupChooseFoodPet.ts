import { _decorator, Button, Component, instantiate, Node, Prefab, ScrollView } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { ItemChooseFood } from '../animal/ItemChooseFood';
import { ConfirmPopup } from './ConfirmPopup';
import { UserMeManager } from '../core/UserMeManager';
import { ServerManager } from '../core/ServerManager';
import { AnimalType } from '../animal/AnimalController';
import { UIManager } from '../core/UIManager';

const { ccclass, property } = _decorator;

@ccclass('PopupChooseFoodPet')
export class PopupChooseFoodPet extends BasePopup {
    @property({ type: Button }) closeButton: Button = null;
    @property({ type: Button }) chooseButton: Button = null;
    @property({ type: Prefab }) iItemChooseFood: Prefab = null;
    @property({ type: ScrollView }) scrollView: ScrollView = null;
    private quality: number = 0;
    private type: number = 0;
    public async init(param?) {
        if (!param || param.animal == null) {
            return;
        }
        this.showPopup(param);
    }

    showPopup(param?: any) {
        for (let i = 0; i < 3; i++) {
            let newitem = instantiate(this.iItemChooseFood);
            newitem.setParent(this.scrollView.content);
            let itemChooseFood = newitem.getComponent(ItemChooseFood);
            if (itemChooseFood == null) continue;
            itemChooseFood.setDataItem(i, this.chooseFood.bind(this));
        }
        this.chooseButton.node.on(Button.EventType.CLICK, () => {
            (async () => {
                if(param.animal.animalMoveType == AnimalType.Caught){
                    UIManager.Instance.showNoticePopup("Thông báo", `Thú cưng đã bị bắt. Chúc bạn may mắn lần sau`);
                    this.closePopup();
                    return;
                }
                 if (this.quality <= 0) {
                     PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, { message: `${this.type} không còn để cho ăn` });
                     return;
                }
                if (param.onThrowFood) {
                    this.node.active = false;
                    await param.onThrowFood(this.type);
                    let data = {
                        player: UserMeManager.Get.user,
                        petId: param.animal.pet.id
                    }                   
                    ServerManager.instance.sendCatchPet(data);
                }
                this.closePopup();
            })();
        }, this);

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            if (param.onCancelCatch) param.onCancelCatch();
            this.closePopup();
        }, this);
    }

    chooseFood(type: number, quality: number) {
        this.quality = quality;
        this.type = type;
    }

    async closePopup() {
        await PopupManager.getInstance().closePopup(this.node.uuid, true);
    }

    onButtonClick() {
        this.closePopup();
    }
}


