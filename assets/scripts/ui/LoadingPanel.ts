import { _decorator, Component, math, Node, Sprite, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingPanel')
export class LoadingPanel extends Component {
    @property({ type: Sprite }) progressBar: Sprite = null;
    @property({ type: Node }) loginButton: Node = null;
    @property({ type: Node }) progressParent: Node = null;
    @property({ type: Node }) spaceShip: Node = null;
    private readonly minX = -145;
    private readonly maxX = 145;
    private tempvalue = -1;

    public setProgress(value) {
        if (value == 0) {
            this.node.active = true;
            this.progressParent.active = false;
            this.loginButton.active = true;
        }
        else {
            this.progressParent.active = true;
            this.loginButton.active = false;
        }
        if (this.tempvalue > 0) {
            this.progressBar.fillRange = value;
        }
        Tween.stopAllByTarget(this.progressBar);
        value = math.clamp(value, 0, 1);
        this.tempvalue = value;
        tween(this.progressBar)
            .to(0.2, { fillRange: value })
            .start();

        this.spaceShip.setPosition(new Vec3(this.remapValue(value, 0, 1, this.minX, this.maxX), this.spaceShip.position.y, 0))

        if (value >= 1) {
            setTimeout(() => {
                this.node.active = false;
            }, 300);
        }
    }

    private remapValue(x, oldMin, oldMax, newMin, newMax) {
        return newMin + ((x - oldMin) * (newMax - newMin)) / (oldMax - oldMin);
    }
}