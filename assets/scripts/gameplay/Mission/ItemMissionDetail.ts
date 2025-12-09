import { _decorator, Component, Label, Button, Color, Node } from "cc";
import { MissionDTO } from "../../Model/MissionDTO";
import { Sprite } from "cc";
import { RichText } from "cc";
import { Prefab } from "cc";
import { ObjectPoolManager } from "../../pooling/ObjectPoolManager";
import { RewardItemDTO, RewardType } from "../../Model/Item";
import { ScrollView } from "cc";
import { RewardItemMission } from "./RewardItemMission";
import { PopupGetPet, PopupGetPetParam } from "../../PopUp/PopupGetPet";
import { PopupManager } from "../../PopUp/PopupManager";
import { Constants } from "../../utilities/Constants";
import {
    PopupReward,
    PopupRewardParam,
    RewardStatus,
} from "../../PopUp/PopupReward";
const { ccclass, property } = _decorator;

enum MissionState {
    NOT_AVAILABLE,
    CLAIMABLE,
    CLAIMED,
}

type MissionConfig = {
    text: string;
    color: Color;
    interactable: boolean;
};

const MissionUIConfig: Record<MissionState, MissionConfig> = {
    [MissionState.CLAIMABLE]: {
        text: "Nhận",
        color: new Color(30, 152, 48),
        interactable: true,
    },
    [MissionState.CLAIMED]: {
        text: "Đã nhận",
        color: new Color(139, 21, 21),
        interactable: false,
    },
    [MissionState.NOT_AVAILABLE]: {
        text: "Chưa xong",
        color: new Color(127, 80, 54),
        interactable: false,
    },
};

@ccclass("ItemMissionDetail")
export class ItemMissionDetail extends Component {
    @property(RichText) rtDescription: RichText = null!;
    @property(RichText) rtProgress: RichText = null!;
    @property(Button) btnClaim: Button = null!;
    @property(Sprite) bgClaim: Sprite = null!;
    @property(Node) bgClaimed: Node = null!;
    @property(RichText) rtClaim: RichText = null!;
    @property(ScrollView) scrollView: ScrollView = null!;
    @property(Node) content: Node = null!;
    @property(Prefab) itemPrefab: Prefab = null!;
    private _missionDetail: MissionDTO;
    public get MissionDetail(): MissionDTO {
        return this._missionDetail;
    }

    public setData(
        mission: MissionDTO,
        onClaimCallback?: (missionId: string) => Promise<boolean>
    ) {
        if (!mission) return;
        this._missionDetail = mission;
        this.btnClaim.addAsyncListener(async () => {
            this.btnClaim.interactable = false;
            if (onClaimCallback) {
                const success = await onClaimCallback(mission.id);
                if (success) {
                    await this.showPopupReward(mission.rewards[0]); // chỉ show khi claim ok
                    this._missionDetail.is_claimed = true;
                    this.updateButtonState(MissionState.CLAIMED);
                }
            }
            this.btnClaim.interactable = true;
        });
        this.rtDescription.string = mission.description;
        const color =
            mission.progress >= mission.total_progress ? "#FF5733" : "#6D3723";
        this.rtProgress.string = `<color=${color}>${mission.progress}/${mission.total_progress}</color>`;
        const state = mission.is_claimed
            ? MissionState.CLAIMED
            : mission.is_completed
                ? MissionState.CLAIMABLE
                : MissionState.NOT_AVAILABLE;
        this.updateButtonState(state);
        this.LoadDataReward(mission.rewards);
    }

    async showPopupReward(reward: RewardItemDTO) {
        if (reward.type == RewardType.PET) {
            const petReward = reward.pet;
            const param: PopupGetPetParam = {
                pet: petReward,
            };
            await PopupManager.getInstance().openPopup(
                "PopupGetPet",
                PopupGetPet,
                param
            );
            return;
        }
        const name = Constants.getNameItem(reward);          
        const content = `Chúc mừng bạn nhận thành công ${name}`;
        const paramPopup: PopupRewardParam = {
            status: RewardStatus.GAIN,
            content: content,
            reward
        };
        await PopupManager.getInstance().openPopup(
            "PopupReward",
            PopupReward,
            paramPopup
        );
    }

    private updateButtonState(state: MissionState) {
        const mcf = MissionUIConfig[state];
        this.btnClaim.interactable = mcf.interactable;
        this.rtClaim.string = mcf.text;
        this.bgClaim.color = mcf.color;
        this.bgClaimed.active = state == MissionState.CLAIMED;
    }

    async LoadDataReward(rewards: RewardItemDTO[]) {
        ObjectPoolManager.instance.returnArrayToPool(this.content.children);
        await this.spawnReward(rewards);
        this.ResetPositionScrollBar();
    }

    private async spawnReward(rewards: RewardItemDTO[]) {
        rewards.forEach((reward) => {
            let itemNode = ObjectPoolManager.instance.spawnFromPool(
                this.itemPrefab.name
            );
            itemNode.active = true;
            itemNode.setParent(this.content);
            const comp = itemNode.getComponent(RewardItemMission);
            if (comp) {
                comp.setupReward(reward);
            }
        });
    }

    ResetPositionScrollBar() {
        this.scheduleOnce(() => {
            if (this.scrollView) {
                this.scrollView.scrollToTop(0);
            }
        }, 0.05);
    }
}
