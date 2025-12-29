import { _decorator, Component, Node, Sprite, SpriteFrame, v4 } from 'cc';
import { spriteEffect } from '../../spriteEffect';
const { ccclass, property , requireComponent} = _decorator;

@ccclass('sprite_pixelize_effect')
@requireComponent(Sprite)
export class sprite_pixelize_effect extends spriteEffect {

//#region TILE

    @property({
        range: [1, 100, 1],
        slide: true,
    }) private tile: number = 16;
    @property({visible: false})
    protected get u_tile(): number {
        this.setTile(this.tile);
        return this.tile;
    }
    private setTile(value: number){
        this.sprite.material?.setProperty('u_tile', value);
    }

//#endregion

//#region TITLE MULTIPLIER

    @property private tileMultiplier: number = 1.0;
    @property({visible: false})
    protected get u_titleMultiplier(): number {
        this.setTileMultiplier(this.tileMultiplier);
        return this.tileMultiplier;
    }
    private setTileMultiplier(value: number){
        this.sprite.material?.setProperty('u_tileMultiplier', value);
    }

//#endregion

//#region ALPHA TILE

    @property({
        range: [1, 100, 1.0],
        slide: true,
    }) private alphaTile: number = 16;
    @property({visible: false})
    protected get u_alphaTile(): number {
        this.setAlphaTile(this.alphaTile);
        return this.alphaTile;
    }
    private setAlphaTile(value: number){
        this.sprite.material?.setProperty('u_alphaTile', value);
    }

//#endregion

    protected onInitEffect() {
        this.setTile(this.tile);
        this.setTileMultiplier(this.tileMultiplier);
        this.setAlphaTile(this.alphaTile);
    }
}


