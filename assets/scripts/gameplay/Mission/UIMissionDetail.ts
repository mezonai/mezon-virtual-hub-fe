import { _decorator, Component, Node, Prefab, Toggle, ToggleContainer } from 'cc';
import { BasePopup } from '../../PopUp/BasePopup';
import { ObjectPoolManager } from '../../pooling/ObjectPoolManager';
import { ItemMissionDetail } from './ItemMissionDetail';
import { MissionDTO, MissionListDTO, MissionType } from '../../Model/MissionDTO';
import { Button } from 'cc';
import { PopupManager } from '../../PopUp/PopupManager';
import { WebRequestManager } from '../../network/WebRequestManager';
import { ConfirmParam, ConfirmPopup } from '../../PopUp/ConfirmPopup';
import { ScrollView } from 'cc';
import { TabController } from '../../ui/TabController';
import { EVENT_NAME } from '../../network/APIConstant';
import { GameManager } from '../../core/GameManager';
import { Constants } from '../../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('UIMissionDetail')
export class UIMissionDetail extends BasePopup {
  @property(ScrollView) scrollView: ScrollView = null!;
  @property(Node) content: Node = null!;
  @property(Prefab) itemPrefab: Prefab = null!;
  @property(Button) btnClose: Button = null!;
  @property(Toggle) toggleDaily: Toggle = null!;
  @property(Toggle) toggleWeekly: Toggle = null!;
  @property(Node) contentDailyParent: Node = null!;
  @property(Node) contentWeeklyParent: Node = null!;
  @property(Node) contentDaily: Node = null!;
  @property(Node) contentWeekly: Node = null!;
  @property(Node) noticeDaily: Node = null!;
  @property(Node) noticeWeekly: Node = null!;

  private groupedItems: Record<string, MissionDTO[]> = null;
  private allMissions: MissionListDTO;

  public init(): void {
    this.btnClose.addAsyncListener(async () => {this.onCloseClick();});
    this.toggleDaily.node.on(Toggle.EventType.TOGGLE, this.onDailyTab, this);
    this.toggleWeekly.node.on(Toggle.EventType.TOGGLE, this.onWeeklyTab, this);
    this.GetMission();
  }

  private async onCloseClick() {
    this.btnClose.interactable = false;
    if (this.allMissions) {
      this.checkMissionNotice(this.allMissions);
    }
    await PopupManager.getInstance().closeAllPopups();
    this.btnClose.interactable = true;
  }

  private onDailyTab() {
    this.onTabChange(MissionType.DAILY);
  }

  private onWeeklyTab() {
    this.onTabChange(MissionType.WEEKLY);
  }
  private GetMission() {
    WebRequestManager.instance.getMission(
      {},
      (response) => this.showUIMision(response.data),
      (error) => this.onApiError(error)
    );
  }

  private showUIMision(missionListDTO: MissionListDTO) {
    this.allMissions = missionListDTO;
    this.groupedItems = this.groupByCategory(missionListDTO);
    this.updateTabNotices(missionListDTO);

    this.toggleDaily.isChecked = true;
    this.onTabChange(MissionType.DAILY);
  }

  private getUnclaimedStatus(missionList: MissionListDTO): {
    daily: boolean;
    weekly: boolean;
    any: boolean;
  } {
    if (!missionList) return { daily: false, weekly: false, any: false };

    const daily = missionList.daily.some((m) => m.is_completed && !m.is_claimed);
    const weekly = missionList.weekly.some((m) => m.is_completed && !m.is_claimed);

    return { daily, weekly, any: daily || weekly,};
  }

  private checkMissionNotice(missionList: MissionListDTO) {
    const status = this.getUnclaimedStatus(missionList);
    GameManager.instance.playerHubController.onMissionNotice(status.any);
  }

  private updateTabNotices(missionList: MissionListDTO) {
    const status = this.getUnclaimedStatus(missionList);

    if (this.noticeDaily) this.noticeDaily.active = status.daily;
    if (this.noticeWeekly) this.noticeWeekly.active = status.weekly;
  }

  private onApiError(error) {
    const param: ConfirmParam = {
      message: error.error_message,
      title: "Chú ý",
    };
    PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, param);
  }

  private async onTabChange(missonType: MissionType) {
    let targetContent = missonType == MissionType.WEEKLY ?  this.contentWeekly : this.contentDaily;
    let missions = this.groupedItems[missonType] || [];
    this.contentDailyParent.active = missonType == MissionType.DAILY;
    this.contentWeeklyParent.active = missonType == MissionType.WEEKLY;
    if (targetContent.children.length === 0) {
      await this.spawnMissions(missions, targetContent);
      this.ResetPositionScrollBar();
    }    
  }

  private ResetPositionScrollBar() {
    this.scheduleOnce(() => {
      if (this.scrollView) {
        this.scrollView.scrollToTop(0);
      }
    }, 0.05);
  }

  private async spawnMissions(missions: MissionDTO[], parent: Node) {
    for (let i = 0; i < missions.length; i++) {
      let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
      itemNode.active = true;
      itemNode.setParent(parent);
      const comp = itemNode.getComponent(ItemMissionDetail);
      if (comp) {
        comp.setData(missions[i], this.claimReward.bind(this));
      }
    }
    await Constants.waitUntil(() => this.node == null || parent == null || parent.children.length == missions.length);
  }

  private async claimReward(missionId: string) {
      const completed = await WebRequestManager.instance.claimRewardAsync(missionId);
      if (completed) {
        const allMissions = [...this.allMissions.daily, ...this.allMissions.weekly];
        const mission = allMissions.find(m => m.id === missionId);
        if (mission) {
          mission.is_claimed = true;
        }

        this.updateTabNotices(this.allMissions);
        this.checkMissionNotice(this.allMissions);
      }
  return completed;
  }

  private groupByCategory(
    missionList: MissionListDTO
  ): Record<string, MissionDTO[]> {
    return {
      [MissionType.DAILY]: missionList.daily,
      [MissionType.WEEKLY]: missionList.weekly,
    };
  }
}
