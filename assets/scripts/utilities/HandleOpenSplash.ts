import { _decorator, Component, Node, tween, Vec3, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum SplashMode {
    CenterOpen = 0,
    SlideDown = 1,
    SlideRight = 2,
    SlideLeft = 3,
    CenterClose = 4,
    Random = 5,
}

@ccclass('HandleOpenSplash')
export class HandleOpenSplash extends Component {
    @property(Node)
    topPanel: Node = null;

    @property(Node)
    bottomPanel: Node = null;

    @property
    duration: number = 0.2;

    @property
    openDistance: number = 720;

    @property
    autoPlay: boolean = true;

    @property({ type: Enum(SplashMode) })
    splashMode: SplashMode = SplashMode.CenterOpen;

    playSplash(onComplete?: () => void) {
        this.topPanel.active = true;
        this.bottomPanel.active = true;

        let modeToPlay = this.splashMode;

        if (this.splashMode === SplashMode.Random) {
            const availableModes = [
                SplashMode.CenterOpen,
                SplashMode.CenterClose,
                SplashMode.SlideDown,
                SplashMode.SlideRight,
                SplashMode.SlideLeft
            ];
            modeToPlay = availableModes[Math.floor(Math.random() * availableModes.length)];
        }

        let topTarget = new Vec3();
        let bottomTarget = new Vec3();

        switch (modeToPlay) {
            case SplashMode.CenterOpen:
                this.topPanel.setPosition(0, 0, 0);
                this.bottomPanel.setPosition(0, 0, 0);
                topTarget = new Vec3(0, this.openDistance, 0);
                bottomTarget = new Vec3(0, -this.openDistance, 0);
                break;

            case SplashMode.CenterClose:
                this.topPanel.setPosition(0, this.openDistance, 0);
                this.bottomPanel.setPosition(0, -this.openDistance, 0);
                topTarget = new Vec3(0, 0, 0);
                bottomTarget = new Vec3(0, 0, 0);
                break;

            case SplashMode.SlideDown:
                this.topPanel.setPosition(0, this.openDistance, 0);
                this.bottomPanel.setPosition(0, this.openDistance + 100, 0);
                topTarget = new Vec3(0, 0, 0);
                bottomTarget = new Vec3(0, 0, 0);
                break;

            case SplashMode.SlideRight:
                this.topPanel.setPosition(-this.openDistance, 0, 0);
                this.bottomPanel.setPosition(-this.openDistance - 100, 0, 0);
                topTarget = new Vec3(0, 0, 0);
                bottomTarget = new Vec3(0, 0, 0);
                break;

            case SplashMode.SlideLeft:
                this.topPanel.setPosition(this.openDistance, 0, 0);
                this.bottomPanel.setPosition(this.openDistance + 100, 0, 0);
                topTarget = new Vec3(0, 0, 0);
                bottomTarget = new Vec3(0, 0, 0);
                break;
        }

        tween(this.topPanel)
            .to(this.duration, { position: topTarget }, { easing: 'quadInOut' })
            .start();

        tween(this.bottomPanel)
            .to(this.duration, { position: bottomTarget }, { easing: 'quadInOut' })
            .call(() => {
                this.topPanel.active = false;
                this.bottomPanel.active = false;

                if (onComplete) onComplete();
            })
            .start();
    }
}
