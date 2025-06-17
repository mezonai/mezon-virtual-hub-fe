import { _decorator, Component, Node, Vec3, tween, UITransform, view, easing, Toggle, isValid } from 'cc';
const { ccclass, property } = _decorator;

enum SlideDirection {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP,
}

enum EasingFunctions {
    BackOut = 'backOut',
    BackIn = 'backIn',
    CubicInOut = 'cubicInOut',
    CubicOut = 'cubicOut',
    CubicIn = 'cubicIn',
}

@ccclass('UIPanelSliderEffect')
export class UIPanelSliderEffect extends Component {
    @property({ type: Toggle }) public rateTog: Toggle = null;
    @property private slideDirection: SlideDirection = SlideDirection.LEFT_TO_RIGHT;
    @property private duration: number = 0.3;
    @property private offscreenPadding: number = 50;
    @property private easeInKey: EasingFunctions = EasingFunctions.BackOut;
    @property private easeOutKey: EasingFunctions = EasingFunctions.BackIn;
    @property private hideOnStart: boolean = true;

    private _originalPosition: Vec3 = new Vec3();
    private _offscreenPosition: Vec3 = new Vec3();
    private _isAnimating: boolean = false;
    private _isShowing: boolean = false;

    protected onLoad(): void {
        this._originalPosition.set(this.node.position);
        this.calculateOffscreenPosition();

        this.node.setPosition(this.hideOnStart ? this._offscreenPosition : this._originalPosition);
        this.node.active = !this.hideOnStart;
        this._isShowing = !this.hideOnStart;

        this.setupToggleListener(true);
    }

    protected onDestroy(): void {
        this.setupToggleListener(false);
    }

    private setupToggleListener(add: boolean): void {
        if (!isValid(this.rateTog) || !isValid(this.rateTog.node)) {
            return;
        }
        if (add) {
            this.rateTog.node.on(Node.EventType.TOUCH_END, this.onToggleClicked, this);
        } else {
            this.rateTog.node.off(Node.EventType.TOUCH_END, this.onToggleClicked, this);
        }
    }

    private onToggleClicked(): void {
        if (this._isAnimating) return;
        this.show(!this._isShowing);
    }

    public show(show: boolean, callback?: () => void): void {
        if (this._isAnimating || this._isShowing === show) return;

        this._isAnimating = true;
        this._isShowing = show;
        tween(this.node).stop();

        if (isValid(this.rateTog)) {
            this.rateTog.isChecked = !show;
        }

        if (show) {
            this.node.active = true;
            this.playShowAnimation(callback);
        } else {
            this.playHideAnimation(callback);
        }
    }

    public hide(callback?: () => void): void {
        this.show(false, callback);
    }

    private playShowAnimation(callback?: () => void): void {
        const currentEasing = easing[this.easeInKey as keyof typeof easing] || easing.backOut;

        tween(this.node)
            .to(this.duration, { position: this._originalPosition }, { easing: currentEasing })
            .call(() => {
                this._isAnimating = false;
                callback?.();
            })
            .start();
    }

    private playHideAnimation(callback?: () => void): void {
        const currentEasing = easing[this.easeOutKey as keyof typeof easing] || easing.backIn;

        tween(this.node)
            .to(this.duration, { position: this._offscreenPosition }, { easing: currentEasing })
            .call(() => {
                this.node.active = false;
                this._isAnimating = false;
                callback?.();
            })
            .start();
    }

    public isAnimating(): boolean {
        return this._isAnimating;
    }

    public isShowing(): boolean {
        return this._isShowing;
    }

    private calculateOffscreenPosition(): void {
        const uiTransform = this.node.getComponent(UITransform);
        let x = this._originalPosition.x;
        let y = this._originalPosition.y;
        const visibleSize = view.getVisibleSize();
        const nodeWidth = uiTransform.width;
        const nodeHeight = uiTransform.height;

        switch (this.slideDirection) {
            case SlideDirection.LEFT_TO_RIGHT:
                x = -nodeWidth - this.offscreenPadding;
                break;
            case SlideDirection.RIGHT_TO_LEFT:
                x = visibleSize.width + this.offscreenPadding;
                break;
            case SlideDirection.TOP_TO_BOTTOM:
                y = visibleSize.height + this.offscreenPadding;
                break;
            case SlideDirection.BOTTOM_TO_TOP:
                y = -nodeHeight - this.offscreenPadding;
                break;
            default:
                x = -nodeWidth - this.offscreenPadding;
                break;
        }

        this._offscreenPosition.set(x, y, this._originalPosition.z);
    }
}