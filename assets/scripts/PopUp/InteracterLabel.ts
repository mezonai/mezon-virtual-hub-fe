import { _decorator, Component, Label, Node, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('InteracterLabel')
export class InteracterLabel extends BasePopup {
     @property(RichText)
        keyBoard: RichText = null!;
        @property(Label)
        actionInteract: Label = null!;

        public init(param?: { keyBoard: string, action: string }) {
                super.init(param);
                this.UpdateText(param);
            }   
            
        public UpdateText(param?: { keyBoard: string, action: string }){
            if (this.keyBoard && param?.keyBoard) {
                this.keyBoard.string = param?.keyBoard;
            }
            if (this.actionInteract && param?.action) {
                this.actionInteract.string = param?.action;
            }
        }
}


