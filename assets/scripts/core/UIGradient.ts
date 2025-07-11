import { _decorator, Color, Component, Renderable2D } from "cc";
import { EDITOR } from "cc/env";

const {
    ccclass,
    property,
    requireComponent,
    disallowMultiple,
    executeInEditMode,
} = _decorator;

@ccclass("UIGradientColor")
@requireComponent(Renderable2D)
@disallowMultiple
@executeInEditMode
export class UIGradientColor extends Component {
    @property({ visible: true, tooltip: "Left Bottom" })
    protected _colorLB: Color = Color.WHITE.clone();
    @property({ visible: true, tooltip: "Right Bottom" })
    protected _colorRB: Color = Color.WHITE.clone();
    @property({ visible: true, tooltip: "Left Top" })
    protected _colorLT: Color = Color.WHITE.clone();
    @property({ visible: true, tooltip: "Right Top" })
    protected _colorRT: Color = Color.WHITE.clone();

    private _isEnable: boolean = true;

    public get colors(): Readonly<Color>[] {
        return [this._colorLB, this._colorRB, this._colorLT, this._colorRT];
    }
    public set colors(colors: ReadonlyArray<Color>) {
        if (colors.length < 4) return;
        [this._colorLB, this._colorRB, this._colorLT, this._colorRT] = colors;
        this.markForRender();
    }

    onEnable() {
        this._isEnable = true;
        this.replaceFunction();
    }

    onDisable() {
        this._isEnable = false;
        this.restoreFunction();
    }

    onDestroy() {
        this._isEnable = false;
        this.restoreFunction();
    }

    update() {
        if (!EDITOR) return;
        this.replaceFunction();
    }

    public setGradientColors(
        lb: Color,
        rb: Color,
        lt: Color,
        rt: Color
    ) {
        this._colorLB.set(lb);
        this._colorRB.set(rb);
        this._colorLT.set(lt);
        this._colorRT.set(rt);
        this.markForRender();
    }

    protected replaceFunction() {
        const renderComp = this.getComponent(Renderable2D);
        if (!renderComp) return;
        const assembler = renderComp["_assembler"];
        if (!assembler) return;

        if (!assembler["_originalUpdateColor"]) {
            assembler["_originalUpdateColor"] = assembler["updateColor"];
            assembler["updateColor"] = UIGradientColor.OnAssemblerUpdateColor;
        }
        this.markForRender();
    }

    protected restoreFunction() {
        const renderComp = this.getComponent(Renderable2D);
        if (!renderComp) return;
        const assembler = renderComp["_assembler"];
        if (!assembler) return;

        if (assembler["_originalUpdateColor"]) {
            assembler["updateColor"] = assembler["_originalUpdateColor"];
            delete assembler["_originalUpdateColor"];
        }

        renderComp.destroyRenderData();
        renderComp["_flushAssembler"]?.();
        this.markForRender();
    }

    public static OnAssemblerUpdateColor(comp: Renderable2D) {
        let gradient = comp.node.getComponent(UIGradientColor);
        if (!gradient) {
            const comps = comp.node.components;
            for (let i = 0; i < comps.length; i++) {
                const tmpComp = comps[i];
                if (tmpComp instanceof UIGradientColor) {
                    gradient = tmpComp as UIGradientColor;
                    break;
                }
            }
        }

        if (gradient && gradient._isEnable) {
            const renderData = comp.renderData;
            if (!renderData?.chunk?.vb) return;

            const vData = renderData.chunk.vb;
            let colorOffset = 5;
            const colors = [
                gradient._colorLB,
                gradient._colorRB,
                gradient._colorLT,
                gradient._colorRT,
            ];

            for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
                vData[colorOffset] = colors[i].r / 255;
                vData[colorOffset + 1] = colors[i].g / 255;
                vData[colorOffset + 2] = colors[i].b / 255;
                vData[colorOffset + 3] = colors[i].a / 255;
            }
        } else {
            const assembler = comp["_assembler"];
            assembler["_originalUpdateColor"]?.(comp);
        }
    }

    public markForRender() {
        const renderComp = this.getComponent(Renderable2D);
        if (!renderComp) return;
        renderComp["_updateColor"]?.();
    }
}