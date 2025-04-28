import { _decorator, CCBoolean, CCFloat, Component, Vec3, view } from "cc";
import CustomButton from "../ui/CustomButton";
import { SeflScale } from "./SeflScale";

const { ccclass, property } = _decorator;

@ccclass("UIScale")
export default class UIScale extends Component {

    @property({
        type: CCFloat
    }) public multi: number = 1;

    @property({
        type: CCBoolean
    }) public scaleInNormalSize: boolean = false;

    // 16:9 = 1.78
    // 16:10 = 1.6
    // 19,5:9 (IP X) = 2,167
    // 21:9 = 2.3
    private defaultScale: Vec3 = Vec3.ONE;
    
    protected onLoad(): void {
        this.defaultScale = this.node.scale.clone();
    }
    protected onEnable(): void {
        this.resizeElement();
    }

    protected start(): void {
        // UIManager.Instance.node.on("ON_SCREEN_RESIZE", this.onScreenResize, this);
        this.resizeElement();
    }

    private onScreenResize(){
        this.resizeElement();
    }

    private resizeElement(): void {
        const width = view.getCanvasSize().width;
        const height = view.getCanvasSize().height;
        const ratio = height / width;
        
        if (ratio >= 1.8 && ratio < 2) {
            this.node.scale = this.defaultScale.clone().multiply(new Vec3(0.9 * this.multi, 0.9 * this.multi, 0.9 * this.multi));
        }
        else if (ratio >= 2 && ratio < 2.2) {
            this.node.scale = this.defaultScale.clone().multiply(new Vec3(0.85 * this.multi, 0.85 * this.multi, 0.85 * this.multi));
        }
        else if (ratio >= 2.2) {
            this.node.scale = this.defaultScale.clone().multiply(new Vec3(0.85 * this.multi, 0.85 * this.multi, 0.85 * this.multi));
        }
        else {
            this.node.scale = this.defaultScale.clone();
        }

        if (this.scaleInNormalSize) {
            if (ratio >= 1.6 && ratio < 1.8) {
                this.node.scale = this.defaultScale.clone().multiply(new Vec3(this.multi, this.multi, this.multi));
            }
        }

        let customButton = this.node.getComponent(CustomButton);
        if (customButton) {
            customButton.defaultScale = this.node.scale.clone();
        }
     
        let seflScale = this.node.getComponent(SeflScale);
        if (seflScale) {
            seflScale.originScale = this.node.scale.clone();
        }
    }
}
