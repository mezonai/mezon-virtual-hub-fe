import { _decorator, Button, EditBox, Toggle, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { PopupSelection, SelectionParam } from './PopupSelection';
import { Constants } from '../utilities/Constants';
import { UserMeManager } from '../core/UserMeManager';
import Utilities from '../utilities/Utilities';
const { ccclass, property } = _decorator;

@ccclass('PopupPetBetChallenge')
export class PopupPetBetChallenge extends BasePopup {
    @property({ type: EditBox }) editBoxChallenge: EditBox = null;
    @property({ type: Button }) closeButton: Button = null
    @property({ type: Button }) ChallengeButton: Button = null
    @property({ type: Toggle }) toggleDiamond: Toggle = null;
    @property({ type: Toggle }) toggleGold: Toggle = null;
    @property({ type: RichText }) title: RichText = null;
    minValue: number = 1000;
    maxValue: number = 100000;

    private isDiamond : boolean;
    public async init(param?: PopupPetBetChallengeParam) {
        if (!param) {
            await PopupManager.getInstance().closePopup(this.node?.uuid);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            await this.showSelectionPopup("Bạn muốn hủy việc thách đấu ?")
        })
        this.title.string = param.title || 'Thách đấu';
        this.toggleDiamond.isChecked = true;
        this.toggleGold.isChecked = false;
        this.isDiamond = true;

        this.toggleGold.node.on(Toggle.EventType.TOGGLE, () => {
            this.updateBetType();
        });

        this.toggleDiamond.node.on(Toggle.EventType.TOGGLE, () => {
            this.updateBetType();
        });

        this.ChallengeButton.addAsyncListener(async () => {
            const value = this.editBoxChallenge.string;
            if (Constants.isNullOrWhiteSpace(value)) {
                await Constants.showConfirm(`Bạn cần nhập số ${this.isDiamond ? 'diamond' : 'gold'} để thách đấu`, "Thông báo");
                return;
            }

            const currentValue = Number(value);
            const userValue  = this.isDiamond ? UserMeManager.playerDiamond: UserMeManager.playerCoin;

            if (currentValue < this.minValue || currentValue > this.maxValue) {
                await Constants.showConfirm(`Số ${this.isDiamond ? 'diamond' : 'gold'} thách đấu phải lớn hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.minValue)} diamond</color> và nhỏ hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.maxValue)} diamond</color>`, "Thông báo");
                return;
            }

            if (currentValue > userValue) {
                await Constants.showConfirm(`Bạn không đủ ${this.isDiamond ? 'diamond' : 'gold'} để thách đấu`, "Thông báo");
                return;
            }
            if (param.onActionChallenge) await param.onActionChallenge(currentValue, this.isDiamond);
            await this.closePopup();
        })
    }

    private updateBetType() {
        this.isDiamond = this.toggleDiamond.isChecked;
    }

    initPopup() {
        this.editBoxChallenge.inputMode = EditBox.InputMode.NUMERIC;
    }

    async closePopup(onActionClose?: () => Promise<void>) {
        if (onActionClose) await onActionClose();
        await PopupManager.getInstance().closePopup(this.node?.uuid);
    }

    async showSelectionPopup(content: string = "") {
        const param: SelectionParam = {
            content: content,
            textButtonLeft: "Không",
            textButtonRight: "Có",
            textButtonCenter: "",
            onActionButtonRight: async () => {
                await this.closePopup();
            }
        };
        await PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

}
export interface PopupPetBetChallengeParam {
    title: string;
    onActionChallenge?: (diamondChallenge: number, isDiamond:boolean) => Promise<void>;
    onActionClose?: () => Promise<void>;
}


