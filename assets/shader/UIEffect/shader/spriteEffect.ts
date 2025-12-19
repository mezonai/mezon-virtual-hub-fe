import { _decorator, Component, Node, Sprite, SpriteFrame, v4 } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('spriteEffect')
@requireComponent(Sprite)
export abstract class spriteEffect extends Component {
    
//#region SPRITE UV 

    @property(Number) private initPriority: number = 0;

    private _sprite: Sprite;
    protected get sprite() {
        if (this._sprite == null) this._sprite = this.node.getComponent(Sprite);
        return this._sprite;
    }

    _toggleUpdateUV: boolean;
    @property({
        type: Boolean,
    })
    @property
    protected get updateUV(): boolean {
        this.updateSpriteAtlasUV(this.sprite.spriteFrame);  
        return this._toggleUpdateUV; 
    }
    protected set updateUV(value: boolean) {
        this.updateSpriteAtlasUV(this.sprite.spriteFrame);  
    }

    public updateSpriteAtlasUV(value: SpriteFrame = null)
    {
        if (value == null)
        {
            value = this.sprite.spriteFrame;
        }

        if (value)
        {
            let rect = value.rect;
            let texture = value.texture;
            let atlasWidth = texture.width;
            let atlasHeight = texture.height;

            let uMin = rect.x / atlasWidth;
            let vMin = rect.y / atlasHeight;
            let uMax = (rect.x + rect.width) / atlasWidth;
            let vMax = (rect.y + rect.height) / atlasHeight;

            this.sprite.material.setProperty('u_uvRect', v4(uMin, uMax, vMin, vMax));
            console.log(`UV of ${value.name} in ${this.node.name} is updated`);
        }
    }
//#endregion

//#region ACTIVE

    @property private active: boolean = true;
    @property({visible: false})
    protected get u_active(): boolean {
        this.setActive(this.active);
        return this.active;
    }
    protected setActive(value: boolean){
        this.sprite.material?.setProperty('u_active', value ? 1.0 : 0.0);
    }

//#endregion

    protected start(): void {
        setTimeout(() => {
            this.setActive(this.active);
            this.updateSpriteAtlasUV(this.sprite.spriteFrame);
            this.onInitEffect();
        }, 50 + 10 * this.initPriority)
    }

    protected abstract onInitEffect();
}


