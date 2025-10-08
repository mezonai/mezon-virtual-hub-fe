import { _decorator, Component, Node ,Button,Enum} from 'cc';
import { Region } from './Region';
import { ClansData } from '../Interface/DataMapAPI';
import { GameMapController } from './GameMapController';
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
    private gameMapController: GameMapController = null;

    public setData(clans: ClansData, gameMapController) {
        this.node.active = true;
        this.gameMapController = gameMapController;
        this.clans = clans;
    }

    protected start(): void {
        this.chooseOffButton.node.on(Node.EventType.TOUCH_START, this.onChooseOffice, this);
    }

    private onChooseOffice() {
        if (this.gameMapController && this.clans) {
            this.gameMapController.onClickGoToNextOffice(this);
        }
    }
}



