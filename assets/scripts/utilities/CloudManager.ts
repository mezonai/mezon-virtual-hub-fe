import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CloudManager')
export class CloudManager extends Component {

    @property([Node])
    clouds: Node[] = [];

    @property
    leftBound: number = -800;

    @property
    rightBound: number = 800;

    @property
    speed: number = 50;

    @property
    spacing: number = 400;

    @property
    minY: number = -200;

    @property
    maxY: number = 200;

    @property
    floatAmplitude: number = 20; // độ lượn

    @property
    floatSpeed: number = 2; // tốc độ lượn

    private time: number = 0;
    private baseYMap: Map<Node, number> = new Map();

    start() {
        this.clouds.forEach((cloud, index) => {

            let startX = this.leftBound - index * this.spacing;
            let randomY = this.getRandomY();

            cloud.setPosition(startX, randomY);

            this.baseYMap.set(cloud, randomY);
        });
    }

    update(dt: number) {

        this.time += dt;

        this.clouds.forEach((cloud) => {

            // Di chuyển ngang
            let newX = cloud.position.x + this.speed * dt;

            // Lượn sóng theo sin
            let baseY = this.baseYMap.get(cloud) || 0;
            let offsetY = Math.sin(this.time * this.floatSpeed + cloud.uuid.length) * this.floatAmplitude;

            let newY = baseY + offsetY;

            cloud.setPosition(newX, newY);

            // Nếu ra khỏi màn
            if (newX > this.rightBound) {

                let resetX = this.leftBound;

                let randomY = this.getRandomY();

                cloud.setPosition(resetX, randomY);
                this.baseYMap.set(cloud, randomY);
            }
        });
    }

    private getRandomY(): number {
        return this.minY + Math.random() * (this.maxY - this.minY);
    }
}