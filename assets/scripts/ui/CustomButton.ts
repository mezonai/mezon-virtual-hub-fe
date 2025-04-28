import { _decorator, Button, Component, Enum, Node, tween, Vec3 } from "cc";
import { UIManager } from "../core/UIManager";
import { SoundManager } from "../core/SoundManager";
import { UIID } from "./enum/UIID";

const { ccclass, property, requireComponent } = _decorator;

@ccclass
@requireComponent(Button)
export default class CustomButton extends Component {

    @property({
        type: Enum(UIID)
    }) public uiAttached: UIID = UIID.None;

    @property({
        type: Boolean
    }) public isInteractEffect: boolean = true;

    @property({
        type: Node
    }) public interactiveAttachs: Node[] = [];

    public button: Button;

    public defaultScale: Vec3;

    onLoad(): void {
        this.defaultScale = this.node.scale.clone();
        this.button = this.node.getComponent(Button);
        this.node.on(Node.EventType.TOUCH_START, this.onClick, this);
    }

    public onClick(): void {
        if (this.button.interactable) {
            if (this.uiAttached != UIID.None) UIManager.Instance.showUI(this.uiAttached)

            //Add button interactive
            if (this.isInteractEffect) {
                this.tween_Shaking();

                //Sound effect
                SoundManager.instance.playSound("click");
            }
        }
    };

    private tween_Shaking(): void {
        let curScale = this.defaultScale.clone();
        let addScale = new Vec3(0.1, 0.1);
        tween()
            .target(this.node)
            .to(0.1, {
                scale: curScale.clone().add(addScale.negative())
            }, { easing: "smooth" })
            .to(0.05, {
                scale: curScale.clone().add(addScale.clone().divide(new Vec3(2, 2, 2)))
            }, { easing: "smooth" })
            .to(0.05, {
                scale: curScale
            }, { easing: "smooth" })
            .call(() => {
                this.node.scale = this.defaultScale.clone();
            })
            .start();
    };
}

