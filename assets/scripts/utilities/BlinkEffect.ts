import { _decorator, Component, Node, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SelfBlink')
export class SelfBlink extends Component {
    @property({ type: Node }) targetNode: Node = null!; 
    @property  minOpacity: number = 50;  
    @property maxOpacity: number = 255; 
    @property duration: number = 0.5;  
    private uiOpacity!: UIOpacity;
    
    protected onEnable(): void {
        if (!this.targetNode) this.targetNode = this.node;
        this.uiOpacity = this.targetNode.getComponent(UIOpacity) || this.targetNode.addComponent(UIOpacity);
        tween(this.uiOpacity)
            .to(this.duration, { opacity: this.minOpacity })
            .to(this.duration, { opacity: this.maxOpacity })
            .union()
            .repeatForever()
            .start();
    }

    protected onDisable(): void {
        tween(this.uiOpacity).stop();
        this.uiOpacity.opacity = this.maxOpacity;
    }
}
