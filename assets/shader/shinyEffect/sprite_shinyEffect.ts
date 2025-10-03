import { _decorator, Component, Node, Sprite, SpriteFrame, v4 } from 'cc';
const { ccclass, property, executeInEditMode} = _decorator;

@ccclass('sprite_shinyEffect')
@executeInEditMode
export class sprite_shinyEffect extends Sprite {

    //#region UV HANDLE
    @property({
        type: String,
        readonly: true,
        displayName: 'Custom'
    }) protected header_custom: string = 'Custom';

    _toggleUpdateUV: boolean;
    @property({
        type: Boolean,
    })
    @property
    protected get updateUV(): boolean {
        this.updateSpriteAtlasUV(this.spriteFrame);  
        return this._toggleUpdateUV; 
    }
    protected set updateUV(value: boolean) {
        this.updateSpriteAtlasUV(this.spriteFrame);  
    }

    public updateSpriteAtlasUV(value: SpriteFrame = null)
    {
        if (value == null)
        {
            value = this.spriteFrame;
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

            this.material.setProperty('u_uv', v4(uMin, uMax, vMin, vMax));

            console.log(`UV of ${value.name} in ${this.node.name} is updated`);
        }
    }
    //#endregion

    //#region SHINY PROPERTIES 

    @property({
        type: String,
        readonly: true,
        displayName: 'Shiny Properties'
    }) private header_ShinyProperty: string = 'Shiny Properties';

    // SHINY WIDTH
    @property({
        range: [0.01, 1, 0.01],
        slide: true,
    }) private width: number = 0.5;
    @property({visible: false})
    protected get u_width(): number {
        this.setShinyWidth(this.width);
        return this.width;
    }
    protected set u_width(value: number) {
        if (this.width !== value || true)
        {
            this.width = value;
            this.setShinyWidth(value);
        }
    }
    private setShinyWidth(value: number){
        this.material?.setProperty('u_width', value);
    }
    
    // SHINY EDGE
    @property({
        range: [0, 0.5, 0.01],
        slide: true,
    }) private edge: number = 0.15;
    @property({visible: false})
    protected get u_edge(): number {
        this.setShinyEdge(this.edge);
        return this.edge;
    }
    protected set u_edge(value: number) {
        if (this.edge !== value)
        {
            this.edge = value;
            this.setShinyEdge(value);
        }
    }
    private setShinyEdge(value: number){
        this.material?.setProperty('u_edge', value);
    }

    // SHINY ANGLE
    @property({
        range: [-360, 360, 1],
        slide: true,
    }) private angle: number = -45;
    @property({visible: false})
    protected get u_angle(): number {
        this.setAngle(this.angle);
        return this.angle;
    }
    protected set u_angle(value: number) {
        if (this.angle !== value)
        {
            this.angle = value;
            this.setAngle(value);
        }
    }
    private setAngle(value: number){
        this.material?.setProperty('u_angle', value);
    }

    // SHINY SMOOTHNESS
    @property({
        range: [1, 25, 1],
        slide: true,
    }) private smoothValue: number = 3;
    @property({visible: false})
    protected get u_smoothValue(): number {
        this.setSmoothvalue(this.smoothValue);
        return this.smoothValue;
    }
    protected set u_smoothValue(value: number) {
        if (this.smoothValue !== value)
        {
            this.smoothValue = value;
            this.setSmoothvalue(value);
        }
    }
    private setSmoothvalue(value: number){
        this.material?.setProperty('u_smoothValue', value);
    }

    // SHINY DURATION MOVE
    @property({
        range: [0.1, 100, 0.1],
        slide: false,
        visible: false // Need more testing
    }) private duration: number = 1.5;
    @property({visible: false})
    protected get u_duration(): number {
        this.setDuration(this.duration);
        return this.duration;
    }
    protected set u_duration(value: number) {
        if (this.duration !== value)
        {
            this.duration = value;
            this.setDuration(value);
        }
    }
    private setDuration(value: number){
        this.material?.setProperty('u_duration', value);
    }

    // SHINY DELAY MOVE
    @property({
        range: [0, 100, 0.1],
        slide: false,
        visible: false // Need more testing
    }) private delay: number = 2.0;
    @property({visible: false})
    protected get u_delay(): number {
        this.setShinyDelay(this.delay);
        return this.delay;
    }
    protected set u_delay(value: number) {
        if (this.delay !== value)
        {
            this.delay = value;
            this.setShinyDelay(value);
        }
    }
    private setShinyDelay(value: number){
        this.material?.setProperty('u_delay', value);
    }


    //#endregion

    onLoad(): void {
        super.onLoad();

        // For editor
        this.updateSpriteAtlasUV(this.spriteFrame);
    }

    protected start(): void {
        this.scheduleOnce(()=>{
            this.updateSpriteAtlasUV(this.spriteFrame);
            this.setShinyWidth(this.width);
            this.setShinyEdge(this.edge);
            this.setAngle(this.angle);
            this.setSmoothvalue(this.smoothValue)
        }, 0.05)
    }
}


