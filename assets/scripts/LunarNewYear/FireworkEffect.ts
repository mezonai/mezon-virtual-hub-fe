import { Vec3 } from 'cc';
import { tween } from 'cc';
import { ParticleSystem2D } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Constants } from '../utilities/Constants';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FireworkEffect')
export class FireworkEffect extends Component {
    @property(Node) pointShoot: Node = null;
    @property(Node) startPosition: Node = null;
    @property(Node) endPosition: Node = null;
    @property(ParticleSystem2D) explotionEffect: ParticleSystem2D = null;
    private timeDuration: number = 1;
    private timeDelay: number = 10;
    private _currentTween: Tween<Node> | null = null;
    protected start(): void {
        this.startShootingLoop(this.startPosition.position, this.endPosition.position);
    }

    protected onDestroy(): void {
        if (this._currentTween) {
            this._currentTween.stop();
            this._currentTween = null;
        }
    }

    async startShootingLoop(from: Vec3, to: Vec3) {
        await Constants.waitForSeconds(this.timeDelay);
        while (true) {
            await this.shootFire(from, to);
            this.playEffect();
            await Constants.waitForSeconds(this.timeDelay);
        }
    }

    public shootFire(from: Vec3, to: Vec3): Promise<void> {
        return new Promise((resolve) => {
            if (this.pointShoot == null || this.explotionEffect == null) {
                resolve();
                return;
            }
            if (this._currentTween) {
                this._currentTween.stop();
            }
            this.explotionEffect.node.active = false;
            this.pointShoot.setPosition(from);
            this.pointShoot.active = true;
            this._currentTween = tween(this.pointShoot)
                .to(this.timeDuration, { position: to })
                .call(() => {
                    if (this.pointShoot) {
                        this.pointShoot.active = false;
                    }
                    this._currentTween = null;
                    resolve();
                })
                .start();
        });
    }

    playEffect() {
        if (this.explotionEffect) {
            this.explotionEffect.stopSystem();
            this.explotionEffect.resetSystem();
            this.explotionEffect.node.active = true;
        }
    }

}


