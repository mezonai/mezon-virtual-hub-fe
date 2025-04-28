import { _decorator, Component, Node, Animation, AnimationClip, AnimationState, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimationController')
export class AnimationController extends Component {
    @property({ type: Animation }) animator: Animation = null;
    @property({ type: AudioSource }) audioSource: AudioSource = null;
    @property({ type: [AudioClip] }) walkClip: AudioClip[] = [];

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

    public playWalkClip1() {
        this.playWalkClip(this.walkClip[0]);
    }

    public playWalkClip2() {
        this.playWalkClip(this.walkClip[1]);
    }

    private playWalkClip(clip: AudioClip) {
        this.audioSource.clip = clip;
        this.audioSource.play();
    }
}