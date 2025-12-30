import { _decorator, Component, Label, Node, RichText } from 'cc';
import { BasePopup } from './BasePopup';
import { PopupManager } from './PopupManager';
import { Sprite } from 'cc';
import { sys } from 'cc';
import { SpriteFrame } from 'cc';
import { KeyEnum } from '../utilities/KeyBoardEnum';
const { ccclass, property } = _decorator;

@ccclass('InteracterLabel')
export class InteracterLabel extends BasePopup {
    @property(RichText) keyBoard: RichText = null!;
    @property([SpriteFrame]) iconMobile: SpriteFrame[] = [];// PressA, PressB
    @property(Label) actionInteract: Label = null!;
    @property(Node) mobileNode: Node = null!;
    @property(Sprite) iconShowMobile: Sprite = null!;

    public init(param?: { keyBoard: KeyEnum, action: string }) {
        super.init(param);
        this.UpdateText(param);
    }

    public UpdateText(param?: { keyBoard: KeyEnum, action: string }) {
        this.keyBoard.node.active = !sys.isMobile;
        this.mobileNode.active = sys.isMobile;
        this.iconShowMobile.spriteFrame = param?.keyBoard == KeyEnum.E ? this.iconMobile[0] : this.iconMobile[1];
        if (this.keyBoard && param?.keyBoard) {
            this.keyBoard.string = String.fromCharCode(param?.keyBoard);
        }
        if (this.actionInteract && param?.action) {
            this.actionInteract.string = param?.action;
        }
    }
}


