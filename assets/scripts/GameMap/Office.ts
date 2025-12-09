import { _decorator, Component, Node ,Button,Enum} from 'cc';
import { Region } from './Region';
import { ClansData } from '../Interface/DataMapAPI';
import { OfficePosition } from './OfficePosition';
const { ccclass, property } = _decorator;

@ccclass('Office')
export class Office extends Component {
    @property(Button)
    chooseOffButton: Button = null;

    @property(Node)
    officePoint: Node = null; 

    @property({ type: Enum(OfficePosition) })
    officeBrach: OfficePosition = OfficePosition.NONE;

    @property({ type: Enum(Region) })
    region: Region = Region.HANOI;

    @property
    public mapKey: string = "";

    public clans: ClansData = null;

    public setData(clans: ClansData, onClickOffice: (office: Office) => void) {
        this.node.active = true;
        this.clans = clans;
        this.chooseOffButton.addAsyncListener(async () => {
            if (!onClickOffice) return;
            this.chooseOffButton.interactable = false;
            onClickOffice(this);
            this.chooseOffButton.interactable = true;
        })
    }
}



