import { _decorator, Component, Node } from 'cc';
import { BasePopup } from './BasePopup';
import { Button } from 'cc';
import { PopupManager } from './PopupManager';
const { ccclass, property } = _decorator;

@ccclass('PopupClanHistory')
export class PopupClanHistory extends BasePopup {
    @property(Button) closeButton: Button = null;
   
       public init(param?: any): void {
           this.closeButton.addAsyncListener(async () => {
               this.closeButton.interactable = false;
               await PopupManager.getInstance().closePopup(this.node.uuid);
               this.closeButton.interactable = true;
           });
           this.initList();
       }
   
       initList() {
          
       }
}


