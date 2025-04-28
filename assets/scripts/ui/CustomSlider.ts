import { _decorator, Component, Node, UITransform, Slider, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomSlider')
export class CustomSlider extends Component {
    @property({ type: Slider }) slider: Slider;
    @property({ type: Sprite }) fill: Sprite;

    protected onLoad(): void {
        this.slider = this.node.getComponent(Slider);
        this.fill = this.node.getChildByName("Fill").getComponent(Sprite);

        this.scheduleOnce(() => {
            this.updateSliderHandleAndFill(this.slider.progress);
        }, 0);

        this.node.on('slide', this.onSlide, this);
    }

    protected onDestroy(): void {
        this.node.off('slide', this.onSlide, this);
    }

    private updateSliderHandleAndFill(progress: number) {
        const sliderTransform = this.slider.node.getComponent(UITransform);
        const handleNode = this.slider.handle.node;

        const sliderWidth = sliderTransform.width;
        const minX = -sliderWidth / 2;

        const handleX = minX + sliderWidth * progress;
        handleNode.setPosition(new Vec3(handleX, handleNode.position.y, 0));

        this.fill.fillRange = progress;
    }

    private onSlide(slider: Slider) {
        const progress = slider.progress;
        this.updateSliderHandleAndFill(progress);
    }
}
