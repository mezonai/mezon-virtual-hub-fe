import { _decorator, Button, RichText, Color, Sprite, Vec3 } from 'cc';
import { PopupManager } from './PopupManager';
import { BasePopup } from './BasePopup';
import { AudioType, SoundManager } from '../core/SoundManager';
const { ccclass, property } = _decorator;

@ccclass("PopupHarvestReceive")
export class PopupHarvestReceive extends BasePopup {
  @property(RichText) totalGoldReceive: RichText = null!;
  @property(RichText) totalScore: RichText = null!;
  @property(RichText) bonusPercent: RichText = null!;
  @property(RichText) remainingHarvest: RichText = null!;
  @property(Sprite) iconBonusPercent: Sprite = null!;
  @property(Button) closeButton: Button = null;
  private effectColors: Color;

  public init(param?: PopupHarvestReceiveParam) {
    SoundManager.instance.playSound(AudioType.Notice);
    this.closeButton.addAsyncListener(async () => {
      this.onButtonClick();
    });
    if (param == null) {
      this.onButtonClick();
      return;
    }
    const effectColor = param?.bonusPercent < 0 ? '#FF0000' : '#00b661ff';
    const effectColorHarvest = param?.remainingHarvest < 10 ? '#FF0000' : '#00b661ff';
    this.iconBonusPercent.node.active = param?.bonusPercent != 0;
    this.bonusPercent.string = `Điểm thu hoạch cây:<outline color=#FFFF><color=#CE6B00> ${param?.baseScore ?? 'Không rõ'}</size></color></outline> <outline color =#FFFF><color =${effectColor}> ${param?.bonusPercent < 0 ? '' : '+'}${param?.bonusPercent} %</size></color></outline>`;
    this.totalScore.string = `Tổng điểm: <outline color=#FFFF><color=#0C9EFF> ${param?.totalScore ?? 'Không rõ'}</size></color></outline>`;
    this.totalGoldReceive.string = `Vàng nhận được: <outline color=#CE6B00><color=#FFF500> ${param?.totalScore ?? 'Không rõ'}</size></color></outline>`;
    this.remainingHarvest.string = `Lượt thu hoạch còn lại: <outline color=#FFFF><color=${effectColorHarvest}> ${param?.remainingHarvest ?? 'Không rõ'}/${param?.maxHarvest ?? 'Không rõ'}</color>`;
    this.effectColors = param?.bonusPercent < 0
      ? new Color().fromHEX('#FF0000')
      : new Color().fromHEX('#00b661ff');

    if (this.iconBonusPercent) {
      this.iconBonusPercent.color = this.effectColors;
      this.iconBonusPercent.node.eulerAngles = new Vec3(0, 0, param?.bonusPercent < 0 ? 0 : 180);
    }
  }

  async onButtonClick() {
    await PopupManager.getInstance().closePopup(this.node.uuid);
  }
}

export interface PopupHarvestReceiveParam {
  baseScore: number, 
  totalScore: number, 
  bonusPercent: number, 
  remainingHarvest: number, 
  maxHarvest: number, 
}