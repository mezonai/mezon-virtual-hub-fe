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
const { ccclass, property } = _decorator;

@ccclass('UIMissionDetail')
export class UIMissionDetail extends BasePopup {
  @property(ScrollView) scrollView: ScrollView = null!;
  @property(Node) content: Node = null!;
  @property(Prefab) itemPrefab: Prefab = null!;
  @property(Button) btnClose: Button = null!;
  @property({ type: TabController }) tabController: TabController = null;
  private groupedItems: Record<string, MissionDTO[]> = null;
  private categories: string[] = [];
  private allMissions: MissionListDTO;

  public init(param?: any): void {
    this.btnClose.addAsyncListener(async () => {
      this.btnClose.interactable = false;
      if (this.allMissions) await this.checkMissionNotice(this.allMissions);
      await PopupManager.getInstance().closeAllPopups();
    });
    this.GetMission();
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
    this.categories = [];
    for (const category in this.groupedItems) {
      this.categories.push(category);
    }
    this.tabController.initTabData(this.categories);
    this.tabController.node.on(EVENT_NAME.ON_CHANGE_TAB, (tabName) => {
      this.onTabChange(tabName);
    });
    this.onTabChange(this.categories[0]);
  }

  private checkMissionNotice(missionList: MissionListDTO) {
    if (!missionList) return;
    const hasUnclaimedDaily = missionList.daily.some(
      (m) => m.is_completed && !m.is_claimed
    );
    const hasUnclaimedWeekly = missionList.weekly.some(
      (m) => m.is_completed && !m.is_claimed
    );

    const hasUnclaimed = hasUnclaimedDaily || hasUnclaimedWeekly;
    GameManager.instance.playerHubController.onMissionNotice(hasUnclaimed);
  }

  private onApiError(error) {
    const param: ConfirmParam = {
      message: error.error_message,
      title: "Chú ý",
    };
    PopupManager.getInstance().openPopup("ConfirmPopup", ConfirmPopup, param);
  }

  private async onTabChange(tabName) {
    ObjectPoolManager.instance.returnArrayToPool(this.content.children);
    await this.spawnMissions(this.groupedItems[tabName]);
    this.ResetPositionScrollBar();
  }

  private ResetPositionScrollBar() {
    this.scheduleOnce(() => {
      if (this.scrollView) {
        this.scrollView.scrollToTop(0);
      }
    }, 0.05);
  }

  private async spawnMissions(missions: any[]) {
    missions.forEach((mission) => {
      let itemNode = ObjectPoolManager.instance.spawnFromPool(
        this.itemPrefab.name
      );
      itemNode.active = true;
      itemNode.setParent(this.content);
      const comp = itemNode.getComponent(ItemMissionDetail);
      if (comp) {
        comp.setData(mission, this.claimReward.bind(this));
      }
    });
  }

  private async claimReward(missionId: string) {
    const completed = await WebRequestManager.instance.claimRewardAsync(
      missionId
    );
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
