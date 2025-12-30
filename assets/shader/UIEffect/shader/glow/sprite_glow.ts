import { _decorator, Color, Component, Node, Size, Sprite, SpriteFrame, UITransform, v2, v4, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('sprite_glow')
export class sprite_glow extends Sprite {

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
    protected get updateUV(): boolean {
        this.updateSpriteAtlasUV(this.spriteFrame);
        return this._toggleUpdateUV;
    }
    protected set updateUV(value: boolean) {
        if (value) {
            this.updateSpriteAtlasUV(this.spriteFrame);
        }
    }

    public updateSpriteAtlasUV(value: SpriteFrame = null) {
        if (value == null) {
            value = this.spriteFrame;
        }

        if (value) {
            let rect = value.rect;
            let texture = value.texture;
            let atlasWidth = texture.width;
            let atlasHeight = texture.height;

            let uMin = rect.x / atlasWidth;
            let vMin = rect.y / atlasHeight;
            let uMax = (rect.x + rect.width) / atlasWidth;
            let vMax = (rect.y + rect.height) / atlasHeight;

            this.material.setProperty('u_uvRect', v4(uMin, uMax, vMin, vMax));
        }
    }

    onLoad(): void {
        super.onLoad();

        // For editor
        this.updateSpriteAtlasUV(this.spriteFrame);
    }

    protected start(): void {
        this.scheduleOnce(() => {
            this.updateSpriteAtlasUV(this.spriteFrame);
            this.setGlowColor(this.glowColor);
            this.setStrength(this.strength);
            this.setRadius(this.radius);
            this.setResolution(this.resolutionMultiplier)
            this.setRadiusMultiplier(this.radiusMultiplier);
            this.setScale(this.scale);
        }, 0.05)
    }

    //#endregion

    //#region GLOW_COLOR
    @property private glowColor: Color = new Color("#ffffff");
    @property({ visible: false })
    protected get u_glowColor(): Color {
        this.setGlowColor(this.glowColor);
        return this.glowColor;
    }
    protected set u_glowColor(value: Color) {
        if (this.glowColor !== value) {
            this.glowColor = value;
            this.setGlowColor(value);
        }
    }
    private setGlowColor(value: Color) {
        this.material?.setProperty('u_glowColor', v4(value.x, value.y, value.z, value.w));
    }
    //#endregion

    //#region STRENGTH
    @property({
        range: [0, 3, 0.05],
        slide: true,
    }) private strength: number = 0.5;
    @property({ visible: false })
    protected get u_strength(): number {
        this.setStrength(this.strength);
        return this.strength;
    }
    protected set u_strength(value: number) {
        if (this.strength !== value) {
            this.strength = value;
            this.setStrength(value);
        }
    }
    private setStrength(value: number) {
        this.material?.setProperty('u_strength', value);
    }
    //#endregion

    //#region RARIUS
    @property({
        range: [0, 1, 0.01],
        slide: true,
    }) private radius: number = 0.1;
    @property({ visible: false })
    protected get u_radius(): number {
        this.setRadius(this.radius);
        return this.radius;
    }
    protected set u_radius(value: number) {
        if (this.radius !== value) {
            this.radius = value;
            this.setRadius(value);
        }
    }
    private setRadius(value: number) {
        this.material?.setProperty('u_radius', value);
    }
    //#endregion

    //#region RADIUS MULTIPLIER
    @property({
        range: [-100.0, 100.0, 0.1],
        slide: true,
    }) private radiusMultiplier: number = 1.0;
    @property({ visible: false })
    protected get u_radiusMultiplier(): number {
        this.setRadiusMultiplier(this.radiusMultiplier);
        return this.radiusMultiplier;
    }
    protected set u_radiusMultiplier(value: number) {
        if (this.radiusMultiplier !== value) {
            this.radiusMultiplier = value;
            this.setRadiusMultiplier(value);
        }
    }
    private setRadiusMultiplier(value: number) {
        this.material?.setProperty('u_radiusMultiplier', value);
    }
    //#endregion

    //#region SCALE
    @property({
        range: [0, 1, 0.01],
        slide: true,
    }) private scale: number = 1.0;
    @property({ visible: false })
    protected get u_scale(): number {
        this.setScale(this.scale);
        return this.scale;
    }
    protected set u_scale(value: number) {
        if (this.scale !== value) {
            this.scale = value;
            this.setScale(value);
        }
    }
    private setScale(value: number) {
        this.material?.setProperty('u_scale', value);
    }
    //#endregion

    //#region RESOLUTION
    // @property(Boolean) private toggleUpdateResultion: boolean = false;

    private _contentSize = null;
    private get contentSize(): Size {
        if (this._contentSize == null) this._contentSize = this.getComponent(UITransform).contentSize;
        return this._contentSize;
    }

    @property private resolutionMultiplier: Vec2 = new Vec2(1.0, 1.0);
    @property({ visible: false })
    protected get u_resolutionMultiplier(): Vec2 {
        this.setResolution(this.resolutionMultiplier);
        return this.resolutionMultiplier;
    }
    private setResolution(multiplier: Vec2) {

        const size = this.contentSize;
        const x = size.width * (1.0 / multiplier.x);
        const y = size.height * (1.0 / multiplier.y);

        this.material?.setProperty('u_resolution', v2(x, y));
    }
    //#endregion
}


