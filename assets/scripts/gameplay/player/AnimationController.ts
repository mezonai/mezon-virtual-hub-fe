import { _decorator, Component, Node, Animation, AnimationClip, AnimationState } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimationController')
export class AnimationController extends Component {
    @property({ type: Animation }) animator: Animation = null;

    private lastAnimationName: string = "";
    private isKeepLastAnim: boolean = false;
    public play(animationName, isKeepAnim = false) {
        if (isKeepAnim && animationName != "") {
            if (this.lastAnimationName != animationName) {
                this.lastAnimationName = animationName;
                this.animator.play(animationName);
            }
        }
        else if (!this.isKeepLastAnim) {
            this.lastAnimationName = animationName;
            this.animator.crossFade(animationName, 0.1);
        }

        this.isKeepLastAnim = isKeepAnim;
    }

    public get getCurrentAnim() {
        return this.lastAnimationName;
    }
}