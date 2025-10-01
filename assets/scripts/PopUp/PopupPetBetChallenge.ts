import { _decorator, Button, EditBox } from 'cc';
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
    minDimond: number = 1000;
    maxDimond: number = 100000;

    public async init(param?: PopupPetBetChallengeParam) {
        if (!param) {
            await PopupManager.getInstance().closePopup(this.node?.uuid);
            return;
        }
        this.closeButton.addAsyncListener(async () => {
            await this.showSelectionPopup("Bạn muốn hủy việc thách đấu ?")
        })
        this.ChallengeButton.addAsyncListener(async () => {
            const value = this.editBoxChallenge.string;
            if (Constants.isNullOrWhiteSpace(value)) {
                await  Constants.showConfirm(`Bạn cần nhập số diamond để thách đấu`, "Thông báo");
                return;
            }
            const diamondChallenge = Number(value);
            const diamondUser = UserMeManager.playerDiamond;

            if (diamondChallenge < this.minDimond || diamondChallenge > this.maxDimond) {
                await Constants.showConfirm(`Số diamond thách đấu phải lớn hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.minDimond)} diamond</color> và nhỏ hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.maxDimond)} diamond</color>`, "Thông báo");
                return;
            }

            if (diamondChallenge > diamondUser) {
                await Constants.showConfirm(`Bạn không đủ diamond để thách đấu`, "Thông báo");
                return;
            }
            if (param.onActionChallenge) await param.onActionChallenge(diamondChallenge);
            await this.closePopup();
        })
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
    onActionChallenge?: (diamondChallenge: number) => Promise<void>;
    onActionClose?: () => Promise<void>;
}


