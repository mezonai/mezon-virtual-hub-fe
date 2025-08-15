import { EditBox } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { PopupSelection, SelectionParam } from './PopupSelection';
import { Constants } from '../utilities/Constants';
import { ConfirmParam, ConfirmPopup } from './ConfirmPopup';
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
                await this.showConfirm(`Bạn cần nhập số diamond để thách đấu`);
                return;
            }
            const diamondChallenge = Number(value);
            const diamondUser = UserMeManager.playerDiamond;

            if (diamondChallenge < this.minDimond || diamondChallenge > this.maxDimond) {
                await this.showConfirm(`Số diamond thách đấu phải lớn hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.minDimond)} diamond</color> và nhỏ hơn <color=#FF0000> ${Utilities.convertBigNumberToStr(this.maxDimond)} diamond</color>`);
                return;
            }

            if (diamondChallenge > diamondUser) {
                await this.showConfirm(`Bạn không đủ diamond để thách đấu`);
                return;
            }
            if (param.onActionChallenge) await param.onActionChallenge(diamondChallenge);
        })
    }

    initPopup() {
        this.editBoxChallenge.inputMode = EditBox.InputMode.NUMERIC;
    }

    async closePopup(onActionClose?: () => Promise<void>) {
        if (onActionClose) await onActionClose();
        await PopupManager.getInstance().closePopup(this.node?.uuid);
    }

    private async showConfirm(message: string) {
        const paramConfirmPopup: ConfirmParam = {
            message,
            title: "Thông báo",
        };
        await PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, paramConfirmPopup);
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
            ,
            onActionButtonLeft: async () => {

            }
        };
        await PopupManager.getInstance().openAnimPopup("PopupSelection", PopupSelection, param);
    }

}
export interface PopupPetBetChallengeParam {
    onActionChallenge?: (diamondChallenge: number) => Promise<void>;
    onActionClose?: () => Promise<void>;
}


