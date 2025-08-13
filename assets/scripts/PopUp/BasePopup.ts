import { _decorator, CCBoolean, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BasePopup')
export class BasePopup extends Component {
    @property({type: CCBoolean}) isFixPosition: boolean = true;
    protected _onActionClose: (() => void) | null = null;
    public init(param?: any) {
        console.log("Popup Init with param:", param);
    }
    
}