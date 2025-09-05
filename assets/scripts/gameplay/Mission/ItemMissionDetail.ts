import { _decorator, Component, Label, Button, Color, Node } from 'cc';
import { MissionDTO, RewardDTO } from '../../Model/MissionDTO';
import { Sprite } from 'cc';
import { RichText } from 'cc';
import { Prefab } from 'cc';
import { ObjectPoolManager } from '../../pooling/ObjectPoolManager';
import { RewardItemDTO } from '../../Model/Item';
import { ScrollView } from 'cc';
import { RewardItemMission } from './RewardItemMission';
const { ccclass, property } = _decorator;

enum MissionState {
    NOT_AVAILABLE,
    CLAIMABLE,
    CLAIMED
}

type MissionConfig = {
    text: string;
    color: Color;
    interactable: boolean;
};

const MissionUIConfig: Record<MissionState, MissionConfig> = {
    [MissionState.CLAIMABLE]: { text: "Nhận", color: new Color(30, 152, 48), interactable: true },
    [MissionState.CLAIMED]: { text: "Đã nhận", color: new Color(139, 21, 21), interactable: false },
    [MissionState.NOT_AVAILABLE]: { text: "Chưa xong", color: new Color(127, 80, 54), interactable: false }
};

@ccclass('ItemMissionDetail')
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

    public onClick: ((item: ItemMissionDetail) => void) | null = null;
    private _missionDetail: MissionDTO;
    public get MissionDetail(): MissionDTO {
        return this._missionDetail;
    }

    start() {
        if (this.btnClaim) {
            this.btnClaim.node.on(Button.EventType.CLICK, () => {
                if (this.onClick) { this.onClick(this); }
            });
        }
    }
    public setData(data: MissionDTO) {
       if (!data) return;
        this._missionDetail = data;
        this.btnClaim.node.on(Button.EventType.CLICK, () => {
            if (this.onClick) {
                this.onClick(this);
            }
        });
        this.rtDescription.string = data.description;
        const color = data.progress >= data.total_progress ? "#FF5733" : "#6D3723";
        this.rtProgress.string = `<color=${color}>${data.progress}/${data.total_progress}</color>`;
        const state = data.isClaimed ? MissionState.CLAIMED : data.is_completed ? MissionState.CLAIMABLE :
            MissionState.NOT_AVAILABLE;
        this.bgClaimed.active = state == MissionState.CLAIMED;
        this.updateButtonState(state);
        this.LoadDataReward(data.rewards);
    }

    private updateButtonState(state: MissionState) {
        const mcf = MissionUIConfig[state];
        this.btnClaim.interactable = mcf.interactable;
        this.rtClaim.string = mcf.text;
        this.bgClaim.color = mcf.color;
    }

    public updateClaimedState() {
        this._missionDetail.isClaimed = true;
        this.updateButtonState(MissionState.CLAIMED);
    }

    async LoadDataReward(rewards: RewardDTO[]) {
        ObjectPoolManager.instance.returnArrayToPool(this.content.children);
        await this.spawnReward(rewards);
        this.ResetPositionScrollBar();
    }

    private async spawnReward(rewards: any[]) {
        rewards.forEach(reward => {
            let itemNode = ObjectPoolManager.instance.spawnFromPool(this.itemPrefab.name);
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
                this.scrollView.scrollToTop(0)
            }
        }, 0.05);
    }
}
