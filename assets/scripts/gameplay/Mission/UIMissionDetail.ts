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
import { RewardType } from '../../Model/Item';
import { director } from 'cc';
import { PopupReward, PopupRewardParam, RewardNewType, RewardStatus } from '../../PopUp/PopupReward';
import { Constants } from '../../utilities/Constants';
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
            await PopupManager.getInstance().closeAllPopups();
            this.checkMissionNotice(this.allMissions);
        });
        this.GetMission();
    }

    private GetMission() {
        WebRequestManager.instance.getMission(
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
        this.onTabChange(this.categories[0])
    }

    private checkMissionNotice(missionList: MissionListDTO) {
        if (!missionList) return;
        const hasUnclaimedDaily = missionList.daily.some(m => m.is_completed && !m.isClaimed);
        const hasUnclaimedWeekly = missionList.weekly.some(m => m.is_completed && !m.isClaimed);

        const hasUnclaimed = hasUnclaimedDaily || hasUnclaimedWeekly;
        director.emit(EVENT_NAME.ON_MISSION_NOTICE, hasUnclaimed);
    }

    private onApiError(error) {
        const param: ConfirmParam = {
            message: error.error_message,
            title: "Chú ý",
        };
        PopupManager.getInstance().openPopup('ConfirmPopup', ConfirmPopup, param);
    }

    private async onTabChange(tabName) {
        ObjectPoolManager.instance.returnArrayToPool(this.content.children);
        await this.spawnMissions(this.groupedItems[tabName]);
        this.ResetPositionScrollBar();
    }

    private ResetPositionScrollBar() {
        this.scheduleOnce(() => {
            if (this.scrollView) {
                this.scrollView.scrollToTop(0)
            }
        }, 0.05);
    }

    private async spawnMissions(missions: any[]) {
        missions.forEach(mission => {
            let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
            itemNode.active = true;
            itemNode.setParent(this.content);
            const comp = itemNode.getComponent(ItemMissionDetail);
            if (comp) {
                comp.setData(mission);
                comp.onClick = this.claimReward.bind(this);
            }
        });
    }

    private claimReward(item: ItemMissionDetail) {
        // const missionType = item.MissionDetail.type;
        // const missionId = item.MissionDetail.id;
        // console.log("Claim reward:");
        // let targetList = missionType === MissionType.DAILY ? this.allMissions.daily : this.allMissions.weekly;
        // const mission = targetList.find(m => m.id === missionId);
        // if (mission && mission.is_completed && !mission.isClaimed) {
        //     mission.isClaimed = true;
        //     //this.handleGetReward(mission.rewards);
        // }

        // item.updateClaimedState();
        // this.checkMissionNotice(this.allMissions);
        // WebRequestManager.instance.getRewardByMissionId(
        //     missionId,
        //     (response) => this.showUIMision(response),
        //     (error) => this.onApiError(error)
        // );
    }

     handleGetReward(response: any) {
        // const rewardsData = response?.data?.rewards ?? [];
        // const rewardItems = ConvetData.ConvertReward(rewardsData);
        // if (!rewardItems.length) return;
        // const rewardItems = response;
        // const rewardNameMap: Record<RewardNewType, string> = {
        //     [RewardNewType.NORMAL_FOOD]: "Thức ăn sơ cấp",
        //     [RewardNewType.PREMIUM_FOOD]: "Thức ăn cao cấp",
        //     [RewardNewType.ULTRA_PREMIUM_FOOD]: "Thức ăn siêu cao cấp",
        //     [RewardNewType.GOLD]: "Vàng",
        //     [RewardNewType.DIAMOND]: "Kim cương",
        // };

        // for (const reward of rewardItems) {
        //     const type = Constants.mapRewardType(reward);
        //     const name = rewardNameMap[type] ?? "Phần thưởng";

        //     const quantity = (reward.type === RewardType.GOLD || reward.type === RewardType.DIAMOND)
        //         ? reward.amount : reward.quantity;

        //     const param: PopupRewardParam = {
        //         rewardType: type,
        //         quantity,
        //         status: RewardStatus.GAIN,
        //         content: `Chúc mừng bạn nhận thành công \n${name}`,
        //     };
        //     PopupManager.getInstance().openPopup("PopupReward", PopupReward, param);
        // }
    }


    private groupByCategory(missionList: MissionListDTO): Record<string, MissionDTO[]> {
        return {
            [MissionType.DAILY]: missionList.daily,
            [MissionType.WEEKLY]: missionList.weekly
        };
    }
}