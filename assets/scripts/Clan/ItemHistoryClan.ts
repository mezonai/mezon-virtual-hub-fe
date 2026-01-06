import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ClanActivityActionType, ClanActivityItemDTO } from '../Interface/DataMapAPI';
import { Constants } from '../utilities/Constants';
const { ccclass, property } = _decorator;

@ccclass('ItemHistoryClan')
export class ItemHistoryClan extends Component {
    @property(Label) textContent: Label = null!;

    setData(data: ClanActivityItemDTO) {
        let text = '';

        switch (data.actionType) {
            case ClanActivityActionType.HARVEST:
                text = `- ${data.userName} thu hoạch ${Constants.getPlantName(data.itemName)?.toLowerCase() || 'vật phẩm'}${data.amount && data.amount > 0 ? ` và nhận ${data.amount} vàng vào quỹ văn phòng` : ''} lúc ${data.time} tại nông trại ${Constants.getOfficeName(data.officeName)}`;
                break;

            case ClanActivityActionType.HARVEST_INTRUDER:
                text = `- ${data.userName} của văn phòng ${Constants.getOfficeName(data.officeName)} đã thu hoạch trộm ${data.quantity ?? 0} x ${Constants.getPlantName(data.itemName)?.toLowerCase() || 'vật phẩm'}${data.amount && data.amount > 0 ? ` và nhận ${data.amount} vàng vào quỹ văn phòng ${Constants.getOfficeName(data.officeName)}` : ''} lúc ${data.time}`;
                break;

            case ClanActivityActionType.HARVESTED_OTHER_FARM:
                text = `- ${data.userName} đã thu hoạch trộm ${data.quantity ?? 0} x ${Constants.getPlantName(data.itemName)?.toLowerCase() || 'vật phẩm'}${data.amount && data.amount > 0 ? ` và nhận ${data.amount} vàng vào quỹ văn phòng` : ''} lúc ${data.time} tại nông trại ${Constants.getOfficeName(data.officeName)}`;
                break;

            case ClanActivityActionType.PURCHASE:
                text = `- ${data.userName} mua ${data.quantity ?? 0} x ${Constants.getPlantName(data.itemName)?.toLowerCase() || 'vật phẩm'} lúc ${data.time}`;
                break;

            case ClanActivityActionType.FUND:
                text = data.amount && data.amount > 0 ? `- ${data.userName} nộp ${data.amount} vào quỹ văn phòng lúc ${data.time}`: '';
                break;

            case ClanActivityActionType.JOIN:
                text = `- ${data.userName} đã tham gia văn phòng lúc ${data.time}`;
                break;

            case ClanActivityActionType.LEAVE:
                text = `- ${data.userName} đã rời văn phòng lúc ${data.time}`;
                break;
            
            case ClanActivityActionType.WEEKLY_RANKING_MEMBER_1:
                text = `- ${data.userName} đạt hạng Nhất bảng xếp hạng tuần thành viên năng động tại văn phòng ${Constants.getOfficeName(data.officeName)} lúc ${data.time}`;
                break;
            case ClanActivityActionType.WEEKLY_RANKING_MEMBER_2:
                text = `- ${data.userName} đạt hạng Nhì bảng xếp hạng tuần thành viên năng động tại văn phòng ${Constants.getOfficeName(data.officeName)} lúc ${data.time}`;
                break;
            case ClanActivityActionType.WEEKLY_RANKING_MEMBER_3:
                text = `- ${data.userName} đạt hạng Ba bảng xếp hạng tuần thành viên năng động tại văn phòng ${Constants.getOfficeName(data.officeName)} lúc ${data.time}`;
                break;
            case ClanActivityActionType.WEEKLY_RANKING_MEMBER_TOP_10:
                text = `- ${data.userName} Thuộc 10 người năng động đứng đầu bảng xếp hạng tuần tại văn phòng ${Constants.getOfficeName(data.officeName)} lúc ${data.time}`;
                break;

            case ClanActivityActionType.WEEKLY_RANKING_CLAN_1:
                text = `-  Văn phòng ${Constants.getOfficeName(data.officeName)} đạt hạng Nhất bảng xếp hạng tuần ${data.time}`;
                break;
             case ClanActivityActionType.WEEKLY_RANKING_CLAN_2:
                text = `-  Văn phòng ${Constants.getOfficeName(data.officeName)} đạt hạng Nhì bảng xếp hạng tuần ${data.time}`;
                break;
             case ClanActivityActionType.WEEKLY_RANKING_CLAN_3:
                text = `-  Văn phòng ${Constants.getOfficeName(data.officeName)} đạt hạng Ba bảng xếp hạng tuần ${data.time}`;
                break;

            default:
                text = `- ${data.userName} thực hiện ${data.actionType} lúc ${data.time}`;
                break;
        }

        if (this.textContent) {
            this.textContent.string = text;
        }
    }
}


