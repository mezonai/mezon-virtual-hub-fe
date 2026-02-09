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

  @property(RichText) scoreReceiveBase: RichText = null!;
  @property(Sprite) iconScoreReceive: Sprite = null!;

  @property(RichText) goldReceiveBase: RichText = null!;
  @property(Sprite) iconGoldReceive: Sprite = null!;

  @property(RichText) catBonusRate: RichText = null!;
  @property(RichText) birdBonusRate: RichText = null!;

  @property(Node) petBonusRateNode: Node = null!;
  @property(RichText) remainingHarvest: RichText = null!;
  @property(Button) closeButton: Button = null;
  private _param: PopupHarvestReceiveParam;

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
    this._param = param;
    const effectColor = param?.bonusPercent < 0 ? '#FF0000' : '#00b661ff';
    this.petBonusRateNode.active = param?.catRateBonus != 0 || param?.birdRateBonus != 0;
    this.catBonusRate.node.active = param?.catRateBonus != 0;
    this.birdBonusRate.node.active = param?.birdRateBonus != 0;

    //Gold == score
    this.scoreReceiveBase.string = `Điểm thu hoạch:<outline color=#CE6B00><color=#FFF500> ${param?.finalScore ?? 'Không rõ'}</size></color></outline> (<outline color=#FFFF><color=#CE6B00> ${param?.baseScore ?? 'Không rõ'}</size></color></outline><outline color =#FFFF><color =${effectColor}>${param?.bonusPercent < 0 ? '' : ' + '}${param?.bonusPercent}%</size></color></outline>)`;
    this.goldReceiveBase.string = `Vàng thu hoạch:<outline color=#CE6B00><color=#FFF500>  ${param?.finalScore ?? 'Không rõ'} </size></color></outline> (<outline color=#FFFF><color=#CE6B00> ${param?.baseScore ?? 'Không rõ'}</size></color></outline><outline color =#FFFF><color =${effectColor}>${param?.bonusPercent < 0 ? '' : ' + '}${param?.bonusPercent}%</size></color></outline>)`;
    this.birdBonusRate.string = `Điểm từ pet:<outline color=#CE6B00><color=#FFF500> + ${param?.birdScoreBonus ?? '0'} </size></color></outline> (<outline color =#FFFF><color =${effectColor}>${param?.birdRateBonus < 0 ? '' : ' + '}${param?.birdRateBonus}%</size></color></outline>)`;
    this.catBonusRate.string = `Vàng từ pet:<outline color=#CE6B00><color=#FFF500> + ${param?.catGoldBonus ?? '0'} </size></color></outline> (<outline color =#FFFF><color =${effectColor}>${param?.catRateBonus < 0 ? '' : ' + '}${param?.catRateBonus}%</size></color></outline>)`;

    this.totalScore.string = `Điểm: <outline color=#CE6B00><color=#FFF500> ${param?.finalPlayerScore ?? 'Không rõ'}</size></color></outline>`;
    this.totalGoldReceive.string = `Vàng: <outline color=#CE6B00><color=#FFF500> ${param?.finalGold ?? 'Không rõ'}</size></color></outline>`;
    
    this.ShowIconScoreBonus(param);
    this.ShowIconGoldBonus(param);

    const isUnlimited = param?.maxHarvest === Constants.HARVEST_UNLIMITED;
    if (!isUnlimited) {
      const effectColorHarvest = param?.remainingHarvest < 10 ? '#FF0000' : '#00b661ff';
      this.remainingHarvest.string = `Lượt thu hoạch còn lại: <outline color=#FFFF><color=${effectColorHarvest}> ${param?.remainingHarvest ?? 'Không rõ'}/${param?.maxHarvest ?? 'Không rõ'}</color>`;
    }
    this.remainingHarvest.node.active = !isUnlimited;
  }

  ShowIconScoreBonus(param?: PopupHarvestReceiveParam){
    this.iconScoreReceive.node.active = param?.bonusPercent != 0;
    if (this.iconScoreReceive) {
      this.iconScoreReceive.color = param?.bonusPercent < 0 ? new Color().fromHEX('#FF0000') : new Color().fromHEX('#00b661ff');
      this.iconScoreReceive.node.eulerAngles = new Vec3(0, 0, param?.bonusPercent < 0 ? 0 : 180);
    }
  }

   ShowIconGoldBonus(param?: PopupHarvestReceiveParam){
    this.iconGoldReceive.node.active = param?.bonusPercent != 0;
    if (this.iconGoldReceive) {
      this.iconGoldReceive.color = param?.bonusPercent < 0 ? new Color().fromHEX('#FF0000') : new Color().fromHEX('#00b661ff');
      this.iconGoldReceive.node.eulerAngles = new Vec3(0, 0, param?.bonusPercent < 0 ? 0 : 180);
    }
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
  finalScore: number,
  catRateBonus: number,
  catGoldBonus: number,
  birdRateBonus: number,
  birdScoreBonus: number,
  remainingHarvest: number,
  maxHarvest: number,
}