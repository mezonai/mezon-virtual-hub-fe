import { _decorator, Button, RichText, Color, Sprite, Vec3, Node } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { AudioType, SoundManager } from '../core/SoundManager';
import { Constants } from '../utilities/Constants';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass("PopupHarvestReceive")
export class PopupHarvestReceive extends BasePopup {
  @property(RichText) totalGoldReceive: RichText = null!;
  @property(RichText) totalScore: RichText = null!;
  @property(RichText) bonusPercent: RichText = null!;
  @property(RichText) remainingHarvest: RichText = null!;
  @property(Sprite) iconBonusPercent: Sprite = null!;
  @property(RichText) catBonusRate: RichText = null!;
  @property(RichText) birdBonusRate: RichText = null!;
  @property(Node) petBonusRateNode: Node = null!;
  @property(Button) closeButton: Button = null;

  public init(param?: PopupHarvestReceiveParam) {
    SoundManager.instance.playSound(AudioType.Notice);
    this.closeButton.addAsyncListener(async () => {
      this.closeButton.interactable = false;
      await GameManager.instance.playerHubController.updatePetSlotInfo();
      await this.onButtonClick();
    });
    if (param == null) {
      this.onButtonClick();
      return;
    }
    const effectColor = param?.bonusPercent < 0 ? '#FF0000' : '#00b661ff';
    this.iconBonusPercent.node.active = param?.bonusPercent != 0;
    this.bonusPercent.string = `Điểm thu hoạch cây:<outline color=#FFFF><color=#CE6B00> ${param?.baseScore ?? 'Không rõ'}</size></color></outline> <outline color =#FFFF><color =${effectColor}>${param?.bonusPercent < 0 ? '' : '+'}${param?.bonusPercent}%</size></color></outline>`;
    if (this.iconBonusPercent) {
      this.iconBonusPercent.color = param?.bonusPercent < 0 ? new Color().fromHEX('#3a1919') : new Color().fromHEX('#00b661ff');
      this.iconBonusPercent.node.eulerAngles = new Vec3(0, 0, param?.bonusPercent < 0 ? 0 : 180);
    }

    this.petBonusRateNode.active = param?.catBonusRate != 0 || param?.birdBonusRate != 0;
    this.catBonusRate.node.active = param?.catBonusRate != 0;
    this.birdBonusRate.node.active = param?.birdBonusRate != 0;
    this.birdBonusRate.string = `Điểm từ pet nông trại: <outline color=#CE6B00><color=#FFF500> ${param?.birdBonusRate ?? '0'}</size></color></outline>`;
    this.catBonusRate.string = `Vàng từ pet nông trại:: <outline color=#CE6B00><color=#FFF500> ${param?.catBonusRate ?? '0'}</size></color></outline>`;

    this.totalScore.string = `Điểm: <outline color=#FFFF><color=#0C9EFF> ${param?.finalPlayerScore ?? 'Không rõ'}</size></color></outline>`;
    this.totalGoldReceive.string = `Vàng: <outline color=#CE6B00><color=#FFF500> ${param?.finalGold ?? 'Không rõ'}</size></color></outline>`;

    const isUnlimited = param?.maxHarvest === Constants.HARVEST_UNLIMITED;
    if (!isUnlimited) {
      const effectColorHarvest = param?.remainingHarvest < 10 ? '#FF0000' : '#00b661ff';
      this.remainingHarvest.string = `Lượt thu hoạch còn lại: <outline color=#FFFF><color=${effectColorHarvest}> ${param?.remainingHarvest ?? 'Không rõ'}/${param?.maxHarvest ?? 'Không rõ'}</color>`;
    }
    this.remainingHarvest.node.active = !isUnlimited;
  }

  async onButtonClick() {
    await PopupManager.getInstance().closePopup(this.node.uuid);
  }
}

export interface PopupHarvestReceiveParam {
  baseScore: number,
  finalPlayerScore: number,
  finalGold: number,
  bonusPercent: number,
  catBonusRate: number,
  birdBonusRate: number,
  remainingHarvest: number,
  maxHarvest: number,
}