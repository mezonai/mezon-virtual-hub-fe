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

            default:
                text = `- ${data.userName} thực hiện ${data.actionType} lúc ${data.time}`;
                break;
        }

        if (this.textContent) {
            this.textContent.string = text;
        }
    }
}


