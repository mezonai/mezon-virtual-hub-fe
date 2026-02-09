import { _decorator, Component, resources, assetManager, SpriteFrame, Button, Node, Animation } from 'cc';
import { AnimationEventController } from './AnimationEventController';

const { ccclass, property } = _decorator;

@ccclass('SkinChanger')
export class SkinChanger extends Component {
    @property({ type: AnimationEventController }) animationController: AnimationEventController = null;
    @property({ type: Node }) changeSkinButton: Node = null;

    private currentSkins: SpriteFrame[] = [];
    private playerNode: Node = null;

    start() {
        if (this.changeSkinButton) {
            this.changeSkinButton.getComponent(Button).node.on("click", this.onChangeSkinClick, this);
        }
        let buttonNode = this.node;
        
        this.playerNode = buttonNode.getParent().getParent().getParent();;

        if (this.playerNode) {
           
            this.animationController.node = this.playerNode.getChildByName("Animation");
        }
    }

    private onChangeSkinClick() {
        if (!this.playerNode) return;
        console.log("Button clicked! Changing skin...");
        this.loadSkinFromResources("skin1");
    }

    public changeSkin(skinFrames: SpriteFrame[]) {
        if (!this.animationController) {
            return;
        }

        const animation = this.animationController.getComponent(Animation);
        if (!animation) {
            return;
        }
        animation.stop();
        //this.animationController.init(skinFrames);

        console.log("Waiting for animation to finish...");
    }

    public loadSkinFromResources(skinPath: string) {

        resources.loadDir("skin1", SpriteFrame, (err, assets) => {
            if (err) {
                return;
            }
            if (Array.isArray(assets)) {
                console.log(`Load ${assets.length} SpriteFrames`);
            }
            this.changeSkin(assets);
        });

    }
}
