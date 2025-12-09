import { _decorator, Button, Camera, Color, Component, Label, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('IntroScene')
export class IntroScene extends Component {
    @property({ type: Node }) worldMap: Node = null;
    @property({ type: Node }) backgroundMap: Node = null;
    @property({ type: Sprite }) spriteBlur: Sprite = null;
    @property({ type: Button }) buttonClickVn: Button = null;
    @property({ type: Node }) aim: Node = null;
    @property({ type: Node }) vnMap: Node = null;
    @property({ type: Node }) arrow: Node = null;
    @property({ type: Label }) contentWelcome: Label = null;
    @property({ type: Node }) maskContent: Node = null;
    @property(Vec3) positionStartContent: Vec3 = new Vec3(0, 0, 0);
    @property(Vec3) positionEndContent: Vec3 = new Vec3(0, 0, 0);
    @property({ type: [Node] }) positionAims: Node[] = [];
    @property({ type: Camera }) camera: Camera = null;
    @property([SpriteFrame]) gifFrames: SpriteFrame[] = [];
    @property(Sprite) sprite: Sprite = null;
    private isRunningContent = true;
    private frameIndex = 0;
    protected onLoad(): void {
        this.vnMap.active = false;
        this.aim.active = false;
        this.arrow.active = true;
        this.backgroundMap.active = true;
    }
    protected start(): void {
        this.init();
    }

    setData(OnLoadCompleted: () => void) {
        this.onClickMove(OnLoadCompleted);
        //this.buttonClickVn.node.on(Button.EventType.CLICK, () => { this.onClickMove(OnLoadCompleted); }, this);
    }

    private async init() {
        this.schedule(this.playGif, 0.04);
        this.sprite.node.active = true;
        this.worldMap.active = true;
        while (this.isRunningContent) {
            await this.setTextEffectAndMove();
        }

    }

    playGif() {
        if (this.gifFrames.length === 0) return;

        this.sprite.spriteFrame = this.gifFrames[this.frameIndex];
        this.frameIndex = (this.frameIndex + 1) % this.gifFrames.length;
    }
    zoomTarget(OnLoadCompleted: () => void) {
        if (!this.camera) return;

        // 1. Lưu lại trạng thái ban đầu
        const originalPos = this.camera.node.worldPosition.clone();
        const originalZoom = this.camera.orthoHeight;

        // 2. Lấy vị trí thế giới của vùng được nhấn
        const targetWorldPos = this.positionAims[2].worldPosition;

        // 3. Tính vị trí camera cần di chuyển tới
        const newCameraPos = new Vec3(targetWorldPos.x, targetWorldPos.y, originalPos.z);


        // 4. Tween position tới vùng Việt Nam
        tween(this.camera.node.worldPosition)
            .to(1, newCameraPos, {
                onUpdate: (targetPos: Vec3) => {
                    this.camera.node.setWorldPosition(targetPos);
                }
            })
            .start();

        // 5. Tween zoom in
        const zoomTarget = { h: originalZoom };
        const heightShowMap = 25;
        let midEventTriggered = false;
        tween(zoomTarget)
            .to(2, { h: 15 }, {
                onUpdate: () => {
                    this.camera.orthoHeight = zoomTarget.h;
                    if (!midEventTriggered && zoomTarget.h < heightShowMap) {
                        midEventTriggered = true;
                        this.arrow.active = false;
                        this.vnMap.active = true;
                    }
                },
                onComplete: async () => {
                    await this.fadeSprite(true, 1);
                    this.camera.node.setWorldPosition(originalPos);
                    this.camera.orthoHeight = originalZoom;
                    this.backgroundMap.active = false;
                    this.sprite.node.active = false;
                    this.vnMap.active = false;
                    this.isRunningContent = false;
                    setTimeout(async () => {
                        await this.fadeSprite(false, 1);
                        if (OnLoadCompleted) {
                            setTimeout(() => {
                                OnLoadCompleted();
                            }, 300); // 0.3 giây = 300ms
                        }
                    }, 500); // 

                }
            })
            .start();
    }

    fadeSprite(fadeIn: boolean, duration: number = 0.5): Promise<void> {
        return new Promise((resolve) => {
            const currentColor = this.spriteBlur.color.clone();
            const targetAlpha = fadeIn ? 255 : 0;

            const alphaWrapper = { a: currentColor.a };
            tween(alphaWrapper)
                .to(duration, { a: targetAlpha }, {
                    onUpdate: () => {
                        const newColor = new Color(currentColor.r, currentColor.g, currentColor.b, alphaWrapper.a);
                        this.spriteBlur.color = newColor;
                    },
                    onComplete: () => {
                        resolve(); // Hoàn thành tween thì resolve promise
                    }
                })
                .start();
        });
    }

    async onClickMove(OnLoadCompleted: () => void) {
        this.buttonClickVn.interactable = false;
        this.aim.position = this.positionAims[0].position;
        this.aim.active = true;
        await this.blinkNodeByActive(this.aim, 0.8, 2);
        await this.moveToPosition(this.aim, this.positionAims[1].position);
        await this.blinkNodeByActive(this.aim, 0.8, 2);
        await this.moveToPosition(this.aim, this.positionAims[2].position);
        await this.blinkNodeByActive(this.aim, 0.8, 2);
        this.aim.active = false;
        this.zoomTarget(OnLoadCompleted);

    }

    moveToPosition(node: Node, targetPos: Vec3, duration: number = 0.5): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(duration, { position: targetPos }, { easing: 'sineInOut' })
                .call(() => resolve())
                .start();
        });
    }

    blinkNodeByActive(node: Node, duration: number = 0.5, blinkCount: number): Promise<void> {
        return new Promise((resolve) => {
            const blinkInterval = (duration * 1000) / (blinkCount * 2);
            let count = 0;
            const blinkTimer = setInterval(() => {
                node.active = !node.active;
                count++;
                if (count >= blinkCount * 2) {
                    clearInterval(blinkTimer);
                    node.active = true; // đảm bảo luôn hiển thị lại
                    resolve();
                }
            }, blinkInterval);
        });
    }

    setTextEffectAndMove(): Promise<void> {
        // Đặt vị trí ban đầu
        this.contentWelcome.node.position = new Vec3(
            this.positionStartContent.x + this.contentWelcome.string.length * 2,
            this.positionStartContent.y,
            this.positionStartContent.z
        );

        // Trả về Promise
        return new Promise<void>((resolve) => {
            tween(this.contentWelcome.node)
                .to(
                    5 + this.contentWelcome.string.length * 0.05,
                    {
                        position: new Vec3(
                            this.positionEndContent.x - this.contentWelcome.string.length * 2,
                            this.maskContent.position.y,
                            this.maskContent.position.z
                        )
                    }
                )
                .call(() => {
                    resolve(); // Kết thúc tween
                })
                .start();
        });
    }
}