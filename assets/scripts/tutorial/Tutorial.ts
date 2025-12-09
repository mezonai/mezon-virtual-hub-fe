import { _decorator, Component, Button, Tween, Vec3, Color, Node, Sprite, Label, sys } from 'cc';
import { GameMapController } from '../GameMap/GameMapController';
const { ccclass, property } = _decorator;

@ccclass('Tutorial')
export class Tutorial extends Component {

    @property(Node) characterNode: Node = null;
    @property(Node) dialogueBox: Node = null;
    @property(Label) dialogueText: Label = null;
    @property([Button]) buttons: Button[] = [];
    @property(GameMapController) gameMapController: GameMapController = null;
    private highlightIndexes: number[] = [0,1,2,3,4,5,6];
    private static _instance: Tutorial;
    public static get instance() {
        return Tutorial._instance;
    }

    onLoad() {
        this.characterNode.active = false;
        this.dialogueBox.active = false;
    }

    public startTutorial() {
        this.characterNode.active = true;
        this.dialogueBox.active = true;
        this.dialogueText.string = "Chào mừng bạn đến với Mezon Vhub, hãy chọn văn phòng bạn muốn vào";
        this.gameMapController.CheckLoadMap(true);
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.highlightIndexes.includes(i)) {
                this.buttons[i].interactable = true;
                this.highlightButton(this.buttons[i].node);
            } else {
                this.buttons[i].interactable = false;
                this.dimButton(this.buttons[i].node);
            }
            this.buttons[i].node.on(Button.EventType.CLICK, () => this.onChooseOffice(), this);
        }
    }

    private onChooseOffice() {
        this.dialogueBox.active = false;
        this.characterNode.active = false;
        new Tween(this.node)
            .to(0.5, { scale: new Vec3(0, 0, 0) }, { easing: "quadOut" })
            .call(() => {
                this.node.scale = new Vec3(1, 1, 1);
            })
            .start();
    }

    highlightButton(buttonNode: Node) {
        new Tween(buttonNode)
            .to(0.6, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.6, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    dimButton(buttonNode: Node) {
        let sprite = buttonNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = new Color(150, 150, 150);
        }
    }
}
